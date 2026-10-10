import API_ENDPOINTS from '../constants/api-endpoints';
import type { CreateMessageInput, CreateMessageResponse } from '../types/message';
import { apiClient } from './client';

export async function createMessage(input: CreateMessageInput): Promise<CreateMessageResponse> {
	const endpoint = input.conversationId
		? `${API_ENDPOINTS.MESSAGE}/${input.conversationId}`
		: API_ENDPOINTS.START_CONVERSATION;

	const response = await apiClient.post<CreateMessageResponse>(endpoint, {
		content: input.content,
	});

	return response.data;
}
