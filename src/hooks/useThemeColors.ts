import { useMantineColorScheme, useMantineTheme } from '@mantine/core'

export const useThemeColors = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const theme = useMantineTheme()

  const pageBg =
    colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0]
  const cardBg =
    colorScheme === 'dark' ? theme.colors.dark[6] : theme.white
  const mutedText =
    colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.gray[6]

  const toggleColorMode = () =>
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')

  return {
    theme,
    colorScheme,
    pageBg,
    cardBg,
    mutedText,
    toggleColorMode,
  }
}
