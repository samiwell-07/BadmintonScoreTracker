import { useState, useCallback, useEffect } from 'react'
import {
  Modal,
  Button,
  Stack,
  Text,
  Title,
  Group,
  ThemeIcon,
  Stepper,
  Box,
  Kbd,
} from '@mantine/core'
import {
  IconPlayerPlay,
  IconUsers,
  IconHistory,
  IconKeyboard,
  IconCheck,
  IconArrowRight,
  IconArrowLeft,
} from '@tabler/icons-react'
import type { Translations } from '../i18n/translations'

const ONBOARDING_STORAGE_KEY = 'bst-onboarding-completed'

interface OnboardingTourProps {
  isOpen: boolean
  onComplete: () => void
  onSkip: () => void
  t: Translations
}

export const useOnboardingTour = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true'
  })

  useEffect(() => {
    // Show onboarding on first visit after a short delay
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [hasSeenOnboarding])

  const completeOnboarding = useCallback(() => {
    setIsOpen(false)
    setHasSeenOnboarding(true)
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
  }, [])

  const openOnboarding = useCallback(() => {
    setIsOpen(true)
  }, [])

  const skipOnboarding = useCallback(() => {
    completeOnboarding()
  }, [completeOnboarding])

  return {
    isOpen,
    hasSeenOnboarding,
    completeOnboarding,
    openOnboarding,
    skipOnboarding,
  }
}

export const OnboardingTour = ({
  isOpen,
  onComplete,
  onSkip,
  t,
}: OnboardingTourProps) => {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      icon: IconPlayerPlay,
      color: 'teal',
      title: t.onboarding?.welcome ?? 'Welcome to Badminton Score Tracker!',
      content:
        t.onboarding?.welcomeDesc ??
        'Track your badminton matches with ease. This quick tour will show you the main features.',
    },
    {
      icon: IconUsers,
      color: 'blue',
      title: t.onboarding?.scoring ?? 'Easy Scoring',
      content:
        t.onboarding?.scoringDesc ??
        'Tap +1 to add points, -1 to correct mistakes. The app automatically tracks games, service, and match winner.',
    },
    {
      icon: IconHistory,
      color: 'grape',
      title: t.onboarding?.history ?? 'Match History',
      content:
        t.onboarding?.historyDesc ??
        'Your completed games are saved automatically. View stats, share results, and track your progress over time.',
    },
    {
      icon: IconKeyboard,
      color: 'orange',
      title: t.onboarding?.shortcuts ?? 'Keyboard Shortcuts',
      content: (
        <Stack gap="xs">
          <Text size="sm">
            {t.onboarding?.shortcutsDesc ?? 'Use these shortcuts for faster scoring:'}
          </Text>
          <Group gap="lg" wrap="wrap">
            <Group gap="xs">
              <Kbd>A</Kbd>
              <Text size="sm">Player A +1</Text>
            </Group>
            <Group gap="xs">
              <Kbd>B</Kbd>
              <Text size="sm">Player B +1</Text>
            </Group>
            <Group gap="xs">
              <Kbd>U</Kbd>
              <Text size="sm">Undo</Text>
            </Group>
            <Group gap="xs">
              <Kbd>Space</Kbd>
              <Text size="sm">Pause/Resume</Text>
            </Group>
          </Group>
        </Stack>
      ),
    },
  ]

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1)
    } else {
      onComplete()
    }
  }

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
    }
  }

  const currentStep = steps[activeStep]
  const StepIcon = currentStep.icon

  return (
    <Modal
      opened={isOpen}
      onClose={onSkip}
      size="md"
      centered
      withCloseButton={false}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <Stack gap="lg" p="md">
        <Stepper active={activeStep} size="xs" color="teal">
          {steps.map((_, index) => (
            <Stepper.Step key={index} />
          ))}
        </Stepper>

        <Stack gap="md" align="center" ta="center">
          <ThemeIcon size={64} radius="xl" color={currentStep.color} variant="light">
            <StepIcon size={32} />
          </ThemeIcon>
          <Title order={3}>{currentStep.title}</Title>
          {typeof currentStep.content === 'string' ? (
            <Text c="dimmed">{currentStep.content}</Text>
          ) : (
            <Box>{currentStep.content}</Box>
          )}
        </Stack>

        <Group justify="space-between" mt="lg">
          <Button variant="subtle" color="gray" onClick={onSkip}>
            {t.onboarding?.skip ?? 'Skip'}
          </Button>
          <Group gap="xs">
            {activeStep > 0 && (
              <Button
                variant="light"
                leftSection={<IconArrowLeft size={16} />}
                onClick={prevStep}
              >
                {t.onboarding?.back ?? 'Back'}
              </Button>
            )}
            <Button
              rightSection={
                activeStep === steps.length - 1 ? (
                  <IconCheck size={16} />
                ) : (
                  <IconArrowRight size={16} />
                )
              }
              onClick={nextStep}
            >
              {activeStep === steps.length - 1
                ? t.onboarding?.getStarted ?? "Let's Go!"
                : t.onboarding?.next ?? 'Next'}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  )
}
