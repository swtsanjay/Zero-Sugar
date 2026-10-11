import { MessageOutlined } from '@ant-design/icons';
import { Alert, Button, Layout, Spin, Typography } from 'antd';
import { useLayoutEffect, useRef } from 'react';
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
	model: string
	models: string[]
	isModelsLoading: boolean
	hasModelsError: boolean
	isSending: boolean
	regeneratingMessageId: string | null
	isHistoryLoading: boolean
	isLoadingOlder: boolean
	hasOlderMessages: boolean
	hasHistoryError: boolean
	sendError: string | null
	onContentChange: (value: string) => void
	onModelChange: (value: string) => void
	onSend: () => void
	onRegenerate: (messageId: string) => void
	onRetryHistory: () => void
	onLoadOlder: () => void
	onDismissSendError: () => void
}

export default function ChatPanel(props: ChatPanelProps) {
	const { conversationId, messages } = props;
	const scrollContainerRef = useRef<HTMLElement>(null);
	const previousLastMessageIdRef = useRef<string | null>(null);
	const previousLastContentLengthRef = useRef(0);
	const previousScrollHeightRef = useRef<number | null>(null);
	const wasLoadingOlderRef = useRef(false);
	const shouldFollowStreamRef = useRef(true);

	useLayoutEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) return;

		if (wasLoadingOlderRef.current && !props.isLoadingOlder && previousScrollHeightRef.current !== null) {
			container.scrollTop += container.scrollHeight - previousScrollHeightRef.current;
			previousScrollHeightRef.current = null;
		}

		const lastMessageId = messages[messages.length - 1]?.id ?? null;
		const lastMessageContentLength = messages[messages.length - 1]?.content.length ?? 0;
		if (lastMessageId && lastMessageId !== previousLastMessageIdRef.current && shouldFollowStreamRef.current) {
			container.scrollTo({ top: container.scrollHeight, behavior: previousLastMessageIdRef.current ? 'smooth' : 'auto' });
		} else if (
			lastMessageId
			&& lastMessageContentLength > previousLastContentLengthRef.current
			&& shouldFollowStreamRef.current
		) {
			container.scrollTop = container.scrollHeight;
		}

		previousLastMessageIdRef.current = lastMessageId;
		previousLastContentLengthRef.current = lastMessageContentLength;
		wasLoadingOlderRef.current = props.isLoadingOlder;
	}, [messages, props.isLoadingOlder]);

	const handleScroll = () => {
		const container = scrollContainerRef.current;
		if (!container) return;

		const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
		shouldFollowStreamRef.current = distanceFromBottom < 24;

		if (container.scrollTop > 80 || !props.hasOlderMessages || props.isLoadingOlder) return;

		previousScrollHeightRef.current = container.scrollHeight;
		wasLoadingOlderRef.current = true;
		props.onLoadOlder();
	};

	return (
		<Content className="chat-content flex h-full min-h-0 flex-col overflow-hidden">
			<main ref={scrollContainerRef} onScroll={handleScroll} className={`flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-8 sm:px-6 ${messages.length ? '' : 'items-center justify-center text-center'}`}>
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
						{props.isLoadingOlder ? <div className="flex justify-center py-2"><Spin size="small" /></div> : null}
						{messages.map((message) => message.role === 'user' ? (
							<UserMessageBubble key={message.id} message={message} />
						) : (
							<AssistantMessageBubble
								key={message.id}
								message={message}
								isRegenerating={props.regeneratingMessageId === message.id}
								disableRegenerate={props.regeneratingMessageId !== null || props.isSending}
								isOptimistic={message.id.startsWith('optimistic-assistant-') || (message.status === 'streaming' && !message.content)}
								onRegenerate={props.onRegenerate}
							/>
						))}
					</div>
				)}
			</main>

			<MessageComposer
				value={props.content}
				model={props.model}
				models={props.models}
				isModelsLoading={props.isModelsLoading}
				hasModelsError={props.hasModelsError}
				isSending={props.isSending}
				error={props.sendError}
				onChange={props.onContentChange}
				onModelChange={props.onModelChange}
				onSend={props.onSend}
				onDismissError={props.onDismissSendError}
			/>
		</Content>
	);
}
