import { auth } from '@/src/firebase/firebaseConfig';
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function AboutScreen() {
    const user = auth.currentUser;
    if (!user) {
        return (
            <View style={styles.container}>
                <Text style={styles.lockIcon}>🔒</Text>
                <Text style={styles.lockTitle}>This feature requires an account</Text>
                <Text style={styles.lockSubtitle}>
                    Create a free account to access your nutrition analysis
                </Text>

                <Pressable style={styles.button} onPress={() => router.push("/(auth)/login")}>
                    <Text style={styles.buttonText}>Log In</Text>
                </Pressable>

                <Pressable style={styles.buttonOutline} onPress={() => router.push("/(auth)/signup")}>
                    <Text style={styles.buttonOutlineText}>Create Account</Text>
                </Pressable>
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <Text style={styles.text}>About screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#fff',
    },
    lockIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    lockTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 10,
    },
    lockSubtitle: {
        color: '#9aa4b2',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 10,
        marginBottom: 12,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    buttonOutline: {
        borderWidth: 1,
        borderColor: '#4CAF50',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
    },
    buttonOutlineText: {
        color: '#4CAF50',
        fontWeight: '600',
        fontSize: 15,
    },
});
