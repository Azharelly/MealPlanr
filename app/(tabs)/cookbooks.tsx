import RecipeForm from "@/components/RecipeForm";
import React, { useState } from "react";
import {
    Dimensions,
    Image,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const ORANGE = "#E07B39";
const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

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

const SAMPLE_RECIPES: Recipe[] = [
    { id: "1", name: "Avocado Toast", time: "10 min", totalCalories: 320, totalProtein: 8, totalFat: 12, totalCarbs: 40, ingredients: [], steps: [] },
    { id: "2", name: "Grilled Chicken Salad", time: "25 min", totalCalories: 450, totalProtein: 35, totalFat: 15, totalCarbs: 20, ingredients: [], steps: [] },
    { id: "3", name: "Oatmeal with Berries", time: "15 min", totalCalories: 280, totalProtein: 10, totalFat: 5, totalCarbs: 50, ingredients: [], steps: [] },
    { id: "4", name: "Pasta Bolognese", time: "40 min", totalCalories: 620, totalProtein: 30, totalFat: 20, totalCarbs: 70, ingredients: [], steps: [] },
];

const SAMPLE_GROUPS = [
    { id: "1", name: "Breakfast Ideas", recipeCount: 2 },
    { id: "2", name: "Quick Dinners", recipeCount: 1 },
];

export default function CookbooksScreen() {
    const [search, setSearch] = useState("");
    const [groups, setGroups] = useState(SAMPLE_GROUPS);
    const [recipes, setRecipes] = useState<Recipe[]>(SAMPLE_RECIPES);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [showForm, setShowForm] = useState(false);

    const filteredRecipes = recipes.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreateGroup = () => {
        if (!newGroupName.trim()) return;
        setGroups(prev => [...prev, {
            id: Date.now().toString(),
            name: newGroupName.trim(),
            recipeCount: 0,
        }]);
        setNewGroupName("");
        setShowCreateGroup(false);
    };

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Recipes</Text>
                    <Text style={styles.headerCount}>{recipes.length} recipes</Text>
                </View>

                {/* Buscador */}
                <View style={styles.searchBox}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search recipes..."
                        placeholderTextColor="#aaa"
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                        <Pressable onPress={() => setSearch("")}>
                            <Text style={styles.clearBtn}>✕</Text>
                        </Pressable>
                    )}
                </View>

                {/* Sección Groups */}
                <Text style={styles.sectionTitle}>Groups</Text>
                <View style={styles.grid}>
                    <Pressable
                        style={[styles.card, styles.createGroupCard]}
                        onPress={() => setShowCreateGroup(true)}
                    >
                        <Text style={styles.createGroupIcon}>+</Text>
                        <Text style={styles.createGroupText}>Create Group</Text>
                    </Pressable>

                    {groups.map(group => (
                        <Pressable key={group.id} style={styles.card}>
                            <View style={styles.groupImagePlaceholder}>
                                <Text style={styles.groupEmoji}>📁</Text>
                            </View>
                            <View style={styles.cardInfo}>
                                <Text style={styles.cardName} numberOfLines={2}>{group.name}</Text>
                                <Text style={styles.cardMetaText}>{group.recipeCount} recipes</Text>
                            </View>
                        </Pressable>
                    ))}
                </View>

                {/* Sección All Recipes */}
                <Text style={styles.sectionTitle}>All Recipes</Text>
                {filteredRecipes.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No recipes found</Text>
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {filteredRecipes.map(recipe => (
                            <Pressable key={recipe.id} style={styles.card}>
                                <View style={styles.imagePlaceholder}>
                                    {recipe.image ? (
                                        <Image
                                            source={{ uri: recipe.image }}
                                            style={{ width: "100%", height: "100%" }}
                                        />
                                    ) : (
                                        <Text style={styles.imagePlaceholderText}>🍽️</Text>
                                    )}
                                </View>
                                <View style={styles.cardInfo}>
                                    <Text style={styles.cardName} numberOfLines={2}>{recipe.name}</Text>
                                    <View style={styles.cardMeta}>
                                        <Text style={styles.cardMetaText}>⏱ {recipe.time}</Text>
                                        <Text style={styles.cardMetaText}>🔥 {recipe.totalCalories} kcal</Text>
                                    </View>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Botón + */}
            <Pressable style={styles.fab} onPress={() => setShowForm(true)}>
                <Text style={styles.fabText}>+</Text>
            </Pressable>

            {/* Modal crear grupo */}
            <Modal
                visible={showCreateGroup}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCreateGroup(false)}
            >
                <Pressable style={styles.modalBackdrop} onPress={() => setShowCreateGroup(false)} />
                <View style={styles.modalBox}>
                    <Text style={styles.modalTitle}>New Group</Text>
                    <TextInput
                        style={styles.modalInput}
                        placeholder="Group name (e.g. Breakfast Ideas)"
                        placeholderTextColor="#aaa"
                        value={newGroupName}
                        onChangeText={setNewGroupName}
                        autoFocus
                    />
                    <View style={styles.modalButtons}>
                        <Pressable style={styles.modalCancelBtn} onPress={() => setShowCreateGroup(false)}>
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.modalCreateBtn, !newGroupName.trim() && { opacity: 0.4 }]}
                            onPress={handleCreateGroup}
                            disabled={!newGroupName.trim()}
                        >
                            <Text style={styles.modalCreateText}>Create</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Formulario crear receta */}
            <RecipeForm
                visible={showForm}
                onClose={() => setShowForm(false)}
                onSave={(recipe) => {
                    setRecipes(prev => [...prev, recipe]);
                    setShowForm(false);
                }}
            />

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#fff" },
    scrollContent: { paddingBottom: 100 },
    header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderColor: "#f0f0f0" },
    headerTitle: { fontSize: 22, fontWeight: "700", color: "#222" },
    headerCount: { fontSize: 13, color: "#888", marginTop: 2 },
    searchBox: { flexDirection: "row", alignItems: "center", margin: 16, backgroundColor: "#f5f5f5", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
    searchIcon: { fontSize: 16, marginRight: 8 },
    searchInput: { flex: 1, fontSize: 15, color: "#222" },
    clearBtn: { fontSize: 14, color: "#aaa", paddingHorizontal: 4 },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: "#222", paddingHorizontal: 16, marginBottom: 12, marginTop: 4 },
    grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 16, marginBottom: 24 },
    card: { width: CARD_WIDTH, backgroundColor: "#fafafa", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#f0f0f0", elevation: 2, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6 },
    createGroupCard: { justifyContent: "center", alignItems: "center", height: CARD_WIDTH * 1.1, borderWidth: 1.5, borderColor: ORANGE, borderStyle: "dashed", backgroundColor: "#fff8f4" },
    createGroupIcon: { fontSize: 32, color: ORANGE, marginBottom: 6 },
    createGroupText: { fontSize: 13, fontWeight: "600", color: ORANGE },
    groupImagePlaceholder: { width: "100%", height: CARD_WIDTH * 0.75, backgroundColor: "#f5f0eb", justifyContent: "center", alignItems: "center" },
    groupEmoji: { fontSize: 36 },
    imagePlaceholder: { width: "100%", height: CARD_WIDTH * 0.75, backgroundColor: "#f5f0eb", justifyContent: "center", alignItems: "center" },
    imagePlaceholderText: { fontSize: 36 },
    cardInfo: { padding: 10 },
    cardName: { fontSize: 14, fontWeight: "600", color: "#222", marginBottom: 6 },
    cardMeta: { flexDirection: "row", justifyContent: "space-between" },
    cardMetaText: { fontSize: 11, color: "#888" },
    emptyState: { alignItems: "center", paddingVertical: 32 },
    emptyText: { color: "#aaa", fontSize: 15 },
    fab: { position: "absolute", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: ORANGE, justifyContent: "center", alignItems: "center", elevation: 6, shadowColor: ORANGE, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
    fabText: { color: "#fff", fontSize: 28, fontWeight: "300", marginTop: -2 },
    modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
    modalBox: { position: "absolute", left: 24, right: 24, top: "40%", backgroundColor: "#fff", borderRadius: 18, padding: 24, elevation: 10 },
    modalTitle: { fontSize: 18, fontWeight: "700", color: "#222", marginBottom: 16 },
    modalInput: { backgroundColor: "#f5f5f5", borderRadius: 10, padding: 12, fontSize: 15, color: "#222", marginBottom: 20 },
    modalButtons: { flexDirection: "row", gap: 12 },
    modalCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: "#ddd", alignItems: "center" },
    modalCancelText: { color: "#666", fontWeight: "500" },
    modalCreateBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: ORANGE, alignItems: "center" },
    modalCreateText: { color: "#fff", fontWeight: "600" },
});