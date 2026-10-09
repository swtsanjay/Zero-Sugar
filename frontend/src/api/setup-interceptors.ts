import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { refreshAccessToken } from './auth.api';
import { apiClient } from './client';
import { clearAccessToken, setAccessToken } from '../utils/token-manager';

type RetryableRequest = InternalAxiosRequestConfig & {
	_retry?: boolean
}

let refreshPromise: Promise<string> | null = null;
let interceptorsConfigured = false;

function requestNewAccessToken() {
	if (!refreshPromise) {
		refreshPromise = refreshAccessToken()
			.then((response) => {
				if (!response.data) throw new Error('Refresh response did not include an access token');
				return response.data.access_token;
			})
			.finally(() => {
				refreshPromise = null;
			});
	}

	return refreshPromise;
}

export function setupApiInterceptors() {
	if (interceptorsConfigured) return;
	interceptorsConfigured = true;

	apiClient.interceptors.response.use(
		(response) => response,
		async (error: AxiosError) => {
			const originalRequest = error.config as RetryableRequest | undefined;

			if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
				return Promise.reject(error);
			}

			originalRequest._retry = true;

			try {
				const newAccessToken = await requestNewAccessToken();
				setAccessToken(newAccessToken);
				originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
				return apiClient(originalRequest);
			} catch (refreshError) {
				clearAccessToken();
				window.dispatchEvent(new Event('auth:expired'));
				return Promise.reject(refreshError);
			}
		},
	);
}
