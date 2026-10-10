import { MessageOutlined, PlusOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Layout, Spin, Tag, Typography } from 'antd';
import { useState } from 'react';
import { useHealth } from '../../hooks/api/useHealth';
import { useConversations } from '../../hooks/api/useConversation';
import { useCreateMessage } from '../../hooks/api/useMessage';
import type { ThemePreference } from '../../hooks/useTheme';
import type { ChatMessage } from '../../types/message';
import { parseApiError } from '../../utils/api-error';
import { Link } from 'react-router-dom';
import ThemeSwitcher from '../theme/ThemeSwitcher';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

type ChatPageProps = {
	themePreference: ThemePreference
	onThemeChange: (value: ThemePreference) => void
}

export default function ChatPage({ themePreference, onThemeChange }: ChatPageProps) {
	const health = useHealth();
	const conversations = useConversations();
	const [content, setContent] = useState('');
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [sendError, setSendError] = useState<string | null>(null);
	const createMessage = useCreateMessage({
		onSuccess: (response) => {
			setMessages((current) => [
				...current,
				response.user_message,
				response.assistant_message,
			]);

			if (response.conversation) {
				setConversationId(response.conversation.id);
			}

			setContent('');
			setSendError(null);
		},
		onError: (error) => {
			setSendError(parseApiError(error).message);
		},
	});

	const submitMessage = () => {
		const trimmedContent = content.trim();

		if (!trimmedContent || createMessage.isPending) return;

		setSendError(null);
		createMessage.mutate({
			content: trimmedContent,
			conversationId,
		});
	};

	const startNewChat = () => {
		setMessages([]);
		setConversationId(null);
		setContent('');
		setSendError(null);
	};

	return (
		<Layout className="chat-layout min-h-screen">
			<Sider breakpoint="md" collapsedWidth="0" width={260} className="chat-sidebar border-r p-4">
				<Button block icon={<PlusOutlined />} size="large" onClick={startNewChat}>New chat</Button>
				<div className="mt-8 flex items-center gap-2 px-2 pb-3 text-slate-400">
					<MessageOutlined />
					<span>Conversations</span>
				</div>

				<div className="flex max-h-[calc(100vh-9rem)] flex-col gap-1 overflow-y-auto">
					{conversations.isLoading ? (
						<div className="flex justify-center py-8"><Spin size="small" /></div>
					) : conversations.isError ? (
						<Alert
							type="error"
							showIcon
							message="Couldn't load conversations"
							action={<Button size="small" onClick={() => conversations.refetch()}>Retry</Button>}
						/>
					) : conversations.data?.data.length ? (
						conversations.data.data.map((conversation) => (
							<div
								key={conversation.id}
								title={conversation.title}
								className={`conversation-item truncate rounded-lg px-3 py-2 text-sm ${conversation.id === conversationId ? 'conversation-item-active' : ''}`}
							>
								{conversation.title}
							</div>
						))
					) : (
						<Text type="secondary" className="px-2 py-4 text-sm">No conversations yet</Text>
					)}
				</div>
			</Sider>

			<Content className="chat-content flex min-h-screen flex-col">
				<header className="chat-header flex min-h-16 flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
					<Text strong>Zero Sugar Chat</Text>
					<div className="flex items-center gap-3">
						{health.isLoading ? <Spin size="small" /> : health.isSuccess ? (
							<Tag color="success">API and database connected</Tag>
						) : (
							<Tag color="error">Backend offline</Tag>
						)}
						<Link to="/profile">
							<Button shape="circle" aria-label="Open profile" icon={<UserOutlined />} />
						</Link>
						<ThemeSwitcher value={themePreference} onChange={onThemeChange} />
					</div>
				</header>

				<main className={`flex flex-1 flex-col px-4 py-8 sm:px-6 ${messages.length ? '' : 'items-center justify-center text-center'}`}>
					{messages.length === 0 ? (
						<>
							<div className="mb-5 rounded-2xl bg-emerald-500/10 p-4 text-3xl text-emerald-400"><MessageOutlined /></div>
							<Title level={2}>How can I help you today?</Title>
							<Text type="secondary" className="max-w-lg">
								Send your first message to begin a conversation.
							</Text>
						</>
					) : (
						<div className="mx-auto flex w-full max-w-3xl flex-col gap-4" data-conversation-id={conversationId ?? undefined}>
							{messages.map((message) => (
								<div
									key={message.id}
									className={message.role === 'user'
										? 'ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-emerald-500 px-4 py-3 text-left text-slate-950 shadow-sm'
										: 'mr-auto max-w-[85%] rounded-2xl rounded-bl-md bg-slate-800 px-4 py-3 text-left text-slate-100 shadow-sm'}
								>
									<p className="m-0 whitespace-pre-wrap break-words">{message.content}</p>
								</div>
							))}
						</div>
					)}
				</main>

				<footer className="mx-auto w-full max-w-3xl p-4 sm:p-6">
					{sendError ? <Alert className="mb-3" type="error" showIcon message={sendError} closable onClose={() => setSendError(null)} /> : null}
					<Input
						value={content}
						onChange={(event) => setContent(event.target.value)}
						onPressEnter={submitMessage}
						maxLength={500}
						disabled={createMessage.isPending}
						size="large"
						placeholder="Message Zero Sugar"
						suffix={(
							<Button
								type="primary"
								shape="circle"
								aria-label="Send message"
								disabled={!content.trim()}
								loading={createMessage.isPending}
								onClick={submitMessage}
								icon={<SendOutlined />}
							/>
						)}
						className="!py-3"
					/>
					<Text type="secondary" className="mt-2 block text-center text-xs">Press Enter to send</Text>
				</footer>
			</Content>
		</Layout>
	)
}
