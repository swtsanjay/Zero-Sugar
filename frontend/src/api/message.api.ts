import API_ENDPOINTS from '../constants/api-endpoints';
import type { CreateMessageInput, CreateMessageResponse } from '../types/message';
import { apiClient } from './client';

export async function createMessage(input: CreateMessageInput): Promise<CreateMessageResponse> {
	const response = await apiClient.post<CreateMessageResponse>(API_ENDPOINTS.MESSAGE, input);
	return response.data;
}
