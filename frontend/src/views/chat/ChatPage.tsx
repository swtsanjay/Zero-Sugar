import { Layout } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMessageListData, useStreamMessage, useStreamRegenerateMessage } from '../../hooks/api/useMessage';
import { useAvailableModels } from '../../hooks/api/usePublic';
import type { ChatMessage } from '../../types/message';
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
	const [regeneratingMessageId, setRegeneratingMessageId] = useState<string | null>(null);
	const optimisticMessageIds = useRef<{ userId: string; assistantId: string } | null>(null);
	const pendingStreamRef = useRef<{ content: string; started: boolean } | null>(null);

	useEffect(() => {
		const models = availableModels.data ?? [];
		setSelectedModel((current) => current || models[0] || '');
	}, [availableModels.data]);

	useEffect(() => {
		const latestMessage = messageHistory.messages[messageHistory.messages.length - 1];
		if (latestMessage?.model && availableModels.data?.includes(latestMessage.model)) {
			setSelectedModel(latestMessage.model);
		}
	}, [conversationId, messageHistory.dataUpdatedAt, availableModels.data]);

	const streamedMessage = useStreamMessage({
		onStart: (response) => {
			const optimisticIds = optimisticMessageIds.current;
			if (pendingStreamRef.current) pendingStreamRef.current.started = true;

			setMessages((current) => [
				...current.filter((message) => (
					message.id !== optimisticIds?.userId && message.id !== optimisticIds?.assistantId
				)),
				response.user_message,
				response.assistant_message,
			]);
			if (response.conversation) {
				navigate(`/chat/${response.conversation.id}`, { replace: true });
			}
		},
		onContent: ({ message_id, content: chunk }) => {
			setMessages((current) => current.map((message) => (
				message.id === message_id
					? { ...message, content: message.content + chunk, status: 'streaming' }
					: message
			)));
		},
		onSuccess: (response) => {
			setMessages((current) => current.map((message) => {
				if (message.id === response.user_message.id) return response.user_message;
				if (message.id === response.assistant_message.id) return response.assistant_message;
				return message;
			}));
			optimisticMessageIds.current = null;
			pendingStreamRef.current = null;
			setSendError(null);
		},
		onCancelled: () => {
			const pendingStream = pendingStreamRef.current;
			const optimisticIds = optimisticMessageIds.current;

			if (!pendingStream?.started) {
				setMessages((current) => current.filter((message) => (
					message.id !== optimisticIds?.userId && message.id !== optimisticIds?.assistantId
				)));
				if (pendingStream) setContent(pendingStream.content);
			} else {
				setMessages((current) => current.map((message) => (
					message.role === 'assistant' && message.status === 'streaming'
						? { ...message, status: 'cancelled' }
						: message
				)));
			}

			optimisticMessageIds.current = null;
			pendingStreamRef.current = null;
			setSendError(null);
		},
		onError: (error) => {
			const pendingStream = pendingStreamRef.current;
			const optimisticIds = optimisticMessageIds.current;

			if (!pendingStream?.started) {
				setMessages((current) => current.filter((message) => (
					message.id !== optimisticIds?.userId && message.id !== optimisticIds?.assistantId
				)));
				if (pendingStream) setContent(pendingStream.content);
			} else {
				setMessages((current) => current.map((message) => (
					message.role === 'assistant' && message.status === 'streaming'
						? { ...message, status: 'failed' }
						: message
				)));
			}

			optimisticMessageIds.current = null;
			pendingStreamRef.current = null;
			setSendError(error.message);
		},
	});

	const streamedRegeneration = useStreamRegenerateMessage({
		onStart: ({ assistant_message }) => {
			setMessages((current) => current.map((message) => (
				message.id === assistant_message.id ? assistant_message : message
			)));
		},
		onContent: ({ message_id, content: chunk }) => {
			setMessages((current) => current.map((message) => (
				message.id === message_id
					? { ...message, content: message.content + chunk, status: 'streaming' }
					: message
			)));
		},
		onSuccess: ({ assistant_message }) => {
			setMessages((current) => current.map((message) => (
				message.id === assistant_message.id ? assistant_message : message
			)));
			setRegeneratingMessageId(null);
			setSendError(null);
		},
		onCancelled: () => {
			setMessages((current) => current.map((message) => (
				message.id === regeneratingMessageId ? { ...message, status: 'cancelled' } : message
			)));
			setRegeneratingMessageId(null);
			setSendError(null);
		},
		onError: (error) => {
			setMessages((current) => current.map((message) => (
				message.id === regeneratingMessageId ? { ...message, status: 'failed' } : message
			)));
			setRegeneratingMessageId(null);
			setSendError(error.message);
		},
	});

	useEffect(() => {
		if (!conversationId) {
			if (!optimisticMessageIds.current) setMessages([]);
			return;
		}

		if (messageHistory.isSuccess && !streamedMessage.isStreaming && !streamedRegeneration.isStreaming) {
			setMessages(messageHistory.messages);
		}
	}, [conversationId, messageHistory.dataUpdatedAt, streamedMessage.isStreaming, streamedRegeneration.isStreaming]);

	const submitMessage = () => {
		const trimmedContent = content.trim();

		if (!trimmedContent || !selectedModel || streamedMessage.isStreaming || streamedRegeneration.isStreaming) return;

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

		pendingStreamRef.current = { content: trimmedContent, started: false };
		void streamedMessage.start({
			conversationId,
			content: trimmedContent,
			model: selectedModel,
		});
	};

	const regenerateAssistantMessage = (messageId: string) => {
		if (!conversationId || !selectedModel || streamedRegeneration.isStreaming || streamedMessage.isStreaming) return;

		setSendError(null);
		setRegeneratingMessageId(messageId);
		void streamedRegeneration.start({ messageId, conversationId, model: selectedModel });
	};

	const stopGeneration = () => {
		if (streamedMessage.isStreaming) streamedMessage.stop();
		if (streamedRegeneration.isStreaming) streamedRegeneration.stop();
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
				isSending={streamedMessage.isStreaming || streamedRegeneration.isStreaming}
				regeneratingMessageId={regeneratingMessageId}
				isHistoryLoading={messageHistory.isLoading}
				isLoadingOlder={messageHistory.isFetchingNextPage}
				hasOlderMessages={Boolean(messageHistory.hasNextPage)}
				hasHistoryError={messageHistory.isError}
				sendError={sendError}
				onContentChange={setContent}
				onModelChange={setSelectedModel}
				onSend={submitMessage}
				onStop={stopGeneration}
				onRegenerate={regenerateAssistantMessage}
				onRetryHistory={() => messageHistory.refetch()}
				onLoadOlder={() => { void messageHistory.fetchNextPage(); }}
				onDismissSendError={() => setSendError(null)}
			/>
		</Layout>
	);
}
