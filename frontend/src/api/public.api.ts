import API_ENDPOINTS from '../constants/api-endpoints';
import type { ApiResponse } from '../types/api';
import { publicApiClient } from './client';

export async function getAvailableModels(): Promise<ApiResponse<string[]>> {
	const response = await publicApiClient.get<ApiResponse<string[]>>(API_ENDPOINTS.MODELS);
	return response.data;
}
