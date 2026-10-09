import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import { getHealth } from '../../api/health.api';
import API_ENDPOINTS from '../../constants/api-endpoints';
import type { HealthResponse } from '../../types/health';

type HealthQueryOptions = Omit<
	UseQueryOptions<HealthResponse, Error>,
	'queryKey' | 'queryFn'
>

export function useHealth(options: HealthQueryOptions = {}) {
	return useQuery({
		queryKey: [API_ENDPOINTS.HEALTH],
		queryFn: getHealth,
		retry: 1,
		refetchInterval: 30_000,
		...options,
	})
}
