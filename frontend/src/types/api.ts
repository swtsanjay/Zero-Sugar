export type ApiErrorDetails = {
	field?: string
	message: string
	type?: string
}

export type ApiResponse<T> = {
	success: boolean
	message: string
	data: T | null
	error: {
		code: string
		details?: ApiErrorDetails[] | null
	} | null
}
