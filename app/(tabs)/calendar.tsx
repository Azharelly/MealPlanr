import RecipeForm, { Recipe } from "@/components/RecipeForm";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Alert,
    Image,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const ORANGE = "#E07B39";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MEAL_SLOTS = [
    { key: "breakfast", label: "Breakfast", icon: "cafe-outline" },
    { key: "lunch", label: "Lunch", icon: "sunny-outline" },
    { key: "dinner", label: "Dinner", icon: "moon-outline" },
    { key: "snack", label: "Snack", icon: "nutrition-outline" },
];

type MealStatus = "consumed" | "skipped" | "partial" | null;

interface MealEntry {
    id: string;
    recipe: Recipe;
    status: MealStatus;
    skippedIngredients: string[];
}

interface DayMeals {
    [slot: string]: MealEntry[];
}

interface CalendarData {
    [dateKey: string]: DayMeals;
}

function getWeekDates(offset = 0) {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((day + 6) % 7) + offset * 7);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

function toDateKey(date: Date) {
    return date.toISOString().split("T")[0];
}

const SAMPLE_RECIPES: Recipe[] = [
    { id: "1", name: "Avocado Toast", time: "10 min", totalCalories: 320, totalProtein: 8, totalFat: 12, totalCarbs: 40, ingredients: [], steps: [], image: null, servings: 1 },
    { id: "2", name: "Grilled Chicken Salad", time: "25 min", totalCalories: 450, totalProtein: 35, totalFat: 15, totalCarbs: 20, ingredients: [], steps: [], image: null, servings: 1 },
    { id: "3", name: "Oatmeal with Berries", time: "15 min", totalCalories: 280, totalProtein: 10, totalFat: 5, totalCarbs: 50, ingredients: [], steps: [], image: null, servings: 1 },
    { id: "4", name: "Pasta Bolognese", time: "40 min", totalCalories: 620, totalProtein: 30, totalFat: 20, totalCarbs: 70, ingredients: [], steps: [], image: null, servings: 1 },
];

