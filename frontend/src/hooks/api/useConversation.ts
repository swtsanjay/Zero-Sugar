import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import { getConversations } from '../../api/conversation.api';
import API_ENDPOINTS from '../../constants/api-endpoints';
import type { ApiResponse } from '../../types/api';
import type { ConversationList } from '../../types/conversation';
import type { Conversation } from '../../types/message';


export type ConversationListQuery = {
	page: number
	limit: number
}

type ConversationListItem = Conversation & {
	key: string
}

type ConversationListData = {
	data: ConversationListItem[]
	qData: ConversationListQuery & { total: number }
	setQData: React.Dispatch<React.SetStateAction<ConversationListQuery>>
}

type ConversationListOptions = Omit<
	UseQueryOptions<ApiResponse<ConversationList>, Error, ConversationListData>,
	'queryKey' | 'queryFn' | 'select' | 'initialData'
>

const initialResponse: ApiResponse<ConversationList> = {
	success: true,
	message: '',
	data: {
		items: [],
		pagination: {
			page: 1,
			limit: 20,
			total: 0,
			total_pages: 0,
			has_next: false,
			has_previous: false,
		},
	},
	error: null,
};

export function useConversationListData(
	qData: ConversationListQuery = { page: 1, limit: 20 },
	options: ConversationListOptions = {},
) {
	const [queryParams, setQueryParams] = useState<ConversationListQuery>({ ...qData });

	const query = useQuery<ApiResponse<ConversationList>, Error, ConversationListData>({
		queryKey: [API_ENDPOINTS.CONVERSATION, { ...queryParams, total: null }],
		queryFn: () => getConversations(queryParams),
		select: (response) => ({
			data: (response.data?.items ?? []).map((conversation) => ({
				key: conversation.id,
				...conversation,
			})),
			qData: {
				...queryParams,
				total: response.data?.pagination.total ?? 0,
			},
			setQData: setQueryParams,
		}),
		refetchOnWindowFocus: false,
		initialDataUpdatedAt: 0,
		initialData: initialResponse,
		...options,
	});

	return {
		...query,
		refetchWithQuery: (params: Partial<ConversationListQuery>) => {
			setQueryParams((current) => ({ ...current, ...params }));
		},
	};
}

export const useConversations = useConversationListData;
