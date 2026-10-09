import { ArrowRightOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input } from 'antd';
import { useEffect } from 'react';
import { useLoginForm } from '../../hooks/useLoginForm';
import type { LoginData, LoginInput } from '../../types/auth';

type LoginFormProps = {
	initialEmail?: string
	onLogin: (data: LoginData) => void
}

export default function LoginForm({ initialEmail, onLogin }: LoginFormProps) {
	const { form, formError, isPending, clearFormError, submit } = useLoginForm({ onLogin });

	useEffect(() => {
		if (initialEmail) 
			form.setFieldValue('email', initialEmail);
	}, [form, initialEmail])

	return (
		<>
			{formError && (
				<Alert
					showIcon
					closable
					type="error"
					message={formError}
					onClose={clearFormError}
					className="!mb-6 !border-red-400/20 !bg-red-400/10"
				/>
			)}

			<Form<LoginInput>
				form={form}
				layout="vertical"
				requiredMark={false}
				onFinish={submit}
				onValuesChange={() => formError && clearFormError()}
				size="large"
			>
				<Form.Item
					name="email"
					label="Email address"
					normalize={(value: string) => value?.trim()}
					rules={[
						{ required: true, message: 'Please enter your email address' },
						{ type: 'email', message: 'Enter a valid email address' },
					]}
				>
					<Input prefix={<MailOutlined />} placeholder="you@example.com" autoComplete="email" />
				</Form.Item>

				<Form.Item
					name="password"
					label="Password"
					rules={[
						{ required: true, message: 'Please enter your password' },
						{ min: 8, message: 'Password must be at least 8 characters' },
					]}
				>
					<Input.Password prefix={<LockOutlined />} placeholder="Enter your password" autoComplete="current-password" />
				</Form.Item>

				<Button
					block
					type="primary"
					htmlType="submit"
					loading={isPending}
					className="!mt-2 !h-12 !rounded-xl !bg-emerald-400 !font-semibold !text-emerald-950 !shadow-[0_12px_30px_rgba(52,211,153,.18)] hover:!bg-emerald-300"
				>
					Sign in
					{!isPending && <ArrowRightOutlined />}
				</Button>
			</Form>
		</>
	)
}
