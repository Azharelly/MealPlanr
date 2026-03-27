import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const ORANGE = "#E07B39";
const USDA_API_KEY = process.env.EXPO_PUBLIC_USDA_API_KEY;

interface ShoppingItem {
    id: string;
    name: string;
    amount: string;
    unit: string;
    category: string;
    checked: boolean;
    recipeName: string;
}

interface CategoryGroup {
    [category: string]: ShoppingItem[];
}

const CATEGORY_MAP: { [key: string]: string } = {
    "Poultry Products": "Meat & Fish",
    "Finfish and Shellfish Products": "Meat & Fish",
    "Beef Products": "Meat & Fish",
    "Pork Products": "Meat & Fish",
    "Lamb, Veal, and Game Products": "Meat & Fish",
    "Sausages and Luncheon Meats": "Meat & Fish",
    "Dairy and Egg Products": "Dairy & Eggs",
    "Vegetables and Vegetable Products": "Vegetables",
    "Legumes and Legume Products": "Vegetables",
    "Fruits and Fruit Juices": "Fruits",
    "Cereal Grains and Pasta": "Grains & Bread",
    "Baked Products": "Grains & Bread",
    "Breakfast Cereals": "Grains & Bread",
    "Nut and Seed Products": "Nuts & Seeds",
    "Fats and Oils": "Oils & Condiments",
    "Soups, Sauces, and Gravies": "Oils & Condiments",
    "Spices and Herbs": "Oils & Condiments",
    "Sweets": "Sweets",
    "Beverages": "Beverages",
};

