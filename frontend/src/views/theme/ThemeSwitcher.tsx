import { DesktopOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Segmented, Tooltip } from 'antd';
import type { ThemePreference } from '../../hooks/useTheme';

type ThemeSwitcherProps = {
	value: ThemePreference
	onChange: (value: ThemePreference) => void
}

export default function ThemeSwitcher({ value, onChange }: ThemeSwitcherProps) {
	return (
		<Tooltip title={`Theme: ${value}`} placement="bottom">
			<Segmented<ThemePreference>
				aria-label="Color theme"
				value={value}
				onChange={onChange}
				options={[
					{ value: 'system', icon: <DesktopOutlined />, label: 'System' },
					{ value: 'light', icon: <SunOutlined />, label: 'Light' },
					{ value: 'dark', icon: <MoonOutlined />, label: 'Dark' },
				]}
				className="theme-switcher"
			/>
		</Tooltip>
	)
}