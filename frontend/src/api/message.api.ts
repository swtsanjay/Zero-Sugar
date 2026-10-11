import API_ENDPOINTS from '../constants/api-endpoints';
import type { ApiResponse } from '../types/api';
import type { CreateMessageInput, CreateMessageResponse, MessageList, RegenerateMessageInput, RegenerateMessageResponse } from '../types/message';
import { apiClient } from './client';

export async function createMessage(input: CreateMessageInput): Promise<CreateMessageResponse> {
	const endpoint = input.conversationId
		? `${API_ENDPOINTS.MESSAGE}/${input.conversationId}`
		: API_ENDPOINTS.START_CONVERSATION;

	const response = await apiClient.post<CreateMessageResponse>(endpoint, {
		content: input.content,
		model: input.model,
	});

	return response.data;
}

export async function getMessages(
	conversationId: string,
	params: { page: number; limit: number },
): Promise<ApiResponse<MessageList>> {
	const response = await apiClient.get<ApiResponse<MessageList>>(
		`${API_ENDPOINTS.MESSAGE}/${conversationId}`,
		{ params },
	);

	return response.data;
}

export async function regenerateMessage(input: RegenerateMessageInput): Promise<RegenerateMessageResponse> {
	const response = await apiClient.post<RegenerateMessageResponse>(
		`${API_ENDPOINTS.REGENERATE_MESSAGE}/${input.messageId}`,
	);

	return response.data;
}
