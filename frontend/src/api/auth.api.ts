import API_ENDPOINTS from '../constants/api-endpoints';
import type { ApiResponse } from '../types/api';
import type { CreateAccountInput, CreatedUser, LoginData, LoginInput } from '../types/auth';
import { setAccessToken } from '../utils/token-manager';
import { publicApiClient } from './client';

export async function createAccount( input: CreateAccountInput ): Promise<ApiResponse<CreatedUser>> {
	const response = await publicApiClient.post<ApiResponse<CreatedUser>>(
		API_ENDPOINTS.CREATE_ACCOUNT,
		input
	)
	return response.data;
}

export async function login(input: LoginInput): Promise<ApiResponse<LoginData>> {
	const response = await publicApiClient.post<ApiResponse<LoginData>>(
		API_ENDPOINTS.LOGIN,
		input
	)
	return response.data;
}

export async function refreshAccessToken(): Promise<ApiResponse<LoginData>> {
	const response = await publicApiClient.post<ApiResponse<LoginData>>(
		API_ENDPOINTS.REFRESH,
	)

	if (response.data.data) {
		setAccessToken(response.data.data.access_token);
	}

	return response.data;
}
