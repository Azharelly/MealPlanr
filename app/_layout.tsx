import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

function RootNavigator() {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    if (token && !inTabsGroup) {
      router.replace('/(tabs)/calendar');
    } else if (token && !inTabsGroup) {
      router.replace('/(auth)/login');
    }
  }, [isLoading, token, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#25292e', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#E07B39" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}