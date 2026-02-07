import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="/index" options={{ headerTitle: 'Home' }} />
      <Stack.Screen name="/signup" options={{ headerTitle: 'SignUp' }} />
      <Stack.Screen name="/calendar" options={{ headerTitle: 'Calendar' }} />
      <Stack.Screen name="/account" options={{ headerTitle: 'Account' }} />
    </Stack>
  );
}
