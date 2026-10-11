import type { Conversation } from '../../../types/message';

type ConversationItemProps = {
	conversation: Conversation
	isActive: boolean
	onSelect: (conversationId: string) => void
}

export default function ConversationItem({ conversation, isActive, onSelect }: ConversationItemProps) {
	return (
		<button
			type="button"
			title={conversation.title}
			onClick={() => onSelect(conversation.id)}
			className={`conversation-item w-full shrink-0 truncate rounded-lg px-3 py-2 text-left text-sm ${isActive ? 'conversation-item-active' : ''}`}
		>
			{conversation.title}
		</button>
	);
}
