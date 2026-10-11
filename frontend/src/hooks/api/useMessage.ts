import { useCallback, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';
import { createMessage, getMessages, regenerateMessage, streamMessage } from '../../api/message.api';
import type { ApiResponse } from '../../types/api';
import type { ChatMessage, CreateMessageInput, CreateMessageResponse, MessageList, RegenerateMessageInput, RegenerateMessageResponse, StreamMessageContent, StreamMessageDone, StreamMessageInput, StreamMessageStart } from '../../types/message';
import API_ENDPOINTS from '../../constants/api-endpoints';

export function useMessageListData(conversationId: string | null) {
	const query = useInfiniteQuery<ApiResponse<MessageList>, Error>({
		queryKey: [API_ENDPOINTS.MESSAGE, conversationId, { limit: 10 }],
		queryFn: ({ pageParam }) => getMessages(conversationId as string, {
			page: Number(pageParam),
			limit: 10,
		}),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const pagination = lastPage.data?.pagination;
			return pagination?.has_next ? pagination.page + 1 : undefined;
		},
		enabled: Boolean(conversationId),
		refetchOnWindowFocus: false,
	});

	const messages = useMemo(() => {
		const messageMap = new Map<string, ChatMessage>();
		query.data?.pages.forEach((page) => {
			page.data?.items.forEach((message) => messageMap.set(message.id, message));
		});

		return Array.from(messageMap.values()).sort(
			(first, second) => first.sequence_number - second.sequence_number,
		);
	}, [query.data]);

	return {
		...query,
		messages,
	};
}

type CreateMessageOptions = Omit<
	UseMutationOptions<CreateMessageResponse, Error, CreateMessageInput>,
	'mutationFn'
>

export function useCreateMessage(options: CreateMessageOptions = {}) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createMessage,
		...options,
		onSuccess: (response, variables, onMutateResult, context) => {
			if (response.conversation) {
				queryClient.invalidateQueries({
					queryKey: [API_ENDPOINTS.CONVERSATION],
				});
			}

			const conversationId = response.conversation?.id ?? variables.conversationId;

			if (conversationId) {
				queryClient.invalidateQueries({
					queryKey: [API_ENDPOINTS.MESSAGE, conversationId],
				});
			}

			options.onSuccess?.(response, variables, onMutateResult, context);
		},
	});
}

type StreamMessageOptions = {
	onStart?: (data: StreamMessageStart) => void
	onContent?: (data: StreamMessageContent) => void
	onSuccess?: (data: StreamMessageDone) => void
	onError?: (error: Error) => void
}

export function useStreamMessage(options: StreamMessageOptions = {}) {
	const queryClient = useQueryClient();
	const controllerRef = useRef<AbortController | null>(null);
	const optionsRef = useRef(options);
	const [isStreaming, setIsStreaming] = useState(false);
	optionsRef.current = options;

	const start = useCallback(async (input: StreamMessageInput) => {
		if (controllerRef.current) return;

		const controller = new AbortController();
		controllerRef.current = controller;
		setIsStreaming(true);

		try {
			const result = await streamMessage(input, {
				onStart: (data) => optionsRef.current.onStart?.(data),
				onContent: (data) => optionsRef.current.onContent?.(data),
			}, controller.signal);

			optionsRef.current.onSuccess?.(result);
			await queryClient.invalidateQueries({
				queryKey: [API_ENDPOINTS.MESSAGE, input.conversationId],
			});
		} catch (error) {
			if (error instanceof Error) optionsRef.current.onError?.(error);
			else optionsRef.current.onError?.(new Error('Response generation failed'));
		} finally {
			controllerRef.current = null;
			setIsStreaming(false);
		}
	}, [queryClient]);

	const stop = useCallback(() => {
		controllerRef.current?.abort();
	}, []);

	return { start, stop, isStreaming };
}

type RegenerateMessageOptions = Omit<
	UseMutationOptions<RegenerateMessageResponse, Error, RegenerateMessageInput>,
	'mutationFn'
>

export function useRegenerateMessage(options: RegenerateMessageOptions = {}) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: regenerateMessage,
		...options,
		onSuccess: (response, variables, onMutateResult, context) => {
			queryClient.invalidateQueries({
				queryKey: [API_ENDPOINTS.MESSAGE, variables.conversationId],
			});

			options.onSuccess?.(response, variables, onMutateResult, context);
		},
	});
}
