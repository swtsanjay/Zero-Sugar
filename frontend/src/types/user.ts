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

export type ChangePasswordInput = {
	current_password: string
	new_password: string
}

export type ChangePasswordFormInput = ChangePasswordInput & {
	confirm_password: string
}
