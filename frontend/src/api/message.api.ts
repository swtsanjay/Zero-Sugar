import API_ENDPOINTS from '../constants/api-endpoints';
import type { ApiResponse } from '../types/api';
import type { CreateMessageInput, CreateMessageResponse, MessageList, RegenerateMessageInput, RegenerateMessageResponse, StreamMessageContent, StreamMessageDone, StreamMessageInput, StreamMessageStart } from '../types/message';
import { apiClient } from './client';
import { getAccessToken } from '../utils/token-manager';

type StreamMessageHandlers = {
	onStart: (data: StreamMessageStart) => void
	onContent: (data: StreamMessageContent) => void
}

export async function createMessage(input: CreateMessageInput): Promise<CreateMessageResponse> {
	const endpoint = input.conversationId
		? `${API_ENDPOINTS.MESSAGE}/${input.conversationId}`
		: API_ENDPOINTS.START_CONVERSATION;

	const response = await apiClient.post<CreateMessageResponse>(endpoint, {
		content: input.content,
		model: input.model,
	});

	return response.data;
}

export async function getMessages(
	conversationId: string,
	params: { page: number; limit: number },
): Promise<ApiResponse<MessageList>> {
	const response = await apiClient.get<ApiResponse<MessageList>>(
		`${API_ENDPOINTS.MESSAGE}/${conversationId}`,
		{ params },
	);

	return response.data;
}

export async function regenerateMessage(input: RegenerateMessageInput): Promise<RegenerateMessageResponse> {
	const response = await apiClient.post<RegenerateMessageResponse>(
		`${API_ENDPOINTS.REGENERATE_MESSAGE}/${input.messageId}`,
		{ model: input.model },
	);

	return response.data;
}

export async function streamMessage(
	input: StreamMessageInput,
	handlers: StreamMessageHandlers,
	signal?: AbortSignal,
): Promise<StreamMessageDone> {
	const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
	const token = getAccessToken();
	const response = await fetch(`${baseUrl}${API_ENDPOINTS.MESSAGE}/${input.conversationId}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'text/event-stream',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		body: JSON.stringify({ content: input.content, model: input.model }),
		signal,
	});

	if (!response.ok) {
		throw new Error(`Unable to stream response (${response.status})`);
	}

	if (!response.body) {
		throw new Error('The server did not return a response stream');
	}

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let buffer = '';
	let completedMessage: StreamMessageDone | null = null;

	const processEvent = (rawEvent: string) => {
		const lines = rawEvent.split(/\r?\n/);
		const event = lines.find((line) => line.startsWith('event:'))?.slice(6).trim();
		const dataText = lines
			.filter((line) => line.startsWith('data:'))
			.map((line) => line.slice(5).trimStart())
			.join('\n');

		if (!event || !dataText) return;
		const data: unknown = JSON.parse(dataText);

		if (event === 'start') handlers.onStart(data as StreamMessageStart);
		if (event === 'content') handlers.onContent(data as StreamMessageContent);
		if (event === 'done') completedMessage = data as StreamMessageDone;
		if (event === 'error') {
			const errorData = data as { message?: string };
			throw new Error(errorData.message ?? 'Response generation failed');
		}
	};

	while (true) {
		const { value, done } = await reader.read();
		buffer += decoder.decode(value, { stream: !done });
		const events = buffer.split(/\r?\n\r?\n/);
		buffer = events.pop() ?? '';
		events.forEach(processEvent);

		if (done) break;
	}

	if (buffer.trim()) processEvent(buffer);
	if (!completedMessage) throw new Error('The response stream ended before completion');
	return completedMessage;
}
