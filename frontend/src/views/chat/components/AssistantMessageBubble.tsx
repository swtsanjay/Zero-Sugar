import { ClockCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Spin, Tooltip, Typography } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage } from '../../../types/message';

const { Text } = Typography;

type AssistantMessageBubbleProps = {
	message: ChatMessage
	isRegenerating: boolean
	disableRegenerate: boolean
	isOptimistic?: boolean
	onRegenerate: (messageId: string) => void
}

export default function AssistantMessageBubble({ message, isRegenerating, disableRegenerate, isOptimistic = false, onRegenerate }: AssistantMessageBubbleProps) {
	const executionTime = Number(message.execution_time);
	const formattedExecutionTime = Number.isFinite(executionTime)
		? `${executionTime.toFixed(2)} s`
		: '—';

	return (
		<div className="mr-auto max-w-[90%]">
			<div className="assistant-message rounded-2xl rounded-bl-md bg-slate-800 px-5 py-4 text-left text-slate-100 shadow-sm">
				{isOptimistic ? (
					<div className="flex items-center gap-3 text-sm text-slate-300">
						<Spin size="small" />
						<span>Thinking…</span>
					</div>
				) : (
					<div className="assistant-markdown break-words">
						<ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
					</div>
				)}
			</div>

			{!isOptimistic ? <div className="mt-2 flex items-center gap-2 px-1">
				<Text type="secondary" className="text-xs">
					<ClockCircleOutlined className="mr-1" />
					{formattedExecutionTime}
				</Text>
				<Tooltip title="Regenerate response">
					<Button
						type="text"
						size="small"
						disabled={disableRegenerate}
						loading={isRegenerating}
						onClick={() => onRegenerate(message.id)}
						aria-label="Regenerate response"
						icon={<ReloadOutlined />}
					/>
				</Tooltip>
			</div> : null}
		</div>
	);
}
