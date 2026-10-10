import { useMutation } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';
import { createMessage } from '../../api/message.api';
import type { CreateMessageInput, CreateMessageResponse } from '../../types/message';

type CreateMessageOptions = Omit<
	UseMutationOptions<CreateMessageResponse, Error, CreateMessageInput>,
	'mutationFn'
>

export function useCreateMessage(options: CreateMessageOptions = {}) {
	return useMutation({
		mutationFn: createMessage,
		...options,
	});
}
