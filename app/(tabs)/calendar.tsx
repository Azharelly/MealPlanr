import React, { useState } from "react";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEAL_SLOTS = [
    { key: "breakfast", label: "Breakfast", icon: "☕" },
    { key: "lunch", label: "Lunch", icon: "☀️" },
    { key: "dinner", label: "Dinner", icon: "🌙" },
];

function getWeekDates(offset = 0) {
    const today = new Date();
    const day = today.getDay(); // 0 = Sunday
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((day + 6) % 7) + offset * 7);

    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

export default function CalendarScreen() {
    const today = new Date();
    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedDate, setSelectedDate] = useState(today);
    const weekDates = getWeekDates(weekOffset);

    const isToday = (date: Date) =>
        date.toDateString() === today.toDateString();
    const isSelected = (date: Date) =>
        date.toDateString() === selectedDate.toDateString();

    const monthLabel = weekDates[0].toLocaleString("en", { month: "long" }).toUpperCase() +
        " " + weekDates[0].getFullYear();

    const selectedLabel = selectedDate.toLocaleDateString("en", {
        weekday: "long", day: "numeric", month: "short"
    });

    return (
        <SafeAreaView style={styles.safe}>
            {/* Semana */}
            <View style={styles.weekContainer}>
                <Text style={styles.monthLabel}>{monthLabel}</Text>

                <View style={styles.weekRow}>
                    <Pressable onPress={() => setWeekOffset(w => w - 1)}>
                        <Text style={styles.arrow}>‹</Text>
                    </Pressable>

                    {weekDates.map((date, i) => (
                        <Pressable
                            key={i}
                            style={[
                                styles.dayBtn,
                                isSelected(date) && styles.dayBtnSelected,
                            ]}
                            onPress={() => setSelectedDate(date)}
                        >
                            <Text style={[styles.dayName, isSelected(date) && styles.dayTextSelected]}>
                                {DAYS[i]}
                            </Text>
                            <Text style={[styles.dayNum, isSelected(date) && styles.dayTextSelected]}>
                                {date.getDate()}
                            </Text>
                            {isToday(date) && !isSelected(date) && (
                                <View style={styles.todayDot} />
                            )}
                        </Pressable>
                    ))}

                    <Pressable onPress={() => setWeekOffset(w => w + 1)}>
                        <Text style={styles.arrow}>›</Text>
                    </Pressable>
                </View>
            </View>

            {/* Vista del día */}
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.selectedLabel}>
                    {isToday(selectedDate) ? "Today · " : ""}{selectedLabel}
                </Text>

                {MEAL_SLOTS.map(slot => (
                    <View key={slot.key} style={styles.mealCard}>
                        <View style={styles.mealHeader}>
                            <Text style={styles.mealIcon}>{slot.icon}</Text>
                            <Text style={styles.mealLabel}>{slot.label}</Text>
                        </View>
                        <Pressable style={styles.addBtn}>
                            <Text style={styles.addBtnText}>+ Add {slot.label}</Text>
                        </Pressable>
                    </View>
                ))}

                <Pressable style={styles.snackBtn}>
                    <Text style={styles.snackBtnText}>+ Add Snack</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const ORANGE = "#E07B39";

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#fff",
    },
    weekContainer: {
        backgroundColor: "#fff",
        paddingTop: 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderColor: "#f0f0f0",
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    monthLabel: {
        textAlign: "center",
        fontSize: 12,
        fontWeight: "600",
        color: "#888",
        letterSpacing: 1,
        marginBottom: 8,
    },
    weekRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 8,
    },
    arrow: {
        fontSize: 24,
        color: "#888",
        paddingHorizontal: 4,
    },
    dayBtn: {
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 6,
        borderRadius: 12,
        minWidth: 36,
    },
    dayBtnSelected: {
        backgroundColor: ORANGE,
    },
    dayName: {
        fontSize: 11,
        color: "#888",
        marginBottom: 2,
    },
    dayNum: {
        fontSize: 16,
        fontWeight: "600",
        color: "#222",
    },
    dayTextSelected: {
        color: "#fff",
    },
    todayDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: ORANGE,
        marginTop: 2,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    selectedLabel: {
        fontSize: 18,
        fontWeight: "700",
        color: "#222",
        marginBottom: 16,
    },
    mealCard: {
        backgroundColor: "#fafafa",
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#f0f0f0",
    },
    mealHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    mealIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    mealLabel: {
        fontSize: 15,
        fontWeight: "600",
        color: "#222",
    },
    addBtn: {
        borderWidth: 1.5,
        borderColor: ORANGE,
        borderStyle: "dashed",
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: "center",
    },
    addBtnText: {
        color: ORANGE,
        fontWeight: "500",
    },
    snackBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
    },
    snackBtnText: {
        color: ORANGE,
        fontSize: 15,
        fontWeight: "500",
    },
});