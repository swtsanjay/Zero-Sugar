import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getConversations } from '../../api/conversation.api';
import API_ENDPOINTS from '../../constants/api-endpoints';
import type { Conversation } from '../../types/message';

const CONVERSATION_PAGE_SIZE = 20;

export function useConversationListData() {
	const query = useInfiniteQuery({
		queryKey: [API_ENDPOINTS.CONVERSATION, { limit: CONVERSATION_PAGE_SIZE }],
		queryFn: ({ pageParam }) => getConversations({
			page: Number(pageParam),
			limit: CONVERSATION_PAGE_SIZE,
		}),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const pagination = lastPage.data?.pagination;
			return pagination?.has_next ? pagination.page + 1 : undefined;
		},
		refetchOnWindowFocus: false,
	});

	const conversations = useMemo(() => {
		const conversationMap = new Map<string, Conversation & { key: string }>();

		query.data?.pages.forEach((page) => {
			page.data?.items.forEach((conversation) => {
				conversationMap.set(conversation.id, {
					key: conversation.id,
					...conversation,
				});
			});
		});

		return Array.from(conversationMap.values());
	}, [query.data]);

	return {
		...query,
		conversations,
	};
}

export const useConversations = useConversationListData;
