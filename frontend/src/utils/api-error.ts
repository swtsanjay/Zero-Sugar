import axios from 'axios'
import type { ApiErrorDetails, ApiResponse } from '../types/api'

export type ParsedApiError = {
	message: string
	code?: string
	details: ApiErrorDetails[]
}

export function parseApiError(error: unknown): ParsedApiError {
	if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
		const body = error.response?.data
		return {
			message: body?.message ?? (error.code === 'ECONNABORTED'
				? 'The request took too long. Please try again.'
				: 'Unable to connect to the server. Please try again.'),
			code: body?.error?.code,
			details: Array.isArray(body?.error?.details) ? body.error.details : [],
		}
	}

	return {
		message: 'Something went wrong. Please try again.',
		details: []
	}
}
