import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { Colors } from '@/constants/colors'

// Manter splash screen visível enquanto carrega
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  useEffect(() => {
    // Esconder splash após carregar
    SplashScreen.hideAsync()
  }, [])

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.primary[700] }
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  )
}
