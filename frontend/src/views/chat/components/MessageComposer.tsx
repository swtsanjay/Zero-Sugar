import { RobotOutlined, SendOutlined, StopOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Select, Typography } from 'antd';

const { Text } = Typography;

type MessageComposerProps = {
	value: string
	isSending: boolean
	error: string | null
	model: string
	models: string[]
	isModelsLoading: boolean
	hasModelsError: boolean
	onChange: (value: string) => void
	onModelChange: (value: string) => void
	onSend: () => void
	onStop: () => void
	onDismissError: () => void
}

export default function MessageComposer({ value, isSending, error, model, models, isModelsLoading, hasModelsError, onChange, onModelChange, onSend, onStop, onDismissError }: MessageComposerProps) {
	return (
		<footer className="message-composer z-10 mx-auto w-full max-w-3xl shrink-0 p-4 sm:p-6">
			{error ? <Alert className="mb-3" type="error" showIcon message={error} closable onClose={onDismissError} /> : null}
			<div className="mb-2 flex items-center gap-2">
				<RobotOutlined className="text-slate-400" />
				<Select
					value={model || undefined}
					loading={isModelsLoading}
					disabled={isSending || isModelsLoading || hasModelsError}
					placeholder={hasModelsError ? 'Models unavailable' : 'Select a model'}
					options={models.map((availableModel) => ({ label: availableModel, value: availableModel }))}
					onChange={onModelChange}
					className="min-w-44"
					aria-label="AI model"
				/>
			</div>
			<Input
				value={value}
				onChange={(event) => onChange(event.target.value)}
				onPressEnter={onSend}
				maxLength={500}
				disabled={isSending || !model}
				size="large"
				placeholder="Message Zero Sugar"
				suffix={isSending ? (
					<Button danger type="primary" shape="circle" aria-label="Stop generating" onClick={onStop} icon={<StopOutlined />} />
				) : (
					<Button type="primary" shape="circle" aria-label="Send message" disabled={!value.trim() || !model} onClick={onSend} icon={<SendOutlined />} />
				)}
				className="!py-3"
			/>
			<Text type="secondary" className="mt-2 block text-center text-xs">{isSending ? 'Click stop to end generation' : 'Press Enter to send'}</Text>
		</footer>
	);
}
