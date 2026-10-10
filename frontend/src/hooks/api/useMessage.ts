import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';
import { createMessage } from '../../api/message.api';
import type { CreateMessageInput, CreateMessageResponse } from '../../types/message';
import API_ENDPOINTS from '../../constants/api-endpoints';

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

			options.onSuccess?.(response, variables, onMutateResult, context);
		},
	});
}