const CATEGORY_ICONS: { [key: string]: string } = {
    "Meat & Fish": "fish-outline",
    "Dairy & Eggs": "egg-outline",
    "Vegetables": "leaf-outline",
    "Fruits": "nutrition-outline",
    "Grains & Bread": "pizza-outline",
    "Nuts & Seeds": "flower-outline",
    "Oils & Condiments": "flask-outline",
    "Sweets": "ice-cream-outline",
    "Beverages": "cafe-outline",
    "Other": "basket-outline",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekDates() {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((day + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

async function getCategoryFromUSDA(ingredientName: string): Promise<string> {
    try {
        const res = await fetch(
            `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(ingredientName)}&pageSize=1&api_key=${USDA_API_KEY}`
        );
        const data = await res.json();
        if (data.foods && data.foods.length > 0) {
            const foodCategory = data.foods[0].foodCategory || "";
            return CATEGORY_MAP[foodCategory] || "Other";
        }
        return "Other";
    } catch {
        return "Other";
    }
}

// Datos de ejemplo para mostrar la UI
const SAMPLE_ITEMS: ShoppingItem[] = [
    { id: "1", name: "Chicken breast", amount: "200", unit: "g", category: "Meat & Fish", checked: false, recipeName: "Grilled Chicken Salad" },
    { id: "2", name: "Mixed greens", amount: "100", unit: "g", category: "Vegetables", checked: false, recipeName: "Grilled Chicken Salad" },
    { id: "3", name: "Avocado", amount: "1", unit: "", category: "Fruits", checked: true, recipeName: "Avocado Toast" },
    { id: "4", name: "Bread", amount: "2", unit: "slices", category: "Grains & Bread", checked: false, recipeName: "Avocado Toast" },
    { id: "5", name: "Oats", amount: "80", unit: "g", category: "Grains & Bread", checked: false, recipeName: "Oatmeal with Berries" },
    { id: "6", name: "Blueberries", amount: "50", unit: "g", category: "Fruits", checked: false, recipeName: "Oatmeal with Berries" },
    { id: "7", name: "Milk", amount: "200", unit: "ml", category: "Dairy & Eggs", checked: false, recipeName: "Oatmeal with Berries" },
    { id: "8", name: "Olive oil", amount: "15", unit: "ml", category: "Oils & Condiments", checked: false, recipeName: "Grilled Chicken Salad" },
];

export default function ShoppingListScreen() {
    const [items, setItems] = useState<ShoppingItem[]>(SAMPLE_ITEMS);
    const [showRangeModal, setShowRangeModal] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [hideChecked, setHideChecked] = useState(false);

    const weekDates = getWeekDates();

    const toggleItem = (id: string) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
    };

    const clearChecked = () => {
        setItems(prev => prev.filter(item => !item.checked));
    };

    const toggleDay = (dk: string) => {
        setSelectedDays(prev =>
            prev.includes(dk) ? prev.filter(d => d !== dk) : [...prev, dk]
        );
    };

    // Simula generación desde calendario — cuando haya backend usará datos reales
    const handleGenerate = async () => {
        if (selectedDays.length === 0) return;
        setGenerating(true);
        setShowRangeModal(false);

        // Aquí irá la lógica real cuando tengamos backend
        // Por ahora solo esperamos 1.5s para simular
        await new Promise(resolve => setTimeout(resolve, 1500));

        setGenerating(false);
        setSelectedDays([]);
    };

    // Agrupa items por categoría
    const displayItems = hideChecked ? items.filter(i => !i.checked) : items;
    const grouped = displayItems.reduce<CategoryGroup>((acc, item) => {
        const cat = item.category || "Other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    const checkedCount = items.filter(i => i.checked).length;
    const totalCount = items.length;

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Shopping List</Text>
                    <Text style={styles.headerCount}>
                        {checkedCount}/{totalCount} items checked
                    </Text>
                </View>
                <Pressable
                    style={styles.generateBtn}
                    onPress={() => setShowRangeModal(true)}
                >
                    <Ionicons name="calendar-outline" size={16} color="#fff" />
                    <Text style={styles.generateBtnText}>Generate</Text>
                </Pressable>
            </View>

            {/* Barra de progreso */}
            <View style={styles.progressBar}>
                <View
                    style={[
                        styles.progressFill,
                        { width: totalCount > 0 ? `${(checkedCount / totalCount) * 100}%` : "0%" as any }
                    ]}
                />
            </View>

            {/* Opciones */}
            <View style={styles.optionsRow}>
                <Pressable
                    style={[styles.optionBtn, hideChecked && styles.optionBtnActive]}
                    onPress={() => setHideChecked(prev => !prev)}
                >
                    <Ionicons
                        name={hideChecked ? "eye-off-outline" : "eye-outline"}
                        size={14}
                        color={hideChecked ? ORANGE : "#888"}
                    />
                    <Text style={[styles.optionBtnText, hideChecked && styles.optionBtnTextActive]}>
                        Hide checked
                    </Text>
                </Pressable>

                {checkedCount > 0 && (
                    <Pressable style={styles.clearBtn} onPress={clearChecked}>
                        <Ionicons name="trash-outline" size={14} color="#ff6b6b" />
                        <Text style={styles.clearBtnText}>Clear checked</Text>
                    </Pressable>
                )}
            </View>

            {/* Loading */}
            {generating && (
                <View style={styles.loadingBox}>
                    <ActivityIndicator color={ORANGE} />
                    <Text style={styles.loadingText}>Generating from your meal plan...</Text>
                </View>
            )}

            {/* Lista por categorías */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {Object.keys(grouped).length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="basket-outline" size={56} color="#ddd" />
                        <Text style={styles.emptyText}>Your list is empty</Text>
                        <Text style={styles.emptySubText}>
                            Tap "Generate" to create a list from your meal plan
                        </Text>
                    </View>
                ) : (
                    Object.entries(grouped).map(([category, categoryItems]) => (
                        <View key={category} style={styles.categorySection}>
                            {/* Header de categoría */}
                            <View style={styles.categoryHeader}>
                                <View style={styles.categoryIconBox}>
                                    <Ionicons
                                        name={CATEGORY_ICONS[category] as any || "basket-outline"}
                                        size={16}
                                        color={ORANGE}
                                    />
                                </View>
                                <Text style={styles.categoryTitle}>{category}</Text>
                                <Text style={styles.categoryCount}>
                                    {categoryItems.filter(i => i.checked).length}/{categoryItems.length}
                                </Text>
                            </View>

                            {/* Items de la categoría */}
                            {categoryItems.map(item => (
                                <Pressable
                                    key={item.id}
                                    style={styles.itemRow}
                                    onPress={() => toggleItem(item.id)}
                                >
                                    <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                                        {item.checked && (
                                            <Ionicons name="checkmark" size={14} color="#fff" />
                                        )}
                                    </View>
                                    <View style={styles.itemInfo}>
                                        <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
                                            {item.name}
                                        </Text>
                                        <Text style={styles.itemMeta}>
                                            {item.amount}{item.unit ? ` ${item.unit}` : ""} · {item.recipeName}
                                        </Text>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Modal seleccionar rango de días */}
            <Modal
                visible={showRangeModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowRangeModal(false)}
            >
                <Pressable style={styles.modalBackdrop} onPress={() => setShowRangeModal(false)} />
                <View style={styles.bottomSheet}>
                    <SafeAreaView style={{ flex: 1 }}>
                        <View style={styles.handle} />
                        <View style={styles.sheetHeader}>
                            <Pressable onPress={() => setShowRangeModal(false)}>
                                <Ionicons name="close" size={22} color="#aaa" />
                            </Pressable>
                            <Text style={styles.sheetTitle}>Select days</Text>
                            <Pressable
                                onPress={handleGenerate}
                                disabled={selectedDays.length === 0}
                            >
                                <Text style={[
                                    styles.generateDoneBtn,
                                    selectedDays.length === 0 && { opacity: 0.3 }
                                ]}>
                                    Generate
                                </Text>
                            </Pressable>
                        </View>

                        <ScrollView contentContainerStyle={styles.sheetContent}>
                            <Text style={styles.sheetSubtitle}>
                                Select the days to generate your shopping list from:
                            </Text>
                            {weekDates.map((date, i) => {
                                const dk = date.toISOString().split("T")[0];
                                const isChecked = selectedDays.includes(dk);
                                return (
                                    <Pressable
                                        key={dk}
                                        style={styles.dayRow}
                                        onPress={() => toggleDay(dk)}
                                    >
                                        <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                                            {isChecked && <Ionicons name="checkmark" size={14} color="#fff" />}
                                        </View>
                                        <View style={styles.dayInfo}>
                                            <Text style={styles.dayName}>{DAYS[i]}</Text>
                                            <Text style={styles.dayDate}>
                                                {date.toLocaleDateString("en", { day: "numeric", month: "short" })}
                                            </Text>
                                        </View>
                                    </Pressable>
                                );
                            })}

                            {/* Selector rápido */}
                            <View style={styles.quickSelectRow}>
                                <Pressable
                                    style={styles.quickBtn}
                                    onPress={() => setSelectedDays(weekDates.map(d => d.toISOString().split("T")[0]))}
                                >
                                    <Text style={styles.quickBtnText}>Select all</Text>
                                </Pressable>
                                <Pressable
                                    style={styles.quickBtn}
                                    onPress={() => setSelectedDays([])}
                                >
                                    <Text style={styles.quickBtnText}>Clear</Text>
                                </Pressable>
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#fff" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderColor: "#f0f0f0" },
    headerTitle: { fontSize: 22, fontWeight: "700", color: "#222" },
    headerCount: { fontSize: 13, color: "#888", marginTop: 2 },
    generateBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: ORANGE, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
    generateBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
    progressBar: { height: 4, backgroundColor: "#f0f0f0", marginHorizontal: 16, borderRadius: 2, marginTop: 12 },
    progressFill: { height: "100%", backgroundColor: ORANGE, borderRadius: 2 },
    optionsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 },
    optionBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: "#eee" },
    optionBtnActive: { borderColor: ORANGE, backgroundColor: "#fff8f4" },
    optionBtnText: { fontSize: 13, color: "#888" },
    optionBtnTextActive: { color: ORANGE },
    clearBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6 },
    clearBtnText: { fontSize: 13, color: "#ff6b6b" },
    loadingBox: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#fff8f4", marginHorizontal: 16, borderRadius: 10, marginBottom: 8 },
    loadingText: { fontSize: 13, color: ORANGE },
    scrollContent: { padding: 16, paddingBottom: 40 },
    emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
    emptyText: { fontSize: 18, fontWeight: "600", color: "#222" },
    emptySubText: { fontSize: 14, color: "#aaa", textAlign: "center", paddingHorizontal: 32 },
    categorySection: { marginBottom: 20 },
    categoryHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    categoryIconBox: { width: 28, height: 28, borderRadius: 8, backgroundColor: "#fff8f4", justifyContent: "center", alignItems: "center" },
    categoryTitle: { flex: 1, fontSize: 14, fontWeight: "700", color: "#222" },
    categoryCount: { fontSize: 12, color: "#aaa" },
    itemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderColor: "#f5f5f5", gap: 12 },
    checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: "#ddd", justifyContent: "center", alignItems: "center" },
    checkboxChecked: { backgroundColor: ORANGE, borderColor: ORANGE },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 14, fontWeight: "500", color: "#222" },
    itemNameChecked: { textDecorationLine: "line-through", color: "#bbb" },
    itemMeta: { fontSize: 12, color: "#aaa", marginTop: 2 },
    modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
    bottomSheet: { position: "absolute", left: 0, right: 0, bottom: 0, height: "70%", backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#ddd", alignSelf: "center", marginTop: 10, marginBottom: 4 },
    sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: "#f0f0f0" },
    sheetTitle: { fontSize: 17, fontWeight: "700", color: "#222" },
    generateDoneBtn: { fontSize: 16, color: ORANGE, fontWeight: "700" },
    sheetContent: { padding: 16, paddingBottom: 40 },
    sheetSubtitle: { fontSize: 14, color: "#666", marginBottom: 16 },
    dayRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderColor: "#f0f0f0", gap: 12 },
    dayInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
    dayName: { fontSize: 15, fontWeight: "600", color: "#222" },
    dayDate: { fontSize: 13, color: "#888" },
    quickSelectRow: { flexDirection: "row", gap: 12, marginTop: 16 },
    quickBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: "#eee", alignItems: "center" },
    quickBtnText: { fontSize: 14, color: "#666" },
});