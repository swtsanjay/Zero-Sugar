import type { ChatMessage } from '../../../types/message';

export default function UserMessageBubble({ message }: { message: ChatMessage }) {
	return (
		<div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-emerald-500 px-4 py-3 text-left text-slate-950 shadow-sm">
			<p className="m-0 whitespace-pre-wrap break-words">{message.content}</p>
		</div>
	);
}
