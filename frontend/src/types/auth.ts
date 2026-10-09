export type CreateAccountInput = {
	name: string
	email: string
	password: string
}

export type CreatedUser = {
	id: string
	name: string
	email: string
	is_active: boolean
}

export type LoginInput = {
	email: string
	password: string
}

export type LoginData = {
	access_token: string
	token_type: string
}
