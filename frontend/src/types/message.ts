import type { Pagination } from './conversation';

export type CreateMessageInput = {
	content: string
	conversationId?: string | null
}

export type Conversation = {
	id: string
	user_id: string
	title: string
	model: string
	created_at: string
	updated_at: string
	deleted_at: string | null
}

export type ChatMessage = {
	id: string
	conversation_id: string
	role: 'system' | 'user' | 'assistant'
	content: string
	sequence_number: number
	execution_time: number
	status: 'pending' | 'streaming' | 'completed' | 'failed' | 'cancelled'
	model: string | null
	prompt_tokens: number | null
	completion_tokens: number | null
	created_at: string
	updated_at: string
}

export type CreateMessageResponse = {
	conversation?: Conversation
	user_message: ChatMessage
	assistant_message: ChatMessage
}

export type RegenerateMessageInput = {
	messageId: string
	conversationId: string
}

export type RegenerateMessageResponse = {
	assistant_message: ChatMessage
}

export type MessageList = {
	items: ChatMessage[]
	pagination: Pagination
}
