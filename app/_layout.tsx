import { auth } from "@/src/firebase/firebaseConfig";
import { Stack, useRouter, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const inAuthGroup = segments[0] === "(auth)";

      // Si está logueado y está en auth -> lo mandamos a tabs (calendario/home)
      if (user && inAuthGroup) {
        router.replace("/(tabs)/calendar");
      }

      // Si NO está logueado y NO está en auth -> lo mandamos a login
      if (!user && !inAuthGroup) {
        router.replace("/(auth)/login");
      }

      setCheckingAuth(false);
    });

    return () => unsub();
  }, [router, segments]);

  // Pantalla de carga mientras Firebase responde
  if (checkingAuth) {
    return (
      <View style={{ flex: 1, backgroundColor: "#25292e", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}