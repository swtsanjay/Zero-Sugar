import axios from 'axios';
import { getAccessToken } from '../utils/token-manager';

export const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000',
	headers: { 'Content-Type': 'application/json' },
	timeout: 10_000,
	withCredentials: true
});

apiClient.interceptors.request.use((config) => {
	const token = getAccessToken();

	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
});
