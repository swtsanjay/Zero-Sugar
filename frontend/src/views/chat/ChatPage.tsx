import { MessageOutlined, PlusOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Input, Layout, Spin, Tag, Typography } from 'antd';
import { useHealth } from '../../hooks/api/useHealth';
import type { ThemePreference } from '../../hooks/useTheme';
import ThemeSwitcher from '../theme/ThemeSwitcher';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

type ChatPageProps = {
	themePreference: ThemePreference
	onThemeChange: (value: ThemePreference) => void
}

export default function ChatPage({ themePreference, onThemeChange }: ChatPageProps) {
	const health = useHealth();

	return (
		<Layout className="chat-layout min-h-screen">
			<Sider breakpoint="md" collapsedWidth="0" width={260} className="chat-sidebar border-r p-4">
				<Button block icon={<PlusOutlined />} size="large">New chat</Button>
				<div className="mt-8 flex items-center gap-2 px-2 text-slate-400">
					<MessageOutlined />
					<span>Conversations will appear here</span>
				</div>
			</Sider>

			<Content className="chat-content flex min-h-screen flex-col">
				<header className="chat-header flex min-h-16 flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
					<Text strong>Zero Sugar Chat</Text>
					<div className="flex items-center gap-3">
						{health.isLoading ? <Spin size="small" /> : health.isSuccess ? (
							<Tag color="success">API and database connected</Tag>
						) : (
							<Tag color="error">Backend offline</Tag>
						)}
						<ThemeSwitcher value={themePreference} onChange={onThemeChange} />
					</div>
				</header>

				<main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
					<div className="mb-5 rounded-2xl bg-emerald-500/10 p-4 text-3xl text-emerald-400"><MessageOutlined /></div>
					<Title level={2}>How can I help you today?</Title>
					<Text type="secondary" className="max-w-lg">
						Your React, FastAPI, and PostgreSQL foundation is ready. Ollama chat streaming comes next.
					</Text>
				</main>

				<footer className="mx-auto w-full max-w-3xl p-6">
					<Input
						disabled
						size="large"
						placeholder="Messaging will be enabled in the chat phase"
						suffix={<Button type="primary" shape="circle" disabled icon={<SendOutlined />} />}
						className="!py-3"
					/>
				</footer>
			</Content>
		</Layout>
	)
}
