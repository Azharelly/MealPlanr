import { auth } from "@/src/firebase/firebaseConfig";
import { Slot, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setCheckingAuth(false);
    });
    return () => unsub();
  }, []); // ← sin dependencias, solo corre una vez

  useEffect(() => {
    if (checkingAuth) return; // espera a que Firebase responda

    if (isLoggedIn) {
      router.replace("/(tabs)/calendar");
    } else {
      router.replace("/");
    }
  }, [checkingAuth, isLoggedIn]); // ← solo reacciona a cambios de auth

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, backgroundColor: "#25292e", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Slot />;
}