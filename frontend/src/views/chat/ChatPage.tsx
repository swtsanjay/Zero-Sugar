import { Layout } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateMessage, useMessageListData, useRegenerateMessage } from '../../hooks/api/useMessage';
import { useAvailableModels } from '../../hooks/api/usePublic';
import type { ChatMessage } from '../../types/message';
import { parseApiError } from '../../utils/api-error';
import ChatPanel from './components/ChatPanel';
import ConversationSidebar from './components/ConversationSidebar';

export default function ChatPage() {
	const navigate = useNavigate();
	const { conversationId: routeConversationId } = useParams<{ conversationId: string }>();
	const conversationId = routeConversationId ?? null;
	const messageHistory = useMessageListData(conversationId);
	const availableModels = useAvailableModels();
	const [content, setContent] = useState('');
	const [selectedModel, setSelectedModel] = useState('');
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [sendError, setSendError] = useState<string | null>(null);
	const optimisticMessageIds = useRef<{ userId: string; assistantId: string } | null>(null);

	useEffect(() => {
		const models = availableModels.data ?? [];
		setSelectedModel((current) => current || models[0] || '');
	}, [availableModels.data]);

	const createMessage = useCreateMessage({
		onSuccess: (response) => {
			const optimisticIds = optimisticMessageIds.current;
			setMessages((current) => [
				...current.filter((message) => (
					message.id !== optimisticIds?.userId && message.id !== optimisticIds?.assistantId
				)),
				response.user_message,
				response.assistant_message,
			]);
			optimisticMessageIds.current = null;

			if (response.conversation) {
				navigate(`/chat/${response.conversation.id}`, { replace: true });
			}

			setSendError(null);
		},
		onError: (error, variables) => {
			const optimisticIds = optimisticMessageIds.current;
			setMessages((current) => current.filter((message) => (
				message.id !== optimisticIds?.userId && message.id !== optimisticIds?.assistantId
			)));
			optimisticMessageIds.current = null;
			setContent(variables.content);
			setSendError(parseApiError(error).message);
		},
	});

	useEffect(() => {
		if (!conversationId) {
			if (!optimisticMessageIds.current) setMessages([]);
			return;
		}

		if (messageHistory.isSuccess) {
			setMessages(messageHistory.messages);
		}
	}, [conversationId, messageHistory.dataUpdatedAt]);

	const regenerateMessage = useRegenerateMessage({
		onSuccess: (response) => {
			setMessages((current) => current.map((message) => (
				message.id === response.assistant_message.id
					? response.assistant_message
					: message
			)));
			setSendError(null);
		},
		onError: (error) => setSendError(parseApiError(error).message),
	});

	const submitMessage = () => {
		const trimmedContent = content.trim();

		if (!trimmedContent || !selectedModel || createMessage.isPending) return;

		const now = new Date().toISOString();
		const optimisticUserId = `optimistic-user-${crypto.randomUUID()}`;
		const optimisticAssistantId = `optimistic-assistant-${crypto.randomUUID()}`;
		const nextSequenceNumber = (messages[messages.length - 1]?.sequence_number ?? 0) + 1;
		optimisticMessageIds.current = {
			userId: optimisticUserId,
			assistantId: optimisticAssistantId,
		};

		setMessages((current) => [
			...current,
			{
				id: optimisticUserId,
				conversation_id: conversationId ?? '',
				role: 'user',
				content: trimmedContent,
				sequence_number: nextSequenceNumber,
				execution_time: 0,
				status: 'pending',
				model: selectedModel,
				tokens: null,
				created_at: now,
				updated_at: now,
			},
			{
				id: optimisticAssistantId,
				conversation_id: conversationId ?? '',
				role: 'assistant',
				content: '',
				sequence_number: nextSequenceNumber + 1,
				execution_time: 0,
				status: 'pending',
				model: selectedModel,
				tokens: null,
				created_at: now,
				updated_at: now,
			},
		]);
		setContent('');
		setSendError(null);
		createMessage.mutate({ content: trimmedContent, model: selectedModel, conversationId });
	};

	const regenerateAssistantMessage = (messageId: string) => {
		if (!conversationId || !selectedModel || regenerateMessage.isPending) return;

		setSendError(null);
		regenerateMessage.mutate({ messageId, conversationId, model: selectedModel });
	};

	const startNewChat = () => {
		setMessages([]);
		setContent('');
		setSendError(null);
		navigate('/chat');
	};

	return (
		<Layout className="chat-layout h-[calc(100dvh-4rem)] min-h-0 overflow-hidden">
			<ConversationSidebar
				activeConversationId={conversationId}
				onNewChat={startNewChat}
				onSelectConversation={(id) => navigate(`/chat/${id}`)}
			/>
			<ChatPanel
				conversationId={conversationId}
				messages={messages}
				content={content}
				model={selectedModel}
				models={availableModels.data ?? []}
				isModelsLoading={availableModels.isLoading}
				hasModelsError={availableModels.isError}
				isSending={createMessage.isPending}
				regeneratingMessageId={regenerateMessage.isPending ? regenerateMessage.variables?.messageId ?? null : null}
				isHistoryLoading={messageHistory.isLoading}
				isLoadingOlder={messageHistory.isFetchingNextPage}
				hasOlderMessages={Boolean(messageHistory.hasNextPage)}
				hasHistoryError={messageHistory.isError}
				sendError={sendError}
				onContentChange={setContent}
				onModelChange={setSelectedModel}
				onSend={submitMessage}
				onRegenerate={regenerateAssistantMessage}
				onRetryHistory={() => messageHistory.refetch()}
				onLoadOlder={() => { void messageHistory.fetchNextPage(); }}
				onDismissSendError={() => setSendError(null)}
			/>
		</Layout>
	);
}
