import type { ChatMessage } from '../../../types/message';

export default function AssistantMessageBubble({ message }: { message: ChatMessage }) {
	return (
		<div className="mr-auto max-w-[85%] rounded-2xl rounded-bl-md bg-slate-800 px-4 py-3 text-left text-slate-100 shadow-sm">
			<p className="m-0 whitespace-pre-wrap break-words">{message.content}</p>
		</div>
	);
}
