import { MessageOutlined, PlusOutlined, SendOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Button, ConfigProvider, Input, Layout, Spin, Tag, Typography, theme } from 'antd'
import { getHealth } from './api/client'

const { Sider, Content } = Layout
const { Title, Text } = Typography

export default function App() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    retry: 1,
    refetchInterval: 30_000,
  })

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorPrimary: '#10b981' } }}>
      <Layout className="min-h-screen">
        <Sider breakpoint="md" collapsedWidth="0" width={260} className="border-r border-slate-800 p-4">
          <Button block icon={<PlusOutlined />} size="large">New chat</Button>
          <div className="mt-8 flex items-center gap-2 px-2 text-slate-400">
            <MessageOutlined />
            <span>Conversations will appear here</span>
          </div>
        </Sider>

        <Content className="flex min-h-screen flex-col bg-slate-950">
          <header className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
            <Text strong>Zero Sugar Chat</Text>
            {health.isLoading ? (
              <Spin size="small" />
            ) : health.isSuccess ? (
              <Tag color="success">API and database connected</Tag>
            ) : (
              <Tag color="error">Backend offline</Tag>
            )}
          </header>

          <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-5 rounded-2xl bg-emerald-500/10 p-4 text-3xl text-emerald-400">
              <MessageOutlined />
            </div>
            <Title level={2} className="!text-slate-100">How can I help you today?</Title>
            <Text className="max-w-lg !text-slate-400">
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
    </ConfigProvider>
  )
}

