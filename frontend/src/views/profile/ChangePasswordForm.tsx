import { CloseOutlined, LockOutlined, SafetyCertificateOutlined, SaveOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { useChangePasswordForm } from '../../hooks/useChangePasswordForm';
import type { ChangePasswordFormInput } from '../../types/user';

const { Text, Title } = Typography;

export default function ChangePasswordForm() {
	const passwordForm = useChangePasswordForm();

	return (
		<>
			{passwordForm.messageContext}
			<Card className="profile-card mt-6 !rounded-3xl">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div className="flex items-center gap-4">
						<div className="profile-detail-icon !h-12 !w-12"><SafetyCertificateOutlined /></div>
						<div>
							<Title level={4} className="!mb-1">Password and security</Title>
							<Text type="secondary">Use a strong, unique password for your account.</Text>
						</div>
					</div>
					{!passwordForm.isOpen && (
						<Button icon={<LockOutlined />} onClick={passwordForm.open}>Change password</Button>
					)}
				</div>

				{passwordForm.isOpen && (
					<div className="profile-edit-panel mt-6 rounded-2xl p-5">
						{passwordForm.formError && (
							<Alert
								showIcon
								closable
								type="error"
								message={passwordForm.formError}
								onClose={passwordForm.clearFormError}
								className="!mb-5"
							/>
						)}

						<Form<ChangePasswordFormInput>
							form={passwordForm.form}
							layout="vertical"
							requiredMark={false}
							onFinish={passwordForm.submit}
							onValuesChange={() => passwordForm.formError && passwordForm.clearFormError()}
						>
							<Form.Item
								name="current_password"
								label="Current password"
								rules={[
									{ required: true, message: 'Enter your current password' },
									{ min: 8, message: 'Password must be at least 8 characters' },
								]}
							>
								<Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
							</Form.Item>

							<div className="grid gap-x-4 sm:grid-cols-2">
								<Form.Item
									name="new_password"
									label="New password"
									extra="Use upper, lower, number and special character."
									rules={[
										{ required: true, message: 'Enter a new password' },
										{ min: 8, message: 'Password must be at least 8 characters' },
										{ max: 128, message: 'Password cannot exceed 128 characters' },
										{
											pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
											message: 'Include upper, lower, number and special character',
										},
									]}
								>
									<Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
								</Form.Item>

								<Form.Item
									name="confirm_password"
									label="Confirm new password"
									dependencies={['new_password']}
									rules={[
										{ required: true, message: 'Confirm your new password' },
										({ getFieldValue }) => ({
											validator(_, value) {
												if (!value || getFieldValue('new_password') === value) return Promise.resolve();
												return Promise.reject(new Error('Passwords do not match'));
											},
										}),
									]}
								>
									<Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
								</Form.Item>
							</div>

							<div className="flex flex-wrap justify-end gap-3">
								<Button icon={<CloseOutlined />} disabled={passwordForm.isPending} onClick={passwordForm.close}>Cancel</Button>
								<Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={passwordForm.isPending}>Update password</Button>
							</div>
						</Form>
					</div>
				)}
			</Card>
		</>
	)
}
