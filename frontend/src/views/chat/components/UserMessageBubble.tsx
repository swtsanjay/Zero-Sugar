import { NumberOutlined } from '@ant-design/icons';
import type { ChatMessage } from '../../../types/message';

export default function UserMessageBubble({ message }: { message: ChatMessage }) {
	const isOptimistic = message.id.startsWith('optimistic-user-');
	const promptTokens = Number(message.tokens ?? 0);

	return (
		<div className="ml-auto max-w-[85%]">
			<div className="rounded-2xl rounded-br-md bg-emerald-500 px-4 py-3 text-left text-slate-950 shadow-sm">
				<p className="m-0 whitespace-pre-wrap break-words">{message.content}</p>
			</div>
			<div className="mt-2 flex justify-end px-1 text-xs text-slate-500">
				<NumberOutlined className="mr-1" />
				{isOptimistic ? 'Calculating tokens…' : `${promptTokens} prompt tokens`}
			</div>
		</div>
	);
}
