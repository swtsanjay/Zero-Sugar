import { ArrowRightOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input } from 'antd';
import { useCreateAccountForm } from '../../hooks/useCreateAccountForm';
import type { CreateAccountInput } from '../../types/auth';

type CreateAccountFormProps = {
	onAccountCreated: (email: string) => void
}

export default function CreateAccountForm({ onAccountCreated }: CreateAccountFormProps) {
	const { form, formError, messageContext, isPending, clearFormError, submit } = useCreateAccountForm({ onAccountCreated });

	return (
		<>
			{messageContext}

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

			<Form<CreateAccountInput>
				form={form}
				layout="vertical"
				requiredMark={false}
				onFinish={submit}
				onValuesChange={() => formError && clearFormError()}
				size="large"
			>
				<Form.Item
					name="name"
					label="Full name"
					rules={[
						{ required: true, message: 'Please enter your name' }, { min: 3, message: 'Name must be at least 3 characters' },
						{ max: 50, message: 'Name cannot exceed 50 characters' },
					]}
				>
					<Input prefix={<UserOutlined />} placeholder="Your full name" autoComplete="name" />
				</Form.Item>

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
					extra="Use 8+ characters with upper, lower, number and symbol."
					rules={[
						{ required: true, message: 'Please enter your password' },
						{ min: 8, message: 'Password must be at least 8 characters' },
						{
							pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
							message: 'Include upper, lower, number and special character',
						},
					]}
				>
					<Input.Password prefix={<LockOutlined />} placeholder="Create a password" autoComplete="new-password" />
				</Form.Item>

				<Button
					block
					type="primary"
					htmlType="submit"
					loading={isPending}
					className="!mt-2 !h-12 !rounded-xl !bg-emerald-400 !font-semibold !text-emerald-950 !shadow-[0_12px_30px_rgba(52,211,153,.18)] hover:!bg-emerald-300"
				>
					Create account
					{!isPending && <ArrowRightOutlined />}
				</Button>
			</Form>
		</>
	)
}
