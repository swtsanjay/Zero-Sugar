import { ConfigProvider, Spin, theme } from 'antd';
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useRefreshSession } from './hooks/api/useAuth';
import { useTheme } from './hooks/useTheme';
import type { LoginData } from './types/auth';
import { setAccessToken } from './utils/token-manager';
import AuthPage, { type AuthMode } from './views/auth/AuthPage';
import ChatPage from './views/chat/ChatPage';
import ProfilePage from './views/profile/ProfilePage';

type AuthNavigationState = {
	email?: string
}

export default function App() {
	const [session, setSession] = useState<LoginData | null | undefined>(undefined);
	const { preference, resolvedTheme, setPreference } = useTheme();
	const navigate = useNavigate();
	const location = useLocation();
	const navigationState = location.state as AuthNavigationState | null;
	const refreshSession = useRefreshSession();

	useEffect(() => {
		if (refreshSession.isSuccess) {
			setSession(refreshSession.data.data);
		}

		if (refreshSession.isError) {
			setSession(null);
		}
	}, [refreshSession.data, refreshSession.isError, refreshSession.isSuccess]);

	useEffect(() => {
		const handleExpiredSession = () => {
			setSession(null);
			navigate('/login', { replace: true });
		};

		window.addEventListener('auth:expired', handleExpiredSession);
		return () => window.removeEventListener('auth:expired', handleExpiredSession);
	}, [navigate]);

	const handleLogin = (data: LoginData) => {
		setAccessToken(data.access_token);
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

	const isRestoringSession = session === undefined;

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
			{isRestoringSession ? (
				<div className="grid min-h-screen place-items-center">
					<Spin size="large" tip="Restoring your session" />
				</div>
			) : <Routes>
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
				<Route
					path="/profile"
					element={session ? (
						<ProfilePage themePreference={preference} onThemeChange={setPreference} />
					) : (
						<Navigate to="/login" replace />
					)}
				/>
				<Route path="*" element={<Navigate to={session ? '/chat' : '/login'} replace />} />
			</Routes>}
		</ConfigProvider>
	)
}
