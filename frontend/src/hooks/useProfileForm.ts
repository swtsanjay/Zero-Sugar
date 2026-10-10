import { Form, message } from 'antd';
import { useEffect, useState } from 'react';
import type { ApiErrorDetails } from '../types/api';
import type { UpdateProfileInput, UserProfile } from '../types/user';
import { parseApiError } from '../utils/api-error';
import { useUpdateProfile } from './api/useProfile';

function applyFieldErrors(
	form: ReturnType<typeof Form.useForm<UpdateProfileInput>>[0],
	details: ApiErrorDetails[],
) {
	const fields = details.flatMap((detail) => {
		const field = detail.field?.split('.').pop();
		if (field !== 'name' && field !== 'username' && field !== 'email') return [];
		return [{ name: field as keyof UpdateProfileInput, errors: [detail.message] }];
	});

	if (fields.length) form.setFields(fields);
}

export function useProfileForm(profile?: UserProfile | null) {
	const [form] = Form.useForm<UpdateProfileInput>();
	const [isEditing, setIsEditing] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [messageApi, messageContext] = message.useMessage();
	const updateMutation = useUpdateProfile();

	useEffect(() => {
		if (profile) {
			form.setFieldsValue({
				name: profile.name,
				username: profile.username ?? '',
				email: profile.email,
			});
		}
	}, [form, profile]);

	const startEditing = () => {
		if (profile) {
			form.setFieldsValue({
				name: profile.name,
				username: profile.username ?? '',
				email: profile.email,
			});
		}
		setFormError(null);
		setIsEditing(true);
	};

	const cancelEditing = () => {
		if (profile) {
			form.setFieldsValue({
				name: profile.name,
				username: profile.username ?? '',
				email: profile.email,
			});
		}
		form.setFields([
			{ name: 'name', errors: [] },
			{ name: 'username', errors: [] },
			{ name: 'email', errors: [] },
		]);
		setFormError(null);
		setIsEditing(false);
	};

	const submit = async (values: UpdateProfileInput) => {
		setFormError(null);

		try {
			await updateMutation.mutateAsync(values);
			messageApi.success('Profile updated successfully.');
			setIsEditing(false);
		} catch (error) {
			const apiError = parseApiError(error);
			applyFieldErrors(form, apiError.details);

			if (apiError.code === 'conflict') {
				const conflictField = apiError.message.toLowerCase().includes('username')
					? 'username'
					: 'email';
				form.setFields([{ name: conflictField, errors: [apiError.message] }]);
			}

			setFormError(apiError.message);
		}
	};

	return {
		form,
		formError,
		isEditing,
		isPending: updateMutation.isPending,
		messageContext,
		startEditing,
		cancelEditing,
		clearFormError: () => setFormError(null),
		submit,
	};
}
