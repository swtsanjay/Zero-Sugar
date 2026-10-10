import { UserOutlined } from '@ant-design/icons';
import { Button, Spin, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useHealth } from '../../hooks/api/useHealth';
import type { ThemePreference } from '../../hooks/useTheme';
import ThemeSwitcher from '../theme/ThemeSwitcher';

const { Text } = Typography;

type AppHeaderProps = {
	themePreference: ThemePreference
	onThemeChange: (value: ThemePreference) => void
}

export default function AppHeader({ themePreference, onThemeChange }: AppHeaderProps) {
	const health = useHealth();

	return (
		<header className="app-header flex min-h-16 flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
			<Link to="/chat"><Text strong>Zero Sugar Chat</Text></Link>
			<div className="flex items-center gap-3">
				{health.isLoading ? <Spin size="small" /> : health.isSuccess ? (
					<Tag color="success">API and database connected</Tag>
				) : (
					<Tag color="error">Backend offline</Tag>
				)}
				<Link to="/profile"><Button shape="circle" aria-label="Open profile" icon={<UserOutlined />} /></Link>
				<ThemeSwitcher value={themePreference} onChange={onThemeChange} />
			</div>
		</header>
	);
}
