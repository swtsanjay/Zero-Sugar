import { Form, message } from 'antd'
import { useState } from 'react'
import type { CreateAccountInput } from '../types/auth'
import { parseApiError } from '../utils/api-error'
import { useCreateAccount } from './api/useAuth'

type UseCreateAccountFormOptions = {
  onAccountCreated: (email: string) => void
}

export type CreateAccountField = keyof CreateAccountInput

export function useCreateAccountForm({ onAccountCreated }: UseCreateAccountFormOptions) {
  const [form] = Form.useForm<CreateAccountInput>()
  const [formError, setFormError] = useState<string | null>(null)
  const [messageApi, messageContext] = message.useMessage()
  const createMutation = useCreateAccount()

  const submit = async (values: CreateAccountInput) => {
    setFormError(null)

    try {
      const result = await createMutation.mutateAsync(values)
      const email = result.data?.email ?? values.email.trim().toLowerCase()
      messageApi.success('Account created. You can sign in now.')
      form.resetFields()
      onAccountCreated(email)
      return null
    } catch (error) {
      const apiError = parseApiError(error)
      const fieldNames = ['name', 'email', 'password'] as const
      const fieldErrors = fieldNames.flatMap((name) => {
        const detail = apiError.details.find((item) => item.field?.endsWith(name))
        return detail ? [{ name, errors: [detail.message] }] : []
      })

      if (fieldErrors.length) form.setFields(fieldErrors)

      if (apiError.code === 'conflict') {
        form.setFields([{ name: 'email', errors: [apiError.message] }])
        setFormError(apiError.message)
        return 'email'
      }

      setFormError(apiError.message)

      const firstInvalidField = fieldNames.find((name) =>
        apiError.details.some((item) => item.field?.endsWith(name)),
      )

      return firstInvalidField ?? null
    }
  }

  return {
    form,
    formError,
    messageContext,
    isPending: createMutation.isPending,
    clearFormError: () => setFormError(null),
    submit,
  }
}
