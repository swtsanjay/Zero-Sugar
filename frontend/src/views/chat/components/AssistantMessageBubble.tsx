import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage } from '../../../types/message';

export default function AssistantMessageBubble({ message }: { message: ChatMessage }) {
	return (
		<div className="assistant-message mr-auto max-w-[90%] rounded-2xl rounded-bl-md bg-slate-800 px-5 py-4 text-left text-slate-100 shadow-sm">
			<div className="assistant-markdown break-words">
				<ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
			</div>
		</div>
	);
}
