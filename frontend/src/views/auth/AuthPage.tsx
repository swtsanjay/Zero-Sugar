import { CheckCircleFilled, MessageOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Segmented, Typography } from 'antd';
import { useState } from 'react';
import type { ThemePreference } from '../../hooks/useTheme';
import type { LoginData } from '../../types/auth';
import CreateAccountForm from './CreateAccountForm';
import LoginForm from './LoginForm';
import ThemeSwitcher from '../theme/ThemeSwitcher';

const { Text, Title } = Typography;

type AuthPageProps = {
	onLogin: (data: LoginData) => void
	themePreference: ThemePreference
	onThemeChange: (value: ThemePreference) => void
}

type AuthMode = 'login' | 'create'

export default function AuthPage({ onLogin, themePreference, onThemeChange }: AuthPageProps) {
	const [mode, setMode] = useState<AuthMode>('login');
	const [loginEmail, setLoginEmail] = useState('');

	const handleAccountCreated = (email: string) => {
		setLoginEmail(email);
		setMode('login');
	};

	return (
		<main className="auth-shell min-h-screen overflow-hidden bg-[#07110e] text-slate-100">
			<div className="auth-glow auth-glow-one" />
			<div className="auth-glow auth-glow-two" />

			<div className="absolute right-4 top-4 z-20 sm:right-8 sm:top-7">
				<ThemeSwitcher value={themePreference} onChange={onThemeChange} />
			</div>

			<div className="relative mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[1.08fr_0.92fr]">
				<section className="hidden flex-col justify-between px-12 py-10 lg:flex xl:px-20 xl:py-14">
					<div className="flex items-center gap-3">
						<div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400 text-xl text-emerald-950 shadow-[0_10px_35px_rgba(52,211,153,.25)]">
							<MessageOutlined />
						</div>
						<span className="text-lg font-semibold tracking-tight">Zero Sugar</span>
					</div>

					<div className="max-w-xl pb-8">
						<div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-200">
							<span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_#6ee7b7]" />
							Private AI, thoughtfully simple
						</div>
						<h1 className="max-w-lg text-5xl font-semibold leading-[1.08] tracking-[-0.045em] text-white xl:text-6xl">
							Your ideas deserve a quieter place to think.
						</h1>
						<p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
							Chat with your local AI models in a focused workspace built for useful conversations—not distractions.
						</p>

						<div className="mt-10 grid gap-4 sm:grid-cols-2">
							<div className="feature-card">
								<SafetyCertificateOutlined className="text-xl text-emerald-300" />
								<div>
									<p className="font-medium text-slate-100">Locally powered</p>
									<p className="mt-1 text-sm leading-6 text-slate-400">Designed around your Ollama models.</p>
								</div>
							</div>
							<div className="feature-card">
								<CheckCircleFilled className="text-xl text-emerald-300" />
								<div>
									<p className="font-medium text-slate-100">Built for focus</p>
									<p className="mt-1 text-sm leading-6 text-slate-400">A calm space for every conversation.</p>
								</div>
							</div>
						</div>
					</div>

					<Text className="!text-slate-500">React · FastAPI · PostgreSQL · Ollama</Text>
				</section>

				<section className="flex min-h-screen items-center justify-center p-4 sm:p-8 lg:p-12">
					<div className="w-full max-w-[480px]">
						<div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
							<div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-400 text-emerald-950">
								<MessageOutlined />
							</div>
							<span className="text-lg font-semibold">Zero Sugar</span>
						</div>

						<div className="auth-card rounded-[28px] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-9">
							<Segmented<AuthMode>
								block
								value={mode}
								onChange={setMode}
								options={[
									{ label: 'Sign in', value: 'login' },
									{ label: 'Create account', value: 'create' },
								]}
								className="auth-segment mb-8 !bg-black/20 !p-1.5"
							/>

							<div className="mb-7">
								<Title level={2} className="!mb-2 !text-3xl !font-semibold !tracking-tight !text-white">
									{mode === 'login' ? 'Welcome back' : 'Start your workspace'}
								</Title>
								<Text className="!text-base !text-slate-400">
									{mode === 'login' ? 'Sign in to continue your conversations.' : 'Create an account and begin chatting.'}
								</Text>
							</div>

							{mode === 'login' ? (
								<LoginForm initialEmail={loginEmail} onLogin={onLogin} />
							) : (
								<CreateAccountForm onAccountCreated={handleAccountCreated} />
							)}

							<p className="mb-0 mt-7 text-center text-sm text-slate-400">
								{mode === 'login' ? 'New to Zero Sugar?' : 'Already have an account?'}{' '}
								<button
									type="button"
									onClick={() => setMode(mode === 'login' ? 'create' : 'login')}
									className="font-semibold text-emerald-300 transition hover:text-emerald-200"
								>
									{mode === 'login' ? 'Create an account' : 'Sign in'}
								</button>
							</p>
						</div>

						<p className="mt-6 text-center text-xs leading-5 text-slate-500">
							Your refresh session is protected using an HTTP-only cookie.
						</p>
					</div>
				</section>
			</div>
		</main>
	)
}
