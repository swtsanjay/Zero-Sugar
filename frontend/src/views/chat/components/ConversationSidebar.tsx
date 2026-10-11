import { MessageOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Layout, Spin, Typography } from 'antd';
import { useConversations } from '../../../hooks/api/useConversation';
import ConversationItem from './ConversationItem';

const { Sider } = Layout;
const { Text } = Typography;

type ConversationSidebarProps = {
	activeConversationId: string | null
	onNewChat: () => void
	onSelectConversation: (conversationId: string) => void
}

export default function ConversationSidebar({ activeConversationId, onNewChat, onSelectConversation }: ConversationSidebarProps) {
	const conversations = useConversations();

	const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
		const container = event.currentTarget;
		const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;

		if (distanceFromBottom < 80 && conversations.hasNextPage && !conversations.isFetchingNextPage) {
			void conversations.fetchNextPage();
		}
	};

	return (
		<Sider breakpoint="md" collapsedWidth="0" width={260} className="chat-sidebar h-full overflow-hidden border-r p-4">
			<Button block icon={<PlusOutlined />} size="large" onClick={onNewChat}>New chat</Button>
			<div className="mt-8 flex items-center gap-2 px-2 pb-3 text-slate-400">
				<MessageOutlined />
				<span>Conversations</span>
			</div>
			<div className="conversation-scroll flex min-h-0 flex-1 flex-col gap-1 overflow-y-scroll overscroll-contain" onScroll={handleScroll}>
				{conversations.isLoading ? (
					<div className="flex justify-center py-8"><Spin size="small" /></div>
				) : conversations.isError ? (
					<Alert type="error" showIcon message="Couldn't load conversations" action={<Button size="small" onClick={() => conversations.refetch()}>Retry</Button>} />
				) : conversations.conversations.length ? (
					conversations.conversations.map((conversation) => (
						<ConversationItem
							key={conversation.key}
							conversation={conversation}
							isActive={conversation.id === activeConversationId}
							onSelect={onSelectConversation}
						/>
					))
				) : (
					<Text type="secondary" className="px-2 py-4 text-sm">No conversations yet</Text>
				)}
				{conversations.isFetchingNextPage ? (
					<div className="flex justify-center py-3"><Spin size="small" /></div>
				) : null}
			</div>
		</Sider>
	);
}
