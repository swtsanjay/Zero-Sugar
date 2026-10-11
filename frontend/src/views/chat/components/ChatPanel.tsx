import { MessageOutlined } from '@ant-design/icons';
import { Alert, Button, Layout, Spin, Typography } from 'antd';
import type { ChatMessage } from '../../../types/message';
import AssistantMessageBubble from './AssistantMessageBubble';
import MessageComposer from './MessageComposer';
import UserMessageBubble from './UserMessageBubble';

const { Content } = Layout;
const { Title, Text } = Typography;

type ChatPanelProps = {
	conversationId: string | null
	messages: ChatMessage[]
	content: string
	isSending: boolean
	isHistoryLoading: boolean
	hasHistoryError: boolean
	sendError: string | null
	onContentChange: (value: string) => void
	onSend: () => void
	onRetryHistory: () => void
	onDismissSendError: () => void
}

export default function ChatPanel(props: ChatPanelProps) {
	const { conversationId, messages } = props;

	return (
		<Content className="chat-content flex h-full min-h-0 flex-col overflow-hidden">
			<main className={`flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-8 sm:px-6 ${messages.length ? '' : 'items-center justify-center text-center'}`}>
				{props.isHistoryLoading && conversationId && messages.length === 0 ? (
					<div className="grid flex-1 place-items-center"><Spin /></div>
				) : props.hasHistoryError && conversationId ? (
					<Alert type="error" showIcon message="Couldn't load this conversation" action={<Button size="small" onClick={props.onRetryHistory}>Retry</Button>} />
				) : messages.length === 0 ? (
					<>
						<div className="mb-5 rounded-2xl bg-emerald-500/10 p-4 text-3xl text-emerald-400"><MessageOutlined /></div>
						<Title level={2}>How can I help you today?</Title>
						<Text type="secondary" className="max-w-lg">Send your first message to begin a conversation.</Text>
					</>
				) : (
					<div className="mx-auto flex w-full max-w-3xl flex-col gap-4" data-conversation-id={conversationId ?? undefined}>
						{messages.map((message) => message.role === 'user' ? (
							<UserMessageBubble key={message.id} message={message} />
						) : (
							<AssistantMessageBubble key={message.id} message={message} />
						))}
					</div>
				)}
			</main>

			<MessageComposer
				value={props.content}
				isSending={props.isSending}
				error={props.sendError}
				onChange={props.onContentChange}
				onSend={props.onSend}
				onDismissError={props.onDismissSendError}
			/>
		</Content>
	);
}
