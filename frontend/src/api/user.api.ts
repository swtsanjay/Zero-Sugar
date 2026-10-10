import API_ENDPOINTS from '../constants/api-endpoints';
import type { ApiResponse } from '../types/api';
import type { UpdateProfileInput, UserProfile } from '../types/user';
import { apiClient } from './client';

export async function getProfile(): Promise<ApiResponse<UserProfile>> {
	const response = await apiClient.get<ApiResponse<UserProfile>>(API_ENDPOINTS.PROFILE);
	return response.data;
}

export async function updateProfile(input: UpdateProfileInput): Promise<ApiResponse<UserProfile>> {
	const response = await apiClient.put<ApiResponse<UserProfile>>(API_ENDPOINTS.PROFILE, input);
	return response.data;
}
