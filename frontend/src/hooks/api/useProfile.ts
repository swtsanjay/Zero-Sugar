import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { getProfile, updateProfile } from '../../api/user.api';
import API_ENDPOINTS from '../../constants/api-endpoints';
import type { ApiResponse } from '../../types/api';
import type { UpdateProfileInput, UserProfile } from '../../types/user';

type ProfileQueryOptions = Omit<
	UseQueryOptions<ApiResponse<UserProfile>, Error, UserProfile | null>,
	'queryKey' | 'queryFn' | 'select'
>

export function useProfile(options: ProfileQueryOptions = {}) {
	return useQuery({
		queryKey: [API_ENDPOINTS.PROFILE],
		queryFn: getProfile,
		select: (response) => response.data,
		retry: false,
		staleTime: 5 * 60 * 1000,
		...options,
	});
}

type UpdateProfileOptions = Omit<
	UseMutationOptions<ApiResponse<UserProfile>, Error, UpdateProfileInput>,
	'mutationFn'
>

export function useUpdateProfile(options: UpdateProfileOptions = {}) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateProfile,
		...options,
		onSuccess: (response, variables, onMutateResult, context) => {
			queryClient.setQueryData([API_ENDPOINTS.PROFILE], response);
			options.onSuccess?.(response, variables, onMutateResult, context);
		},
	});
}
