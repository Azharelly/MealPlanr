import { auth } from "@/src/firebase/firebaseConfig"; // ajusta si tu export se llama distinto
import { Tabs } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

export default function TabLayout() {
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setChecking(false);
        });

        return () => unsub();
    }, []);

    if (checking) return null;

    return (
        <Tabs screenOptions={{ headerShown: true }}>
            <Tabs.Screen name="index" options={{ headerTitle: "Home" }} />
            <Tabs.Screen name="analysis" options={{ headerTitle: "Analysis" }} />
            <Tabs.Screen name="calendar" options={{ headerTitle: "Calendar" }} />
            <Tabs.Screen name="cookbooks" options={{ headerTitle: "Cookbooks" }} />
            <Tabs.Screen name="shoppinglist" options={{ headerTitle: "Shopping List" }} />
            <Tabs.Screen name="account" options={{ headerTitle: "Account" }} />
        </Tabs>
    );
}