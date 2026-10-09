import { ArrowLeftOutlined, ArrowRightOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input, Steps } from 'antd';
import { type KeyboardEvent, useState } from 'react';
import { useCreateAccountForm } from '../../hooks/useCreateAccountForm';
import type { CreateAccountInput } from '../../types/auth';

type CreateAccountFormProps = {
	onAccountCreated: (email: string) => void
}

export default function CreateAccountForm({ onAccountCreated }: CreateAccountFormProps) {
	const { form, formError, messageContext, isPending, clearFormError, submit } = useCreateAccountForm({ onAccountCreated });
	const [currentStep, setCurrentStep] = useState(0);

	const fieldSteps: Record<keyof CreateAccountInput, number> = { email: 0, password: 1, name: 2 };
	const stepFields: (keyof CreateAccountInput)[] = ['email', 'password', 'name'];

	const handleFinish = async (values: CreateAccountInput) => {
		const invalidField = await submit(values);
		if (invalidField) {
			setCurrentStep(fieldSteps[invalidField]);
		}
	};

	const goForward = async () => {
		try {
			await form.validateFields([stepFields[currentStep]]);
			setCurrentStep((step) => step + 1);
		} catch {
			// Ant Design displays the validation error on the active field.
		}
	};

	const goBack = () => {
		setCurrentStep((step) => step - 1);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
		if (event.key !== 'Enter' || event.shiftKey || currentStep === 2) return;

		event.preventDefault();
		void goForward();
	};

	return (
		<>
			{messageContext}

			<Steps
				current={currentStep}
				responsive={false}
				size="small"
				className="registration-steps !mb-8"
				items={[
					{ title: 'Email', icon: <MailOutlined /> },
					{ title: 'Password', icon: <LockOutlined /> },
					{ title: 'Profile', icon: <UserOutlined /> },
				]}
			/>

			<div className="mb-6">
				<p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
					Step {currentStep + 1} of 3
				</p>
				<p className="mb-0 text-sm text-slate-400">
					{currentStep === 0 && 'Start with the email you will use to sign in.'}
					{currentStep === 1 && 'Choose a strong password to protect your account.'}
					{currentStep === 2 && 'Finally, tell us what we should call you.'}
				</p>
			</div>

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
				onFinish={handleFinish}
				onKeyDown={handleKeyDown}
				onValuesChange={() => formError && clearFormError()}
				size="large"
			>
				<div className="registration-step-viewport">
					<div
						className="registration-step-track"
						style={{ transform: `translateX(-${currentStep * 100}%)` }}
					>
						<div className="registration-step-panel" aria-hidden={currentStep !== 0}>
							<Form.Item
								name="email"
								label="Email address"
								normalize={(value: string) => value?.trim()}
								rules={[
									{ required: true, message: 'Please enter your email address' },
									{ type: 'email', message: 'Enter a valid email address' },
								]}
							>
								<Input prefix={<MailOutlined />} placeholder="you@example.com" autoComplete="email" tabIndex={currentStep === 0 ? 0 : -1} />
							</Form.Item>
						</div>

						<div className="registration-step-panel" aria-hidden={currentStep !== 1}>
							<Form.Item
								name="password"
								label="Create password"
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
								<Input.Password prefix={<LockOutlined />} placeholder="Create a password" autoComplete="new-password" tabIndex={currentStep === 1 ? 0 : -1} />
							</Form.Item>
						</div>

						<div className="registration-step-panel" aria-hidden={currentStep !== 2}>
							<Form.Item
								name="name"
								label="Full name"
								rules={[
									{ required: true, message: 'Please enter your name' },
									{ min: 3, message: 'Name must be at least 3 characters' },
									{ max: 50, message: 'Name cannot exceed 50 characters' },
								]}
							>
								<Input prefix={<UserOutlined />} placeholder="Your full name" autoComplete="name" tabIndex={currentStep === 2 ? 0 : -1} />
							</Form.Item>
						</div>

					</div>
				</div>

				<div className="mt-2 flex gap-3">
					{currentStep > 0 && (
						<Button
							size="large"
							disabled={isPending}
							onClick={goBack}
							icon={<ArrowLeftOutlined />}
							className="!h-12 !rounded-xl"
						>
							Back
						</Button>
					)}

					<Button
						block
						type="primary"
						htmlType={currentStep === 2 ? 'submit' : 'button'}
						onClick={currentStep < 2 ? goForward : undefined}
						loading={isPending}
						className="!h-12 !rounded-xl !bg-emerald-400 !font-semibold !text-emerald-950 !shadow-[0_12px_30px_rgba(52,211,153,.18)] hover:!bg-emerald-300"
					>
						{currentStep === 2 ? 'Create account' : 'Continue'}
						{!isPending && <ArrowRightOutlined />}
					</Button>
				</div>
			</Form>
		</>
	)
}
