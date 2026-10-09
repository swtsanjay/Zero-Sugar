import { useMutation, useQuery } from '@tanstack/react-query';
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { createAccount, login, refreshAccessToken } from '../../api/auth.api';
import type { ApiResponse } from '../../types/api';
import type { CreateAccountInput, CreatedUser, LoginData, LoginInput } from '../../types/auth';

type MutationCallbacks<TData> = {
	onSuccess?: (data: TData) => void
	onError?: (error: Error) => void
}

type MutationOptions<TData, TVariables> = Omit<
	UseMutationOptions<TData, Error, TVariables>,
	'mutationFn' | 'onSuccess' | 'onError'
>

export function useLogin(
	{ onSuccess, onError }: MutationCallbacks<ApiResponse<LoginData>> = {},
	options: MutationOptions<ApiResponse<LoginData>, LoginInput> = {},
) {
	return useMutation({
		mutationFn: login,
		onSuccess: (data) => onSuccess?.(data),
		onError: (error) => onError?.(error),
		...options,
	});
}

export function useCreateAccount(
	{ onSuccess, onError }: MutationCallbacks<ApiResponse<CreatedUser>> = {},
	options: MutationOptions<ApiResponse<CreatedUser>, CreateAccountInput> = {},
) {
	return useMutation({
		mutationFn: createAccount,
		onSuccess: (data) => onSuccess?.(data),
		onError: (error) => onError?.(error),
		...options,
	})
}

type RefreshQueryOptions = Omit<
	UseQueryOptions<ApiResponse<LoginData>, Error>,
	'queryKey' | 'queryFn'
>

export function useRefreshSession(options: RefreshQueryOptions = {}) {
	return useQuery({
		queryKey: ['auth', 'refresh-session'],
		queryFn: refreshAccessToken,
		retry: false,
		staleTime: Infinity,
		...options,
	});
}