export default function CalendarScreen() {
    const today = new Date();
    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedDate, setSelectedDate] = useState(today);
    const [calendarData, setCalendarData] = useState<CalendarData>({});
    const [recipes] = useState<Recipe[]>(SAMPLE_RECIPES);

    const [activeSlot, setActiveSlot] = useState<string | null>(null);
    const [showSlotMenu, setShowSlotMenu] = useState(false);
    const [showChooseRecipe, setShowChooseRecipe] = useState(false);
    const [showRecipeForm, setShowRecipeForm] = useState(false);

    const [showPartialModal, setShowPartialModal] = useState(false);
    const [partialEntry, setPartialEntry] = useState<MealEntry | null>(null);
    const [partialSlot, setPartialSlot] = useState<string | null>(null);

    // Copiar día o slot
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [copyMode, setCopyMode] = useState<"day" | "slot">("day");
    const [copySlot, setCopySlot] = useState<string | null>(null);
    const [selectedCopyDays, setSelectedCopyDays] = useState<string[]>([]);

    const weekDates = getWeekDates(weekOffset);
    const isToday = (date: Date) => date.toDateString() === today.toDateString();
    const isSelected = (date: Date) => date.toDateString() === selectedDate.toDateString();
    const monthLabel = weekDates[0].toLocaleString("en", { month: "long" }).toUpperCase() + " " + weekDates[0].getFullYear();
    const selectedLabel = selectedDate.toLocaleDateString("en", { weekday: "long", day: "numeric", month: "short" });
    const currentDateKey = toDateKey(selectedDate);
    const dayMeals = calendarData[currentDateKey] || {};

    const addMealToSlot = (slot: string, recipe: Recipe) => {
        const entry: MealEntry = {
            id: Date.now().toString(),
            recipe,
            status: null,
            skippedIngredients: [],
        };
        setCalendarData(prev => ({
            ...prev,
            [currentDateKey]: {
                ...prev[currentDateKey],
                [slot]: [...(prev[currentDateKey]?.[slot] || []), entry],
            },
        }));
    };

    const updateStatus = (slot: string, entryId: string, newStatus: MealStatus, skippedIngredients?: string[]) => {
        setCalendarData(prev => ({
            ...prev,
            [currentDateKey]: {
                ...prev[currentDateKey],
                [slot]: (prev[currentDateKey]?.[slot] || []).map(e =>
                    e.id === entryId
                        ? { ...e, status: e.status === newStatus ? null : newStatus, skippedIngredients: skippedIngredients ?? e.skippedIngredients }
                        : e
                ),
            },
        }));
    };

    const removeMeal = (slot: string, entryId: string) => {
        Alert.alert("Remove meal", "Remove this meal from the calendar?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Remove", style: "destructive",
                onPress: () => {
                    setCalendarData(prev => ({
                        ...prev,
                        [currentDateKey]: {
                            ...prev[currentDateKey],
                            [slot]: (prev[currentDateKey]?.[slot] || []).filter(e => e.id !== entryId),
                        },
                    }));
                }
            }
        ]);
    };

    const handleCopy = () => {
        if (selectedCopyDays.length === 0) return;
        selectedCopyDays.forEach(dk => {
            if (copyMode === "day") {
                setCalendarData(prev => ({
                    ...prev,
                    [dk]: { ...(calendarData[currentDateKey] || {}) },
                }));
            } else if (copyMode === "slot" && copySlot) {
                setCalendarData(prev => ({
                    ...prev,
                    [dk]: {
                        ...prev[dk],
                        [copySlot]: [...(calendarData[currentDateKey]?.[copySlot] || [])],
                    },
                }));
            }
        });
        setShowCopyModal(false);
        setSelectedCopyDays([]);
    };

    const toggleCopyDay = (dk: string) => {
        setSelectedCopyDays(prev =>
            prev.includes(dk) ? prev.filter(d => d !== dk) : [...prev, dk]
        );
    };

    const getStatusStyle = (status: MealStatus, type: MealStatus) => {
        if (status !== type) return styles.statusBtnInactive;
        if (type === "consumed") return styles.statusBtnConsumed;
        if (type === "skipped") return styles.statusBtnSkipped;
        if (type === "partial") return styles.statusBtnPartial;
        return styles.statusBtnInactive;
    };

    const getIconColor = (status: MealStatus, type: MealStatus) => {
        if (status !== type) return "#bbb";
        if (type === "consumed") return "#2e7d32";
        if (type === "skipped") return "#c62828";
        if (type === "partial") return "#e65100";
        return "#bbb";
    };

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
                            style={[styles.dayBtn, isSelected(date) && styles.dayBtnSelected]}
                            onPress={() => setSelectedDate(date)}
                        >
                            <Text style={[styles.dayName, isSelected(date) && styles.dayTextSelected]}>{DAYS[i]}</Text>
                            <Text style={[styles.dayNum, isSelected(date) && styles.dayTextSelected]}>{date.getDate()}</Text>
                            {isToday(date) && !isSelected(date) && <View style={styles.todayDot} />}
                        </Pressable>
                    ))}
                    <Pressable onPress={() => setWeekOffset(w => w + 1)}>
                        <Text style={styles.arrow}>›</Text>
                    </Pressable>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header del día con botón copiar día */}
                <View style={styles.dayHeader}>
                    <Text style={styles.selectedLabel}>
                        {isToday(selectedDate) ? "Today · " : ""}{selectedLabel}
                    </Text>
                    <Pressable
                        style={styles.copyDayBtn}
                        onPress={() => {
                            setCopyMode("day");
                            setCopySlot(null);
                            setSelectedCopyDays([]);
                            setShowCopyModal(true);
                        }}
                    >
                        <Ionicons name="copy-outline" size={16} color={ORANGE} />
                        <Text style={styles.copyDayBtnText}>Copy day</Text>
                    </Pressable>
                </View>

                {/* Slots */}
                {MEAL_SLOTS.map(slot => (
                    <View key={slot.key} style={styles.mealCard}>
                        {/* Header del slot */}
                        <View style={styles.mealHeader}>
                            <View style={styles.mealHeaderLeft}>
                                <Ionicons name={slot.icon as any} size={18} color="#555" />
                                <Text style={styles.mealLabel}>{slot.label}</Text>
                            </View>
                            {/* Botón copiar slot */}
                            {(dayMeals[slot.key]?.length > 0) && (
                                <Pressable
                                    style={styles.copySlotBtn}
                                    onPress={() => {
                                        setCopyMode("slot");
                                        setCopySlot(slot.key);
                                        setSelectedCopyDays([]);
                                        setShowCopyModal(true);
                                    }}
                                >
                                    <Ionicons name="copy-outline" size={14} color={ORANGE} />
                                    <Text style={styles.copySlotBtnText}>Copy</Text>
                                </Pressable>
                            )}
                        </View>

                        {/* Entradas de comida */}
                        {(dayMeals[slot.key] || []).map(entry => (
                            <View key={entry.id} style={styles.mealEntry}>
                                {/* Info de la receta */}
                                <View style={styles.mealEntryTop}>
                                    {entry.recipe.image ? (
                                        <Image source={{ uri: entry.recipe.image }} style={styles.mealEntryImage} />
                                    ) : (
                                        <View style={styles.mealEntryImagePlaceholder}>
                                            <Ionicons name="restaurant-outline" size={20} color="#bbb" />
                                        </View>
                                    )}
                                    <View style={styles.mealEntryInfo}>
                                        <Text style={styles.mealEntryName}>{entry.recipe.name}</Text>
                                        <Text style={styles.mealEntryMeta}>
                                            {entry.recipe.time} · {entry.recipe.totalCalories} kcal
                                        </Text>
                                    </View>
                                    <Pressable onPress={() => removeMeal(slot.key, entry.id)}>
                                        <Ionicons name="close-circle-outline" size={20} color="#ccc" />
                                    </Pressable>
                                </View>

                                {/* Botones de estado */}
                                <View style={styles.statusRow}>
                                    <Pressable
                                        style={[styles.statusBtn, getStatusStyle(entry.status, "consumed")]}
                                        onPress={() => updateStatus(slot.key, entry.id, "consumed")}
                                    >
                                        <Ionicons name="checkmark" size={18} color={getIconColor(entry.status, "consumed")} />
                                        <Text style={[styles.statusBtnLabel, { color: getIconColor(entry.status, "consumed") }]}>Consumed</Text>
                                    </Pressable>

                                    <Pressable
                                        style={[styles.statusBtn, getStatusStyle(entry.status, "skipped")]}
                                        onPress={() => updateStatus(slot.key, entry.id, "skipped")}
                                    >
                                        <Ionicons name="close" size={18} color={getIconColor(entry.status, "skipped")} />
                                        <Text style={[styles.statusBtnLabel, { color: getIconColor(entry.status, "skipped") }]}>Skipped</Text>
                                    </Pressable>

                                    <Pressable
                                        style={[styles.statusBtn, getStatusStyle(entry.status, "partial")]}
                                        onPress={() => {
                                            if (entry.recipe.ingredients.length > 0) {
                                                setPartialEntry(entry);
                                                setPartialSlot(slot.key);
                                                setShowPartialModal(true);
                                            } else {
                                                updateStatus(slot.key, entry.id, "partial");
                                            }
                                        }}
                                    >
                                        <Ionicons name="remove" size={18} color={getIconColor(entry.status, "partial")} />
                                        <Text style={[styles.statusBtnLabel, { color: getIconColor(entry.status, "partial") }]}>Partial</Text>
                                    </Pressable>
                                </View>
                            </View>
                        ))}

                        {/* Botón agregar */}
                        <Pressable
                            style={styles.addBtn}
                            onPress={() => {
                                setActiveSlot(slot.key);
                                setShowSlotMenu(true);
                            }}
                        >
                            <Ionicons name="add" size={18} color={ORANGE} />
                            <Text style={styles.addBtnText}>Add {slot.label}</Text>
                        </Pressable>
                    </View>
                ))}
            </ScrollView>

            {/* Menú flotante del slot */}
            {showSlotMenu && (
                <>
                    <Pressable style={styles.menuBackdrop} onPress={() => setShowSlotMenu(false)} />
                    <View style={styles.floatingMenu}>
                        <Pressable style={styles.menuItem} onPress={() => { setShowSlotMenu(false); setShowChooseRecipe(true); }}>
                            <Ionicons name="list-outline" size={20} color="#444" />
                            <View>
                                <Text style={styles.menuItemLabel}>Choose recipe</Text>
                                <Text style={styles.menuItemSub}>From your cookbooks</Text>
                            </View>
                        </Pressable>
                        <View style={styles.menuDivider} />
                        <Pressable style={styles.menuItem} onPress={() => { setShowSlotMenu(false); setShowRecipeForm(true); }}>
                            <Ionicons name="create-outline" size={20} color="#444" />
                            <View>
                                <Text style={styles.menuItemLabel}>Create from scratch</Text>
                                <Text style={styles.menuItemSub}>New recipe</Text>
                            </View>
                        </Pressable>
                        <View style={styles.menuDivider} />
                        <Pressable style={styles.menuItem} onPress={() => setShowSlotMenu(false)}>
                            <Ionicons name="document-outline" size={20} color="#ccc" />
                            <View>
                                <Text style={[styles.menuItemLabel, { color: "#ccc" }]}>From PDF</Text>
                                <Text style={styles.menuItemSub}>Coming soon</Text>
                            </View>
                        </Pressable>
                        <View style={styles.menuDivider} />
                        <Pressable style={styles.menuItem} onPress={() => setShowSlotMenu(false)}>
                            <Ionicons name="link-outline" size={20} color="#ccc" />
                            <View>
                                <Text style={[styles.menuItemLabel, { color: "#ccc" }]}>Import from URL</Text>
                                <Text style={styles.menuItemSub}>Coming soon</Text>
                            </View>
                        </Pressable>
                    </View>
                </>
            )}

            {/* Modal elegir receta */}
            <Modal visible={showChooseRecipe} animationType="slide" transparent onRequestClose={() => setShowChooseRecipe(false)}>
                <Pressable style={styles.modalBackdrop} onPress={() => setShowChooseRecipe(false)} />
                <View style={styles.bottomSheet}>
                    <SafeAreaView style={{ flex: 1 }}>
                        <View style={styles.handle} />
                        <View style={styles.sheetHeader}>
                            <Pressable onPress={() => setShowChooseRecipe(false)}>
                                <Ionicons name="close" size={22} color="#aaa" />
                            </Pressable>
                            <Text style={styles.sheetTitle}>Choose Recipe</Text>
                            <View style={{ width: 22 }} />
                        </View>
                        <ScrollView contentContainerStyle={styles.sheetContent}>
                            {recipes.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>No recipes yet</Text>
                                    <Text style={styles.emptySubText}>Go to Cookbooks to create one</Text>
                                </View>
                            ) : (
                                recipes.map(recipe => (
                                    <Pressable
                                        key={recipe.id}
                                        style={styles.recipeRow}
                                        onPress={() => {
                                            if (activeSlot) addMealToSlot(activeSlot, recipe);
                                            setShowChooseRecipe(false);
                                        }}
                                    >
                                        <View style={styles.recipeRowImage}>
                                            {recipe.image
                                                ? <Image source={{ uri: recipe.image }} style={{ width: "100%", height: "100%", borderRadius: 10 }} />
                                                : <Ionicons name="restaurant-outline" size={22} color="#bbb" />
                                            }
                                        </View>
                                        <View style={styles.recipeRowInfo}>
                                            <Text style={styles.recipeRowName}>{recipe.name}</Text>
                                            <Text style={styles.recipeRowMeta}>⏱ {recipe.time} · 🔥 {recipe.totalCalories} kcal</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                                    </Pressable>
                                ))
                            )}
                        </ScrollView>
                    </SafeAreaView>
                </View>
            </Modal>

            {/* RecipeForm */}
            <RecipeForm
                visible={showRecipeForm}
                onClose={() => setShowRecipeForm(false)}
                onSave={(recipe) => {
                    if (activeSlot) addMealToSlot(activeSlot, recipe);
                    setShowRecipeForm(false);
                }}
            />

            {/* Modal Partial */}
            <Modal visible={showPartialModal} animationType="slide" transparent onRequestClose={() => setShowPartialModal(false)}>
                <Pressable style={styles.modalBackdrop} onPress={() => setShowPartialModal(false)} />
                <View style={styles.bottomSheet}>
                    <SafeAreaView style={{ flex: 1 }}>
                        <View style={styles.handle} />
                        <View style={styles.sheetHeader}>
                            <Pressable onPress={() => setShowPartialModal(false)}>
                                <Ionicons name="close" size={22} color="#aaa" />
                            </Pressable>
                            <Text style={styles.sheetTitle}>What did you skip?</Text>
                            <Pressable onPress={() => {
                                if (partialEntry && partialSlot) {
                                    updateStatus(partialSlot, partialEntry.id, "partial", partialEntry.skippedIngredients);
                                }
                                setShowPartialModal(false);
                            }}>
                                <Text style={styles.doneBtn}>Done</Text>
                            </Pressable>
                        </View>
                        <ScrollView contentContainerStyle={styles.sheetContent}>
                            <Text style={styles.partialSubtitle}>Tap the ingredients you didn't consume:</Text>
                            {partialEntry?.recipe.ingredients.map(ing => {
                                const isSkipped = partialEntry.skippedIngredients.includes(ing.id);
                                return (
                                    <Pressable
                                        key={ing.id}
                                        style={styles.ingredientRow}
                                        onPress={() => {
                                            if (!partialEntry) return;
                                            const newSkipped = isSkipped
                                                ? partialEntry.skippedIngredients.filter(id => id !== ing.id)
                                                : [...partialEntry.skippedIngredients, ing.id];
                                            setPartialEntry({ ...partialEntry, skippedIngredients: newSkipped });
                                        }}
                                    >
                                        <View style={[styles.checkbox, isSkipped && styles.checkboxSkipped]}>
                                            {isSkipped && <Ionicons name="close" size={14} color="#fff" />}
                                        </View>
                                        <View style={styles.ingredientInfo}>
                                            <Text style={[styles.ingredientName, isSkipped && styles.ingredientSkipped]}>
                                                {ing.amount}{ing.unit} {ing.name}
                                            </Text>
                                            <Text style={styles.ingredientCals}>{ing.calories} kcal</Text>
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    </SafeAreaView>
                </View>
            </Modal>

            {/* Modal copiar día/slot */}
            <Modal visible={showCopyModal} animationType="slide" transparent onRequestClose={() => setShowCopyModal(false)}>
                <Pressable style={styles.modalBackdrop} onPress={() => setShowCopyModal(false)} />
                <View style={styles.bottomSheet}>
                    <SafeAreaView style={{ flex: 1 }}>
                        <View style={styles.handle} />
                        <View style={styles.sheetHeader}>
                            <Pressable onPress={() => setShowCopyModal(false)}>
                                <Ionicons name="close" size={22} color="#aaa" />
                            </Pressable>
                            <Text style={styles.sheetTitle}>
                                {copyMode === "day" ? "Copy whole day to..." : `Copy ${copySlot} to...`}
                            </Text>
                            <Pressable onPress={handleCopy}>
                                <Text style={[styles.doneBtn, selectedCopyDays.length === 0 && { opacity: 0.3 }]}>Copy</Text>
                            </Pressable>
                        </View>
                        <ScrollView contentContainerStyle={styles.sheetContent}>
                            <Text style={styles.partialSubtitle}>Select the days you want to copy to:</Text>
                            {weekDates.map((date, i) => {
                                const dk = toDateKey(date);
                                const isCurrentDay = dk === currentDateKey;
                                const isChecked = selectedCopyDays.includes(dk);
                                return (
                                    <Pressable
                                        key={dk}
                                        style={[styles.ingredientRow, isCurrentDay && { opacity: 0.3 }]}
                                        onPress={() => !isCurrentDay && toggleCopyDay(dk)}
                                        disabled={isCurrentDay}
                                    >
                                        <View style={[styles.checkbox, isChecked && styles.checkboxConsumed]}>
                                            {isChecked && <Ionicons name="checkmark" size={14} color="#fff" />}
                                        </View>
                                        <Text style={styles.ingredientName}>
                                            {DAYS[i]}, {date.toLocaleDateString("en", { day: "numeric", month: "short" })}
                                            {isCurrentDay ? " (current)" : ""}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    </SafeAreaView>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#fff" },
    weekContainer: { backgroundColor: "#fff", paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1, borderColor: "#f0f0f0", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4 },
    monthLabel: { textAlign: "center", fontSize: 12, fontWeight: "600", color: "#888", letterSpacing: 1, marginBottom: 8 },
    weekRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8 },
    arrow: { fontSize: 24, color: "#888", paddingHorizontal: 4 },
    dayBtn: { alignItems: "center", paddingVertical: 6, paddingHorizontal: 6, borderRadius: 12, minWidth: 36 },
    dayBtnSelected: { backgroundColor: ORANGE },
    dayName: { fontSize: 11, color: "#888", marginBottom: 2 },
    dayNum: { fontSize: 16, fontWeight: "600", color: "#222" },
    dayTextSelected: { color: "#fff" },
    todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: ORANGE, marginTop: 2 },
    scrollContent: { padding: 16, paddingBottom: 40 },
    dayHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
    selectedLabel: { fontSize: 18, fontWeight: "700", color: "#222" },
    copyDayBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: ORANGE },
    copyDayBtnText: { fontSize: 12, color: ORANGE, fontWeight: "600" },
    mealCard: { backgroundColor: "#fafafa", borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#f0f0f0" },
    mealHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
    mealHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
    mealLabel: { fontSize: 15, fontWeight: "600", color: "#222" },
    copySlotBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
    copySlotBtnText: { fontSize: 12, color: ORANGE },
    mealEntry: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#f0f0f0" },
    mealEntryTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
    mealEntryImage: { width: 44, height: 44, borderRadius: 8 },
    mealEntryImagePlaceholder: { width: 44, height: 44, borderRadius: 8, backgroundColor: "#f5f0eb", justifyContent: "center", alignItems: "center" },
    mealEntryInfo: { flex: 1 },
    mealEntryName: { fontSize: 14, fontWeight: "600", color: "#222" },
    mealEntryMeta: { fontSize: 12, color: "#888", marginTop: 2 },
    statusRow: { flexDirection: "row", gap: 8 },
    statusBtn: { flex: 1, flexDirection: "column", alignItems: "center", paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, gap: 4 },
    statusBtnInactive: { borderColor: "#eee", backgroundColor: "#fafafa" },
    statusBtnConsumed: { borderColor: "#a5d6a7", backgroundColor: "#e8f5e9" },
    statusBtnSkipped: { borderColor: "#ef9a9a", backgroundColor: "#ffebee" },
    statusBtnPartial: { borderColor: "#ffcc80", backgroundColor: "#fff3e0" },
    statusBtnLabel: { fontSize: 10, fontWeight: "600" },
    addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1.5, borderColor: ORANGE, borderStyle: "dashed", borderRadius: 10, paddingVertical: 10, marginTop: 4 },
    addBtnText: { color: ORANGE, fontWeight: "500", fontSize: 14 },
    menuBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "transparent" },
    floatingMenu: { position: "absolute", bottom: 80, right: 16, backgroundColor: "#fff", borderRadius: 16, paddingVertical: 8, width: 240, elevation: 8, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
    menuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
    menuItemLabel: { fontSize: 14, fontWeight: "600", color: "#222" },
    menuItemSub: { fontSize: 12, color: "#aaa", marginTop: 1 },
    menuDivider: { height: 1, backgroundColor: "#f0f0f0", marginHorizontal: 16 },
    modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
    bottomSheet: { position: "absolute", left: 0, right: 0, bottom: 0, height: "70%", backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#ddd", alignSelf: "center", marginTop: 10, marginBottom: 4 },
    sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: "#f0f0f0" },
    sheetTitle: { fontSize: 17, fontWeight: "700", color: "#222" },
    doneBtn: { fontSize: 16, color: ORANGE, fontWeight: "700" },
    sheetContent: { padding: 16, paddingBottom: 40 },
    emptyState: { alignItems: "center", paddingVertical: 40 },
    emptyText: { fontSize: 16, fontWeight: "600", color: "#222", marginBottom: 4 },
    emptySubText: { fontSize: 13, color: "#aaa" },
    recipeRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderColor: "#f0f0f0", gap: 12 },
    recipeRowImage: { width: 50, height: 50, borderRadius: 10, backgroundColor: "#f5f0eb", justifyContent: "center", alignItems: "center", overflow: "hidden" },
    recipeRowInfo: { flex: 1 },
    recipeRowName: { fontSize: 14, fontWeight: "600", color: "#222" },
    recipeRowMeta: { fontSize: 12, color: "#888", marginTop: 2 },
    partialSubtitle: { fontSize: 14, color: "#666", marginBottom: 16 },
    ingredientRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderColor: "#f0f0f0", gap: 12 },
    checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: "#ddd", justifyContent: "center", alignItems: "center" },
    checkboxSkipped: { backgroundColor: "#ef5350", borderColor: "#ef5350" },
    checkboxConsumed: { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
    ingredientInfo: { flex: 1 },
    ingredientName: { fontSize: 14, fontWeight: "600", color: "#222" },
    ingredientSkipped: { textDecorationLine: "line-through", color: "#aaa" },
    ingredientCals: { fontSize: 12, color: "#888", marginTop: 2 },
});