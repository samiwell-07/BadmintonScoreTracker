import { notifications } from '@mantine/notifications'

const toastColorMap: Record<string, string> = {
  success: 'teal',
  info: 'blue',
  warning: 'yellow',
  error: 'red',
}

export const showToast = ({
  title,
  description,
  status = 'info',
}: {
  title: string
  description?: string
  status?: keyof typeof toastColorMap
}) => {
  notifications.show({
    title,
    message: description,
    color: toastColorMap[status] ?? 'blue',
    autoClose: 1800,
  })
}
