import { Form } from 'antd';
import { useState } from 'react';
import type { LoginData, LoginInput } from '../types/auth';
import { parseApiError } from '../utils/api-error';
import { useLogin } from './api/useAuth';

type UseLoginFormOptions = {
	onLogin: (data: LoginData) => void
}

export function useLoginForm({ onLogin }: UseLoginFormOptions) {
	const [form] = Form.useForm<LoginInput>();
	const [formError, setFormError] = useState<string | null>(null);
	const loginMutation = useLogin();

	const submit = async (values: LoginInput) => {
		setFormError(null);

		try {
			const result = await loginMutation.mutateAsync(values);
			if (result.data) 
				onLogin(result.data);

		} catch (error) {
			const apiError = parseApiError(error);
			const emailError = apiError.details.find((detail) => detail.field?.endsWith('email'));
			const passwordError = apiError.details.find((detail) => detail.field?.endsWith('password'));

			form.setFields([
				...(emailError ? [{ name: 'email' as const, errors: [emailError.message] }] : []),
				...(passwordError ? [{ name: 'password' as const, errors: [passwordError.message] }] : []),
			]);

			if (apiError.code === 'authentication_failed') {
				form.setFields([{ name: 'password', errors: ['Email or password is incorrect'] }]);
			}

			setFormError(apiError.message);
		}
	}

	return {
		form,
		formError,
		isPending: loginMutation.isPending,
		clearFormError: () => setFormError(null),
		submit
	}
}
