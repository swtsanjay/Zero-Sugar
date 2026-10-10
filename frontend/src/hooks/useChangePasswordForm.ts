import { Form, message } from 'antd';
import { useState } from 'react';
import type { ChangePasswordFormInput } from '../types/user';
import { parseApiError } from '../utils/api-error';
import { useChangePassword } from './api/usePassword';

export function useChangePasswordForm() {
	const [form] = Form.useForm<ChangePasswordFormInput>();
	const [isOpen, setIsOpen] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [messageApi, messageContext] = message.useMessage();
	const mutation = useChangePassword();

	const close = () => {
		form.resetFields();
		setFormError(null);
		setIsOpen(false);
	};

	const submit = async (values: ChangePasswordFormInput) => {
		setFormError(null);

		try {
			await mutation.mutateAsync({
				current_password: values.current_password,
				new_password: values.new_password,
			});
			messageApi.success('Password changed successfully.');
			close();
		} catch (error) {
			const apiError = parseApiError(error);
			const fieldErrors = apiError.details.flatMap((detail) => {
				const field = detail.field?.split('.').pop();
				if (field !== 'current_password' && field !== 'new_password') return [];
				return [{ name: field as keyof ChangePasswordFormInput, errors: [detail.message] }];
			});

			if (fieldErrors.length) form.setFields(fieldErrors);

			if (apiError.code === 'invalid_current_password') {
				form.setFields([{ name: 'current_password', errors: [apiError.message] }]);
			}

			if (apiError.code === 'password_unchanged') {
				form.setFields([{ name: 'new_password', errors: [apiError.message] }]);
			}

			setFormError(apiError.message);
		}
	};

	return {
		form,
		formError,
		isOpen,
		isPending: mutation.isPending,
		messageContext,
		open: () => setIsOpen(true),
		close,
		clearFormError: () => setFormError(null),
		submit,
	};
}
