import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

export type HealthResponse = {
  status: string
  database: string
}

export async function getHealth(): Promise<HealthResponse> {
  const response = await apiClient.get<HealthResponse>('/database-health')
  return response.data
}
