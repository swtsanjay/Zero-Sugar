import axios from 'axios';
import { getAccessToken } from '../utils/token-manager';

const clientConfig = {
	baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000',
	headers: { 'Content-Type': 'application/json' },
	timeout: 10_000,
	withCredentials: true
};

export const publicApiClient = axios.create(clientConfig);
export const apiClient = axios.create(clientConfig);

apiClient.interceptors.request.use((config) => {
	const token = getAccessToken();

	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
});
