import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button, Card, Stack, Text, Title } from '@mantine/core'
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react'

interface Props {
  children: ReactNode
  fallbackTitle?: string
  fallbackMessage?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in development only
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card
          withBorder
          radius="lg"
          p="xl"
          shadow="lg"
          style={{
            maxWidth: '400px',
            margin: '2rem auto',
            textAlign: 'center',
          }}
        >
          <Stack gap="lg" align="center">
            <IconAlertTriangle size={48} color="var(--mantine-color-orange-6)" />
            <Title order={3}>
              {this.props.fallbackTitle || 'Something went wrong'}
            </Title>
            <Text c="dimmed" size="sm">
              {this.props.fallbackMessage ||
                "We're sorry, but something unexpected happened. Please try again."}
            </Text>
            {import.meta.env.DEV && this.state.error && (
              <Text size="xs" c="red" style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {this.state.error.message}
              </Text>
            )}
            <Stack gap="xs" w="100%">
              <Button
                leftSection={<IconRefresh size={18} />}
                onClick={this.handleRetry}
                variant="light"
                fullWidth
              >
                Try Again
              </Button>
              <Button onClick={this.handleReload} variant="subtle" fullWidth>
                Reload App
              </Button>
            </Stack>
          </Stack>
        </Card>
      )
    }

    return this.props.children
  }
}
