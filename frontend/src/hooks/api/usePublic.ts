import { useQuery } from '@tanstack/react-query';
import { getAvailableModels } from '../../api/public.api';
import API_ENDPOINTS from '../../constants/api-endpoints';

export function useAvailableModels() {
	return useQuery({
		queryKey: [API_ENDPOINTS.MODELS],
		queryFn: getAvailableModels,
		select: (response) => response.data ?? [],
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});
}
