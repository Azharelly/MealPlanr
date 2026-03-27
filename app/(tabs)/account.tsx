import { useAuth } from '@/src/context/AuthContext';
import { router, useFocusEffect } from "expo-router";
import React, { useRef } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";

const DRAWER_WIDTH = Dimensions.get("window").width * 0.78;

export default function AccountScreen() {
    const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
    const [open, setOpen] = React.useState(false);

    // ✅ JWT en lugar de Firebase
    const { user, logout } = useAuth();
    const userEmail = user?.email ?? "Unknown user";

    useFocusEffect(
        React.useCallback(() => {
            setOpen(true);
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                bounciness: 0,
            }).start();
        }, [])
    );

    const closeDrawer = () => {
        Animated.timing(slideAnim, {
            toValue: DRAWER_WIDTH,
            duration: 220,
            useNativeDriver: true,
        }).start(() => setOpen(false));
    };

    const handleLogout = async () => {
        try {
            await logout();          // ✅ usa logout del AuthContext
            router.replace('/');
        } catch (e) {
            Alert.alert("Logout failed", "Please try again.");
        }
    };

    return (
        <View style={styles.container}>
            {open && (
                <Pressable style={styles.backdrop} onPress={closeDrawer} />
            )}

            <Animated.View
                style={[
                    styles.drawer,
                    { transform: [{ translateX: slideAnim }] },
                ]}
            >
                {/* Header usuario */}
                <View style={styles.userBox}>
                    {user ? (
                        <>
                            <Text style={styles.userLabel}>Signed in as</Text>
                            <Text style={styles.userEmail} numberOfLines={1}>
                                {userEmail}
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.userLabel}>Not logged in</Text>
                            <Text style={styles.userEmail}>Guest</Text>
                        </>
                    )}
                </View>

                <Text style={styles.sectionTitle}>App</Text>
                <MenuItem label="Settings" onPress={() => { closeDrawer(); router.push("/settings"); }} />
                <MenuItem label="Upgrade to Premium" onPress={() => { closeDrawer(); router.push("/premium"); }} />
                <MenuItem label="History (Adherence Log)" onPress={() => { closeDrawer(); router.push("/history"); }} />

                <Text style={styles.sectionTitle}>Support</Text>
                <MenuItem label="Help / FAQ" onPress={() => { closeDrawer(); router.push("/(account)/help"); }} />
                <MenuItem label="Send Feedback" onPress={() => { closeDrawer(); router.push("/feedback"); }} />
                <MenuItem label="Privacy & Terms" onPress={() => { closeDrawer(); router.push("/legal"); }} />

                <View style={styles.divider} />

                {user ? (
                    <MenuItem
                        label="Log out"
                        danger
                        onPress={() => {
                            Alert.alert("Log out", "Are you sure you want to log out?", [
                                { text: "Cancel", style: "cancel" },
                                { text: "Log out", style: "destructive", onPress: handleLogout },
                            ]);
                        }}
                    />
                ) : (
                    <>
                        <MenuItem
                            label="Log In"
                            onPress={() => { closeDrawer(); router.push("/(auth)/login"); }}
                        />
                        <MenuItem
                            label="Create Account"
                            onPress={() => { closeDrawer(); router.push("/(auth)/signup"); }}
                        />
                    </>
                )}
            </Animated.View>
        </View>
    );
}


function MenuItem({ label, onPress, danger }: {
    label: string;
    onPress: () => void;
    danger?: boolean;
}) {
    return (
        <Pressable style={styles.item} onPress={onPress}>
            <Text style={[styles.itemText, danger && styles.dangerText]}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#25292e",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.55)",
        zIndex: 10,
    },
    drawer: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: DRAWER_WIDTH,
        backgroundColor: "#1e2228",
        borderLeftWidth: 1,
        borderColor: "#2b3038",
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 34,
        zIndex: 20,
    },
    userBox: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: "#2b3038",
        marginBottom: 10,
    },
    userLabel: { color: "#9aa4b2", fontSize: 12 },
    userEmail: { color: "#fff", fontSize: 16, marginTop: 4 },
    sectionTitle: {
        color: "#9aa4b2",
        fontSize: 12,
        marginTop: 12,
        marginBottom: 6,
        letterSpacing: 0.4,
    },
    item: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: "#2b3038",
    },
    itemText: { color: "#fff", fontSize: 15 },
    dangerText: { color: "#ff6b6b" },
    divider: { height: 12 },
});