import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import type { ThemePreference } from '../../hooks/useTheme';
import AppHeader from './AppHeader';

type AppLayoutProps = {
	themePreference: ThemePreference
	onThemeChange: (value: ThemePreference) => void
}

export default function AppLayout({ themePreference, onThemeChange }: AppLayoutProps) {
	return (
		<Layout className="min-h-screen">
			<AppHeader themePreference={themePreference} onThemeChange={onThemeChange} />
			<Outlet />
		</Layout>
	);
}
