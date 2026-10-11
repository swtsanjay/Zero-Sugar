const API_ENDPOINTS = {
	HEALTH: '/database-health',
	MODELS: '/public/get-allmodels',
	CREATE_ACCOUNT: '/user/create-account',
	LOGIN: '/user/login',
	REFRESH: '/user/refresh',
	PROFILE: '/user/profile',
	CHANGE_PASSWORD: '/user/change-password',
	MESSAGE: '/message',
	REGENERATE_MESSAGE: '/message/regenerate',
	START_CONVERSATION: '/message/start-conversation',
	CONVERSATION: '/conversation',
} as const

export default API_ENDPOINTS
