export type UserProfile = {
	id: string
	name: string
	email: string
	is_active: boolean
}

export type UpdateProfileInput = {
	name: string
	email: string
}
