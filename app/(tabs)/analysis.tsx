import { useAuth } from '@/src/context/AuthContext';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

const ORANGE = "#E07B39";

const SunIcon = () => (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="4" fill="white" />
        <Path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
);

const LeafIcon = () => (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path d="M12 2C8 2 4 6 4 11c0 5 4 9 8 11 4-2 8-6 8-11 0-5-4-9-8-9z" fill="white" opacity={0.9} />
        <Path d="M12 22V12M12 12C10 10 7 9 5 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
);

const CheckIcon = () => (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const TrendIcon = () => (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path d="M3 17l5-5 4 4 9-9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M14 7h6v6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const WEEKLY_DATA = [
    { day: "M", value: 90 },
    { day: "T", value: 70 },
    { day: "W", value: 80 },
    { day: "T", value: 40 },
    { day: "F", value: 60 },
    { day: "S", value: 20 },
    { day: "S", value: 10 },
];

const RECOMMENDATIONS = [
    {
        icon: <SunIcon />,
        color: ORANGE,
        bg: "#fff8f4",
        border: ORANGE,
        text: "You tend to skip breakfast. Try prepping something quick the night before.",
    },
    {
        icon: <LeafIcon />,
        color: ORANGE,
        bg: "#fff8f4",
        border: ORANGE,
        text: "You frequently skip mix peppers. Consider substituting with another vegetable.",
    },
    {
        icon: <CheckIcon />,
        color: "#4CAF50",
        bg: "#e8f5e9",
        border: "#4CAF50",
        text: "Great job on Wednesdays! You had 100% adherence 3 weeks in a row.",
    },
    {
        icon: <TrendIcon />,
        color: "#4CAF50",
        bg: "#e8f5e9",
        border: "#4CAF50",
        text: "Your adherence improved 13% compared to last week. Keep it up!",
    },
];

export default function AnalysisScreen() {
    const { user } = useAuth();

    if (!user) {
        return (
            <View style={styles.lockedContainer}>
                <Ionicons name="lock-closed-outline" size={48} color="#ddd" />
                <Text style={styles.lockTitle}>This feature requires an account</Text>
                <Text style={styles.lockSubtitle}>
                    Create a free account to access your nutrition analysis
                </Text>
                <Pressable
                    style={styles.lockBtn}
                    onPress={() => require("expo-router").router.push("/(auth)/login")}
                >
                    <Text style={styles.lockBtnText}>Log In</Text>
                </Pressable>
                <Pressable
                    style={styles.lockBtnOutline}
                    onPress={() => require("expo-router").router.push("/(auth)/signup")}
                >
                    <Text style={styles.lockBtnOutlineText}>Create Account</Text>
                </Pressable>
            </View>
        );
    }

    const maxValue = Math.max(...WEEKLY_DATA.map(d => d.value));

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <Text style={styles.title}>Analysis</Text>
                <Text style={styles.subtitle}>Week of Mar 17 – Mar 23</Text>

                {/* Streak */}
                <LinearGradient
                    colors={["#E07B39", "#f0a060"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.streakCard}
                >
                    <View style={styles.streakLeft}>
                        <Text style={styles.streakLabel}>Current streak</Text>
                        <View style={styles.streakRow}>
                            <Text style={styles.streakNumber}>5</Text>
                            <Text style={styles.streakFlame}>🔥</Text>
                        </View>
                        <Text style={styles.streakSub}>days in a row</Text>
                    </View>
                    <View style={styles.streakRight}>
                        <Text style={styles.streakBestLabel}>Best streak</Text>
                        <Text style={styles.streakBestNumber}>12</Text>
                        <Text style={styles.streakBestDays}>days</Text>
                    </View>
                </LinearGradient>

                {/* Weekly adherence */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Weekly adherence</Text>
                    <View style={styles.barChart}>
                        {WEEKLY_DATA.map((item, i) => (
                            <View key={i} style={styles.barColumn}>
                                <View style={styles.barWrapper}>
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: `${(item.value / maxValue) * 100}%`,
                                                opacity: item.value / maxValue,
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.barLabel}>{item.day}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.cardFooter}>
                        <Text style={styles.cardFooterLabel}>Average this week</Text>
                        <Text style={styles.cardFooterValue}>74%</Text>
                    </View>
                </View>

                {/* Nutrition */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Nutrition this week</Text>
                    <View style={styles.nutritionGrid}>
                        <NutrientCard label="Avg calories/day" value="1,840" unit="kcal" trend="down" note="210 below goal" />
                        <NutrientCard label="Avg protein/day" value="68" unit="g" trend="up" note="On track" />
                        <NutrientCard label="Avg carbs/day" value="210" unit="g" trend="up" note="On track" />
                        <NutrientCard label="Avg fat/day" value="54" unit="g" trend="down" note="Below goal" />
                    </View>
                </View>

                {/* Patterns */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Behaviour patterns</Text>
                    <PatternRow label="Most skipped slot" value="Breakfast" type="bad" />
                    <View style={styles.divider} />
                    <PatternRow label="Hardest day" value="Saturday" type="bad" />
                    <View style={styles.divider} />
                    <PatternRow label="Most skipped ingredient" value="Mix peppers" type="warning" />
                    <View style={styles.divider} />
                    <PatternRow label="Best day" value="Wednesday" type="good" />
                </View>

                {/* Week comparison */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Week comparison</Text>
                    <ComparisonRow label="This week" value={74} opacity={1} />
                    <ComparisonRow label="Last week" value={61} opacity={0.5} />
                    <ComparisonRow label="2 weeks ago" value={48} opacity={0.25} />
                    <Text style={styles.improvementNote}>
                        ↑ You improved 13% from last week!
                    </Text>
                </View>

                {/* Recommendations */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Recommendations</Text>
                    {RECOMMENDATIONS.map((rec, i) => (
                        <View
                            key={i}
                            style={[
                                styles.recItem,
                                { backgroundColor: rec.bg, borderLeftColor: rec.border },
                            ]}
                        >
                            <View style={[styles.recIconBox, { backgroundColor: rec.color }]}>
                                {rec.icon}
                            </View>
                            <Text style={styles.recText}>{rec.text}</Text>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

function NutrientCard({ label, value, unit, trend, note }: {
    label: string;
    value: string;
    unit: string;
    trend: "up" | "down";
    note: string;
}) {
    const isGood = trend === "up";
    return (
        <View style={styles.nutrientCard}>
            <Text style={styles.nutrientLabel}>{label}</Text>
            <View style={styles.nutrientValueRow}>
                <Text style={styles.nutrientValue}>{value}</Text>
                <Text style={styles.nutrientUnit}>{unit}</Text>
            </View>
            <Text style={[styles.nutrientNote, { color: isGood ? "#4CAF50" : ORANGE }]}>
                {trend === "up" ? "↑" : "↓"} {note}
            </Text>
        </View>
    );
}

function PatternRow({ label, value, type }: {
    label: string;
    value: string;
    type: "good" | "bad" | "warning";
}) {
    const colors = {
        good: { bg: "#1a3a2a", text: "#4CAF50" },
        bad: { bg: "#3a1a1a", text: "#ff6b6b" },
        warning: { bg: "#3a2a1a", text: "#ffaa55" },
    };
    return (
        <View style={styles.patternRow}>
            <Text style={styles.patternLabel}>{label}</Text>
            <View style={[styles.patternBadge, { backgroundColor: colors[type].bg }]}>
                <Text style={[styles.patternBadgeText, { color: colors[type].text }]}>{value}</Text>
            </View>
        </View>
    );
}

function ComparisonRow({ label, value, opacity }: {
    label: string;
    value: number;
    opacity: number;
}) {
    return (
        <View style={styles.compRow}>
            <Text style={styles.compLabel}>{label}</Text>
            <View style={styles.compBarBg}>
                <View style={[styles.compBarFill, { width: `${value}%`, opacity }]} />
            </View>
            <Text style={styles.compValue}>{value}%</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#1a1a1a" },
    scrollContent: { padding: 16, paddingBottom: 40 },
    title: { fontSize: 24, fontWeight: "700", color: "#fff", marginBottom: 4 },
    subtitle: { fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 20 },

    // Lock screen
    lockedContainer: { flex: 1, backgroundColor: "#1a1a1a", justifyContent: "center", alignItems: "center", paddingHorizontal: 30 },
    lockTitle: { fontSize: 20, fontWeight: "700", color: "#fff", textAlign: "center", marginTop: 16, marginBottom: 10 },
    lockSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: 30 },
    lockBtn: { backgroundColor: "#4CAF50", paddingVertical: 14, paddingHorizontal: 40, borderRadius: 10, marginBottom: 12, width: "100%", alignItems: "center" },
    lockBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
    lockBtnOutline: { borderWidth: 1, borderColor: "#4CAF50", paddingVertical: 14, paddingHorizontal: 40, borderRadius: 10, width: "100%", alignItems: "center" },
    lockBtnOutlineText: { color: "#4CAF50", fontWeight: "600", fontSize: 15 },

    // Streak
    streakCard: {
        borderRadius: 16,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    streakLeft: { flex: 1 },
    streakRight: { alignItems: "flex-end" },
    streakLabel: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginBottom: 4 },
    streakRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    streakNumber: { fontSize: 56, color: "#fff", fontFamily: "serif", lineHeight: 60 },
    streakFlame: { fontSize: 36 },
    streakSub: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4 },
    streakBestLabel: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginBottom: 4 },
    streakBestNumber: { fontSize: 36, color: "#fff", fontFamily: "serif", textAlign: "right" },
    streakBestDays: { fontSize: 16, color: "rgba(255,255,255,0.8)", textAlign: "right", fontWeight: "600" },

    // Card
    card: { backgroundColor: "#2a2a2a", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#333" },
    cardTitle: { fontSize: 15, fontWeight: "700", color: "#fff", marginBottom: 14 },
    cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: "#333" },
    cardFooterLabel: { fontSize: 13, color: "rgba(255,255,255,0.5)" },
    cardFooterValue: { fontSize: 18, fontWeight: "700", color: ORANGE },

    // Bar chart
    barChart: { flexDirection: "row", alignItems: "flex-end", gap: 8, height: 80, marginBottom: 4 },
    barColumn: { flex: 1, alignItems: "center", height: "100%", gap: 4 },
    barWrapper: { flex: 1, width: "100%", justifyContent: "flex-end" },
    bar: { width: "100%", backgroundColor: ORANGE, borderRadius: 4 },
    barLabel: { fontSize: 10, color: "rgba(255,255,255,0.4)" },

    // Nutrition
    nutritionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    nutrientCard: { width: "47%", backgroundColor: "#333", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#444" },
    nutrientLabel: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 },
    nutrientValueRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
    nutrientValue: { fontSize: 22, fontWeight: "700", color: "#fff", fontFamily: "serif" },
    nutrientUnit: { fontSize: 12, color: "rgba(255,255,255,0.4)" },
    nutrientNote: { fontSize: 11, marginTop: 4 },

    // Patterns
    patternRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 },
    patternLabel: { fontSize: 13, color: "rgba(255,255,255,0.8)" },
    patternBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
    patternBadgeText: { fontSize: 12, fontWeight: "600" },
    divider: { height: 1, backgroundColor: "#333" },

    // Comparison
    compRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
    compLabel: { fontSize: 12, color: "rgba(255,255,255,0.5)", width: 80 },
    compBarBg: { flex: 1, height: 10, backgroundColor: "#333", borderRadius: 5, overflow: "hidden" },
    compBarFill: { height: "100%", backgroundColor: ORANGE, borderRadius: 5 },
    compValue: { fontSize: 12, fontWeight: "600", color: "#fff", width: 32 },
    improvementNote: { fontSize: 12, color: "#4CAF50", marginTop: 8 },

    // Recommendations
    recItem: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 12, borderRadius: 10, borderLeftWidth: 3, marginBottom: 10 },
    recIconBox: { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center", flexShrink: 0 },
    recText: { flex: 1, fontSize: 13, color: "#444", lineHeight: 20 },
});