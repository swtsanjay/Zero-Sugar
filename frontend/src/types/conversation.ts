import type { Conversation } from './message';

export type Pagination = {
	page: number
	limit: number
	total: number
	total_pages: number
	has_next: boolean
	has_previous: boolean
}

export type ConversationList = {
	items: Conversation[]
	pagination: Pagination
}
