import { MessageOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Layout, Pagination, Spin, Typography } from 'antd';
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
	const conversations = useConversations({ page: 1, limit: 100 });
	const queryData = conversations.data?.qData;

	return (
		<Sider breakpoint="md" collapsedWidth="0" width={260} className="chat-sidebar h-full overflow-hidden border-r p-4">
			<Button block icon={<PlusOutlined />} size="large" onClick={onNewChat}>New chat</Button>
			<div className="mt-8 flex items-center gap-2 px-2 pb-3 text-slate-400">
				<MessageOutlined />
				<span>Conversations</span>
			</div>
			<div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
				{conversations.isLoading ? (
					<div className="flex justify-center py-8"><Spin size="small" /></div>
				) : conversations.isError ? (
					<Alert type="error" showIcon message="Couldn't load conversations" action={<Button size="small" onClick={() => conversations.refetch()}>Retry</Button>} />
				) : conversations.data?.data.length ? (
					conversations.data.data.map((conversation) => (
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
			</div>
			{queryData && queryData.total > queryData.limit ? (
				<Pagination
					className="mt-3"
					simple
					size="small"
					current={queryData.page}
					pageSize={queryData.limit}
					total={queryData.total}
					onChange={(page) => conversations.refetchWithQuery({ page })}
				/>
			) : null}
		</Sider>
	);
}
