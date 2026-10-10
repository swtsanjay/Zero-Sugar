const API_ENDPOINTS = {
	HEALTH: '/database-health',
	CREATE_ACCOUNT: '/user/create-account',
	LOGIN: '/user/login',
	REFRESH: '/user/refresh',
	PROFILE: '/user/profile',
	CHANGE_PASSWORD: '/user/change-password',
	MESSAGE: '/message',
	START_CONVERSATION: '/message/start-conversation',
} as const

export default API_ENDPOINTS
