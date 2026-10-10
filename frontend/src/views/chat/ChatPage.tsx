import { Layout } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateMessage, useMessageListData } from '../../hooks/api/useMessage';
import type { ChatMessage } from '../../types/message';
import { parseApiError } from '../../utils/api-error';
import ChatPanel from './components/ChatPanel';
import ConversationSidebar from './components/ConversationSidebar';

export default function ChatPage() {
	const navigate = useNavigate();
	const { conversationId: routeConversationId } = useParams<{ conversationId: string }>();
	const conversationId = routeConversationId ?? null;
	const messageHistory = useMessageListData(conversationId);
	const [content, setContent] = useState('');
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [sendError, setSendError] = useState<string | null>(null);

	useEffect(() => {
		setMessages(conversationId ? (messageHistory.data?.data ?? []) : []);
	}, [conversationId, messageHistory.data?.data]);

	const createMessage = useCreateMessage({
		onSuccess: (response) => {
			setMessages((current) => [...current, response.user_message, response.assistant_message]);

			if (response.conversation) {
				navigate(`/chat/${response.conversation.id}`, { replace: true });
			}

			setContent('');
			setSendError(null);
		},
		onError: (error) => setSendError(parseApiError(error).message),
	});

	const submitMessage = () => {
		const trimmedContent = content.trim();

		if (!trimmedContent || createMessage.isPending) return;

		setSendError(null);
		createMessage.mutate({ content: trimmedContent, conversationId });
	};

	const startNewChat = () => {
		setMessages([]);
		setContent('');
		setSendError(null);
		navigate('/chat');
	};

	return (
		<Layout className="chat-layout min-h-[calc(100vh-4rem)]">
			<ConversationSidebar
				activeConversationId={conversationId}
				onNewChat={startNewChat}
				onSelectConversation={(id) => navigate(`/chat/${id}`)}
			/>
			<ChatPanel
				conversationId={conversationId}
				messages={messages}
				content={content}
				isSending={createMessage.isPending}
				isHistoryLoading={messageHistory.isFetching}
				hasHistoryError={messageHistory.isError}
				sendError={sendError}
				onContentChange={setContent}
				onSend={submitMessage}
				onRetryHistory={() => messageHistory.refetch()}
				onDismissSendError={() => setSendError(null)}
			/>
		</Layout>
	);
}
