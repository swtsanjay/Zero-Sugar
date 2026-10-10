import { useMutation } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';
import { changePassword } from '../../api/user.api';
import type { ApiResponse } from '../../types/api';
import type { ChangePasswordInput } from '../../types/user';

type ChangePasswordOptions = Omit<
	UseMutationOptions<ApiResponse<null>, Error, ChangePasswordInput>,
	'mutationFn'
>

export function useChangePassword(options: ChangePasswordOptions = {}) {
	return useMutation({
		mutationFn: changePassword,
		...options,
	});
}
