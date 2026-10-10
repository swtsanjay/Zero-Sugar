import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { createMessage, getMessages } from '../../api/message.api';
import type { ApiResponse } from '../../types/api';
import type { ChatMessage, CreateMessageInput, CreateMessageResponse, MessageList } from '../../types/message';
import API_ENDPOINTS from '../../constants/api-endpoints';

type MessageListQuery = {
	page: number
	limit: number
}

type MessageListData = {
	data: Array<ChatMessage & { key: string }>
	qData: MessageListQuery & { total: number }
	setQData: React.Dispatch<React.SetStateAction<MessageListQuery>>
}

type MessageListOptions = Omit<
	UseQueryOptions<ApiResponse<MessageList>, Error, MessageListData>,
	'queryKey' | 'queryFn' | 'select' | 'initialData'
>

const initialMessageResponse: ApiResponse<MessageList> = {
	success: true,
	message: '',
	data: {
		items: [],
		pagination: {
			page: 1,
			limit: 100,
			total: 0,
			total_pages: 0,
			has_next: false,
			has_previous: false,
		},
	},
	error: null,
};

export function useMessageListData(
	conversationId: string | null,
	qData: MessageListQuery = { page: 1, limit: 100 },
	options: MessageListOptions = {},
) {
	const [queryParams, setQueryParams] = useState<MessageListQuery>({ ...qData });

	const query = useQuery<ApiResponse<MessageList>, Error, MessageListData>({
		queryKey: [API_ENDPOINTS.MESSAGE, conversationId, { ...queryParams, total: null }],
		queryFn: () => getMessages(conversationId as string, queryParams),
		select: (response) => ({
			data: (response.data?.items ?? []).map((message) => ({
				key: message.id,
				...message,
			})),
			qData: {
				...queryParams,
				total: response.data?.pagination.total ?? 0,
			},
			setQData: setQueryParams,
		}),
		enabled: Boolean(conversationId),
		refetchOnWindowFocus: false,
		initialDataUpdatedAt: 0,
		initialData: initialMessageResponse,
		...options,
	});

	return {
		...query,
		refetchWithQuery: (params: Partial<MessageListQuery>) => {
			setQueryParams((current) => ({ ...current, ...params }));
		},
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
