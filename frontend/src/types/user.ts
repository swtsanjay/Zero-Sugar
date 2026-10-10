export type UserProfile = {
	id: string
	name: string
	username: string | null
	email: string
	is_active: boolean
}

export type UpdateProfileInput = {
	name: string
	username: string
	email: string
}
