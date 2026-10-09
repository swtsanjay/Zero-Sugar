import API_ENDPOINTS from '../constants/api-endpoints';
import type { HealthResponse } from '../types/health';
import { apiClient } from './client';

export async function getHealth(): Promise<HealthResponse> {
	const response = await apiClient.get<HealthResponse>(API_ENDPOINTS.HEALTH);
	return response.data;
}
