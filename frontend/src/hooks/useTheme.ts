import { useEffect, useState } from 'react';
export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'zero-sugar-theme';

function getSystemTheme(): ResolvedTheme {
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
	const [preference, setPreference] = useState<ThemePreference>(() => {
		const saved = localStorage.getItem(STORAGE_KEY)
		return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system'
	});
	const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);
	const resolvedTheme = preference === 'system' ? systemTheme : preference;

	useEffect(() => {
		const media = window.matchMedia('(prefers-color-scheme: dark)')
		const updateSystemTheme = (event: MediaQueryListEvent) => {
			setSystemTheme(event.matches ? 'dark' : 'light')
		}

		media.addEventListener('change', updateSystemTheme)
		return () => media.removeEventListener('change', updateSystemTheme)
	}, [])

	useEffect(() => {
		document.documentElement.dataset.theme = resolvedTheme
		document.documentElement.style.colorScheme = resolvedTheme
		localStorage.setItem(STORAGE_KEY, preference)
	}, [preference, resolvedTheme])

	return { preference, resolvedTheme, setPreference }
}
