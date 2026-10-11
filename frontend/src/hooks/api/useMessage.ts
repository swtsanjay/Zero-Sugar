import { useMemo } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';
import { createMessage, getMessages, regenerateMessage } from '../../api/message.api';
import type { ApiResponse } from '../../types/api';
import type { ChatMessage, CreateMessageInput, CreateMessageResponse, MessageList, RegenerateMessageInput, RegenerateMessageResponse } from '../../types/message';
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
