import React from "react";
import {
    Image,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";

const ORANGE = "#E07B39";

interface Ingredient {
    id: string;
    name: string;
    amount: string;
    unit: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
}

interface Recipe {
    id: string;
    name: string;
    time: string;
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
    ingredients: Ingredient[];
    steps: string[];
    image?: string | null;
}

interface Props {
    visible: boolean;
    recipe: Recipe | null;
    onClose: () => void;
    onEdit: () => void;
}

export default function RecipeDetail({ visible, recipe, onClose, onEdit }: Props) {
    if (!recipe) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <Pressable style={styles.backdrop} onPress={onClose} />

            <View style={styles.sheet}>
                <SafeAreaView style={{ flex: 1 }}>
                    {/* Handle */}
                    <View style={styles.handle} />

                    {/* Header */}
                    <View style={styles.header}>
                        <Pressable onPress={onClose}>
                            <Text style={styles.closeBtn}>✕</Text>
                        </Pressable>
                        <Text style={styles.headerTitle} numberOfLines={1}>
                            {recipe.name}
                        </Text>
                        <Pressable style={styles.editBtn} onPress={onEdit}>
                            <Text style={styles.editBtnText}>Edit</Text>
                        </Pressable>
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {recipe.image && (
                            <Image
                                source={{ uri: recipe.image }}
                                style={styles.recipeImage}
                            />
                        )}

                        {/* Meta info */}
                        <View style={styles.metaRow}>
                            <View style={styles.metaBadge}>
                                <Text style={styles.metaIcon}>⏱</Text>
                                <Text style={styles.metaText}>{recipe.time}</Text>
                            </View>
                            <View style={styles.metaBadge}>
                                <Text style={styles.metaIcon}>🔥</Text>
                                <Text style={styles.metaText}>{recipe.totalCalories} kcal</Text>
                            </View>
                        </View>

                        {/* Nutrición */}
                        <View style={styles.nutritionBox}>
                            <Text style={styles.sectionTitle}>Nutrition</Text>
                            <View style={styles.nutritionRow}>
                                <NutrientBadge label="Calories" value={`${recipe.totalCalories}`} unit="kcal" />
                                <NutrientBadge label="Protein" value={`${recipe.totalProtein}`} unit="g" />
                                <NutrientBadge label="Carbs" value={`${recipe.totalCarbs}`} unit="g" />
                                <NutrientBadge label="Fat" value={`${recipe.totalFat}`} unit="g" />
                            </View>
                        </View>

                        {/* Ingredientes */}
                        {recipe.ingredients.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>Ingredients</Text>
                                {recipe.ingredients.map((ing) => (
                                    <View key={ing.id} style={styles.ingredientRow}>
                                        <View style={styles.ingredientDot} />
                                        <View style={styles.ingredientInfo}>
                                            <Text style={styles.ingredientName}>
                                                {ing.amount}{ing.unit} {ing.name}
                                            </Text>
                                            <Text style={styles.ingredientNutrients}>
                                                {ing.calories} kcal · {ing.protein}g protein · {ing.carbs}g carbs · {ing.fat}g fat
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </>
                        )}

                        {/* Pasos */}
                        {recipe.steps.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>Steps</Text>
                                {recipe.steps.map((step, index) => (
                                    <View key={index} style={styles.stepRow}>
                                        <View style={styles.stepNumber}>
                                            <Text style={styles.stepNumberText}>{index + 1}</Text>
                                        </View>
                                        <Text style={styles.stepText}>{step}</Text>
                                    </View>
                                ))}
                            </>
                        )}

                    </ScrollView>
                </SafeAreaView>
            </View>
        </Modal>
    );
}

function NutrientBadge({ label, value, unit }: { label: string; value: string; unit: string }) {
    return (
        <View style={styles.badge}>
            <Text style={styles.badgeValue}>{value}</Text>
            <Text style={styles.badgeUnit}>{unit}</Text>
            <Text style={styles.badgeLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    sheet: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "90%",
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: "hidden",
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#ddd",
        alignSelf: "center",
        marginTop: 10,
        marginBottom: 4,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: "#f0f0f0",
    },
    headerTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: "700",
        color: "#222",
        textAlign: "center",
        marginHorizontal: 8,
    },
    closeBtn: { fontSize: 18, color: "#aaa", padding: 4 },
    editBtn: {
        backgroundColor: ORANGE,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 8,
    },
    editBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
    scrollContent: { padding: 16, paddingBottom: 40 },
    metaRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 16,
    },
    metaBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 6,
    },
    metaIcon: { fontSize: 16 },
    metaText: { fontSize: 14, color: "#444", fontWeight: "500" },
    nutritionBox: {
        backgroundColor: "#fff8f4",
        borderRadius: 14,
        padding: 14,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#f0e0d0",
    },
    nutritionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
    badge: { alignItems: "center" },
    badgeValue: { fontSize: 18, fontWeight: "700", color: ORANGE },
    badgeUnit: { fontSize: 11, color: ORANGE },
    badgeLabel: { fontSize: 11, color: "#888", marginTop: 2 },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#222",
        marginBottom: 12,
        marginTop: 4,
    },
    ingredientRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 10,
        gap: 10,
    },
    ingredientDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: ORANGE,
        marginTop: 6,
    },
    ingredientInfo: { flex: 1 },
    ingredientName: { fontSize: 14, fontWeight: "600", color: "#222" },
    ingredientNutrients: { fontSize: 12, color: "#888", marginTop: 2 },
    stepRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 14,
        gap: 12,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: ORANGE,
        justifyContent: "center",
        alignItems: "center",
    },
    recipeImage: {
        width: "100%",
        height: 200,
        borderRadius: 14,
        marginBottom: 16,
    },
    stepNumberText: { color: "#fff", fontWeight: "700", fontSize: 13 },
    stepText: { flex: 1, fontSize: 14, color: "#444", lineHeight: 22, paddingTop: 4 },
});