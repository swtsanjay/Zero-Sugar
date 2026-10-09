import { ConfigProvider, theme } from 'antd';
import { useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import type { LoginData } from './types/auth';
import AuthPage, { type AuthMode } from './views/auth/AuthPage';
import ChatPage from './views/chat/ChatPage';

type AuthNavigationState = {
	email?: string
}

export default function App() {
	const [session, setSession] = useState<LoginData | null>(null);
	const { preference, resolvedTheme, setPreference } = useTheme();
	const navigate = useNavigate();
	const location = useLocation();
	const navigationState = location.state as AuthNavigationState | null;

	const handleLogin = (data: LoginData) => {
		setSession(data);
		navigate('/chat', { replace: true });
	};

	const handleModeChange = (mode: AuthMode) => {
		navigate(mode === 'login' ? '/login' : '/create-account');
	};

	const handleAccountCreated = (email: string) => {
		navigate('/login', {
			replace: true,
			state: { email },
		});
	};

	const renderAuthPage = (mode: AuthMode) => session ? (
		<Navigate to="/chat" replace />
	) : (
		<AuthPage
			mode={mode}
			initialEmail={mode === 'login' ? navigationState?.email : undefined}
			onLogin={handleLogin}
			onModeChange={handleModeChange}
			onAccountCreated={handleAccountCreated}
			themePreference={preference}
			onThemeChange={setPreference}
		/>
	);

	return (
		<ConfigProvider
			theme={{
				algorithm: resolvedTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
				token: {
					colorPrimary: '#10b981',
					borderRadius: 12,
					fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
				},
			}}
		>
			<Routes>
				<Route path="/" element={<Navigate to={session ? '/chat' : '/login'} replace />} />
				<Route path="/login" element={renderAuthPage('login')} />
				<Route path="/create-account" element={renderAuthPage('create')} />
				<Route
					path="/chat"
					element={session ? (
						<ChatPage themePreference={preference} onThemeChange={setPreference} />
					) : (
						<Navigate to="/login" replace />
					)}
				/>
				<Route path="*" element={<Navigate to={session ? '/chat' : '/login'} replace />} />
			</Routes>
		</ConfigProvider>
	)
}
