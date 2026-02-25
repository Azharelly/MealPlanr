import { auth } from "@/src/firebase/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function SignUpScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const isValidEmail = (value: string) => {
        // simple y suficiente para MVP
        return /\S+@\S+\.\S+/.test(value);
    };

    const handleSignUp = async () => {
        setError("");

        const cleanEmail = email.trim();

        if (!cleanEmail || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }
        if (!isValidEmail(cleanEmail)) {
            setError("Please enter a valid email.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
            console.log("User created:", cred.user.uid);
            // redirección la hacemos en el paso del auth guard
        } catch (e: any) {
            const code = e?.code;

            if (code === "auth/email-already-in-use") setError("This email is already in use.");
            else if (code === "auth/invalid-email") setError("Invalid email address.");
            else if (code === "auth/weak-password") setError("Password is too weak.");
            else setError("Could not create account. Please try again.");

            console.log("Sign up error:", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create account</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#9aa0a6"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9aa0a6"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TextInput
                style={styles.input}
                placeholder="Confirm password"
                placeholderTextColor="#9aa0a6"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />

            {!!error && <Text style={styles.error}>{error}</Text>}

            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    pressed && { opacity: 0.85 },
                    loading && { opacity: 0.6 },
                ]}
                onPress={handleSignUp}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator />
                ) : (
                    <Text style={styles.buttonText}>Sign up</Text>
                )}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#25292e",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    title: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        backgroundColor: "#1f2228",
        borderWidth: 1,
        borderColor: "#3a3f47",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: "#fff",
        marginBottom: 12,
    },
    button: {
        backgroundColor: "#3a86ff",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 6,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    error: {
        color: "#ff6b6b",
        marginBottom: 8,
    },
});
