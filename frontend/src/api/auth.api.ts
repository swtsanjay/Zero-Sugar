import API_ENDPOINTS from '../constants/api-endpoints';
import type { ApiResponse } from '../types/api';
import type { CreateAccountInput, CreatedUser, LoginData, LoginInput } from '../types/auth';
import { apiClient } from './client';

export async function createAccount( input: CreateAccountInput ): Promise<ApiResponse<CreatedUser>> {
	const response = await apiClient.post<ApiResponse<CreatedUser>>(
		API_ENDPOINTS.CREATE_ACCOUNT,
		input
	)
	return response.data;
}

export async function login(input: LoginInput): Promise<ApiResponse<LoginData>> {
	const response = await apiClient.post<ApiResponse<LoginData>>(
		API_ENDPOINTS.LOGIN,
		input
	)
	return response.data;
}