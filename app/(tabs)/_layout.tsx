import { Stack, Tabs } from "expo-router";

export default function TabLayout() {
    return (
        <Tabs>
            <Tabs.Screen
                name="/index"
                options={{
                    headerTitle: 'Home'
                }}
            />
            <Tabs.Screen
                name="/signup"
                options={{
                    headerTitle: 'SignUp'
                }}
            />
            <Tabs.Screen
                name="/calendar"
                options={{
                    headerTitle: 'Calendar'
                }}
            />
            <Stack.Screen
                name="/account"
                options={{
                    headerTitle: 'Account'
                }}
            />
        </Tabs>
    );
}