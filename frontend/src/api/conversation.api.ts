import API_ENDPOINTS from '../constants/api-endpoints';
import type { ApiResponse } from '../types/api';
import type { ConversationList } from '../types/conversation';
import { apiClient } from './client';

export async function getConversations(
	params: { page: number; limit: number },
): Promise<ApiResponse<ConversationList>> {
	const response = await apiClient.get<ApiResponse<ConversationList>>(
		API_ENDPOINTS.CONVERSATION,
		{ params },
	);

	return response.data;
}
