import {
	ArrowLeftOutlined,
	CheckCircleFilled,
	CloseOutlined,
	EditOutlined,
	IdcardOutlined,
	MailOutlined,
	ReloadOutlined,
	SaveOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { Alert, Avatar, Button, Card, Form, Input, Skeleton, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useProfile } from '../../hooks/api/useProfile';
import { useProfileForm } from '../../hooks/useProfileForm';
import type { ThemePreference } from '../../hooks/useTheme';
import ThemeSwitcher from '../theme/ThemeSwitcher';

const { Text, Title } = Typography;

type ProfilePageProps = {
	themePreference: ThemePreference
	onThemeChange: (value: ThemePreference) => void
}

function getInitials(name: string) {
	return name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join('');
}

export default function ProfilePage({ themePreference, onThemeChange }: ProfilePageProps) {
	const profile = useProfile();
	const profileForm = useProfileForm(profile.data);

	return (
		<main className="profile-shell min-h-screen px-4 py-6 sm:px-8 sm:py-10">
			{profileForm.messageContext}
			<div className="mx-auto max-w-4xl">
				<header className="mb-8 flex flex-wrap items-center justify-between gap-4">
					<Link to="/chat">
						<Button icon={<ArrowLeftOutlined />}>Back to chat</Button>
					</Link>
					<ThemeSwitcher value={themePreference} onChange={onThemeChange} />
				</header>

				<div className="mb-8">
					<Text className="!font-semibold !uppercase !tracking-[0.18em] !text-emerald-400">Your account</Text>
					<Title level={1} className="!mb-2 !mt-2 !text-3xl sm:!text-4xl">Profile</Title>
					<Text type="secondary" className="!text-base">Review your account information and status.</Text>
				</div>

				{profile.isLoading && (
					<Card className="profile-card !rounded-3xl">
						<Skeleton active avatar={{ size: 88 }} paragraph={{ rows: 4 }} />
					</Card>
				)}

				{profile.isError && (
					<Alert
						showIcon
						type="error"
						message="We couldn't load your profile"
						description="Check your connection and try again. If your session expired, you will be asked to sign in."
						action={<Button icon={<ReloadOutlined />} onClick={() => profile.refetch()}>Try again</Button>}
					/>
				)}

				{profile.data && (
					<Card className="profile-card overflow-hidden !rounded-3xl">
						<div className="profile-banner -mx-6 -mt-6 mb-0 h-28 sm:-mx-6" />
						<div className="relative px-1 pb-2 sm:px-4">
							<Avatar
								size={96}
								className="!-mt-12 !border-4 !border-solid !border-[var(--profile-card-bg)] !bg-emerald-400 !text-2xl !font-bold !text-emerald-950"
							>
								{getInitials(profile.data.name) || <UserOutlined />}
							</Avatar>

							<div className="mt-4 flex flex-wrap items-start justify-between gap-3">
								<div>
									<Title level={2} className="!mb-1 !text-2xl">{profile.data.name}</Title>
									<Text type="secondary">Signed-in Zero Sugar member</Text>
								</div>
								<div className="flex flex-wrap items-center gap-2">
									<Tag color={profile.data.is_active ? 'success' : 'default'} icon={profile.data.is_active ? <CheckCircleFilled /> : undefined}>
										{profile.data.is_active ? 'Active account' : 'Inactive account'}
									</Tag>
									{!profileForm.isEditing && (
										<Button type="primary" icon={<EditOutlined />} onClick={profileForm.startEditing}>
											Edit profile
										</Button>
									)}
								</div>
							</div>

							{profileForm.isEditing && (
								<div className="profile-edit-panel mt-8 rounded-2xl p-5">
									<div className="mb-5">
										<Title level={4} className="!mb-1">Edit account details</Title>
										<Text type="secondary">Update the name and email connected to your account.</Text>
									</div>

									{profileForm.formError && (
										<Alert
											showIcon
											closable
											type="error"
											message={profileForm.formError}
											onClose={profileForm.clearFormError}
											className="!mb-5"
										/>
									)}

									<Form
										form={profileForm.form}
										layout="vertical"
										requiredMark={false}
										onFinish={profileForm.submit}
										onValuesChange={() => profileForm.formError && profileForm.clearFormError()}
									>
										<div className="grid gap-x-4 sm:grid-cols-2">
											<Form.Item
												name="name"
												label="Full name"
												rules={[
													{ required: true, message: 'Please enter your name' },
													{ min: 3, message: 'Name must be at least 3 characters' },
													{ max: 50, message: 'Name cannot exceed 50 characters' },
												]}
											>
												<Input prefix={<UserOutlined />} autoComplete="name" />
											</Form.Item>

											<Form.Item
												name="username"
												label="Username"
												normalize={(value: string) => value?.trim().toLowerCase()}
												extra="Use letters, numbers and underscores."
												rules={[
													{ required: true, message: 'Please choose a username' },
													{ min: 3, message: 'Username must be at least 3 characters' },
													{ max: 30, message: 'Username cannot exceed 30 characters' },
													{ pattern: /^[a-z0-9_]+$/, message: 'Use only letters, numbers and underscores' },
												]}
											>
												<Input prefix={<UserOutlined />} autoComplete="username" placeholder="Choose a username" />
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
												<Input prefix={<MailOutlined />} autoComplete="email" />
											</Form.Item>
										</div>

										<div className="flex flex-wrap justify-end gap-3">
											<Button icon={<CloseOutlined />} disabled={profileForm.isPending} onClick={profileForm.cancelEditing}>
												Cancel
											</Button>
											<Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={profileForm.isPending}>
												Save changes
											</Button>
										</div>
									</Form>
								</div>
							)}

							<div className="mt-8 grid gap-4 sm:grid-cols-2">
								<div className="profile-detail">
									<div className="profile-detail-icon"><UserOutlined /></div>
									<div className="min-w-0">
										<Text type="secondary" className="!text-xs !uppercase !tracking-wider">Username</Text>
										<p className="mb-0 mt-1 truncate font-medium">
											{profile.data.username ? `@${profile.data.username}` : 'Not set yet'}
										</p>
									</div>
								</div>

								<div className="profile-detail">
									<div className="profile-detail-icon"><MailOutlined /></div>
									<div className="min-w-0">
										<Text type="secondary" className="!text-xs !uppercase !tracking-wider">Email address</Text>
										<p className="mb-0 mt-1 truncate font-medium">{profile.data.email}</p>
									</div>
								</div>

								{/* <div className="profile-detail">
									<div className="profile-detail-icon"><IdcardOutlined /></div>
									<div className="min-w-0">
										<Text type="secondary" className="!text-xs !uppercase !tracking-wider">User ID</Text>
										<p className="mb-0 mt-1 truncate font-mono text-sm">{profile.data.id}</p>
									</div>
								</div> */}
							</div>
						</div>
					</Card>
				)}
			</div>
		</main>
	)
}
