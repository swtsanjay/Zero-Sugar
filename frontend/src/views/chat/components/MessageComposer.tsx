import { SendOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Typography } from 'antd';

const { Text } = Typography;

type MessageComposerProps = {
	value: string
	isSending: boolean
	error: string | null
	onChange: (value: string) => void
	onSend: () => void
	onDismissError: () => void
}

export default function MessageComposer({ value, isSending, error, onChange, onSend, onDismissError }: MessageComposerProps) {
	return (
		<footer className="mx-auto w-full max-w-3xl p-4 sm:p-6">
			{error ? <Alert className="mb-3" type="error" showIcon message={error} closable onClose={onDismissError} /> : null}
			<Input
				value={value}
				onChange={(event) => onChange(event.target.value)}
				onPressEnter={onSend}
				maxLength={500}
				disabled={isSending}
				size="large"
				placeholder="Message Zero Sugar"
				suffix={<Button type="primary" shape="circle" aria-label="Send message" disabled={!value.trim()} loading={isSending} onClick={onSend} icon={<SendOutlined />} />}
				className="!py-3"
			/>
			<Text type="secondary" className="mt-2 block text-center text-xs">Press Enter to send</Text>
		</footer>
	);
}
