import RecipeDetail from "@/components/RecipeDetail";
import { Recipe } from "@/components/RecipeForm";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
    Alert,
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

export interface Group {
    id: string;
    name: string;
    image?: string | null;
    recipeIds: string[];
}

interface Props {
    visible: boolean;
    group: Group | null;
    allRecipes: Recipe[];
    onClose: () => void;
    onUpdateGroup: (group: Group) => void;
    onCreateRecipe: () => void;
}

export default function GroupDetail({
    visible,
    group,
    allRecipes,
    onClose,
    onUpdateGroup,
    onCreateRecipe,
}: Props) {
    const [showSelectRecipes, setShowSelectRecipes] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [showRecipeDetail, setShowRecipeDetail] = useState(false);

    useEffect(() => {
        if (group) setEditName(group.name);
        setIsEditing(false);
    }, [group, visible]);

    if (!group) return null;

    const groupRecipes = allRecipes.filter(r => group.recipeIds.includes(r.id));

    const handlePickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });
        if (!result.canceled) {
            onUpdateGroup({ ...group, image: result.assets[0].uri });
        }
    };

    const handleToggleRecipe = (recipeId: string) => {
        const already = group.recipeIds.includes(recipeId);
        const newIds = already
            ? group.recipeIds.filter(id => id !== recipeId)
            : [...group.recipeIds, recipeId];
        onUpdateGroup({ ...group, recipeIds: newIds });
    };

    const handleRemoveRecipe = (recipe: Recipe) => {
        Alert.alert(
            "Remove from group",
            `Are you sure you want to remove "${recipe.name}" from this group?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: () => {
                        onUpdateGroup({
                            ...group,
                            recipeIds: group.recipeIds.filter(id => id !== recipe.id),
                        });
                    },
                },
            ]
        );
    };

    const handleSaveEdit = () => {
        if (!editName.trim()) return;
        onUpdateGroup({ ...group, name: editName.trim() });
        setIsEditing(false);
    };

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

                        {isEditing ? (
                            <TextInput
                                style={styles.editNameInput}
                                value={editName}
                                onChangeText={setEditName}
                                autoFocus
                            />
                        ) : (
                            <Text style={styles.headerTitle} numberOfLines={1}>
                                {group.name}
                            </Text>
                        )}

                        {isEditing ? (
                            <Pressable
                                style={styles.doneBtn}
                                onPress={handleSaveEdit}
                            >
                                <Text style={styles.doneBtnText}>Done</Text>
                            </Pressable>
                        ) : (
                            <Pressable
                                style={styles.editBtn}
                                onPress={() => setIsEditing(true)}
                            >
                                <Text style={styles.editBtnText}>Edit</Text>
                            </Pressable>
                        )}
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent}>

                        {/* Imagen de portada */}
                        <Pressable style={styles.coverImage} onPress={handlePickImage}>
                            {group.image ? (
                                <Image source={{ uri: group.image }} style={styles.coverImageFill} />
                            ) : (
                                <View style={styles.coverPlaceholder}>
                                    <Text style={styles.coverPlaceholderIcon}>🖼️</Text>
                                    <Text style={styles.coverPlaceholderText}>Add cover photo</Text>
                                </View>
                            )}
                            <View style={styles.coverEditBadge}>
                                <Text style={styles.coverEditText}>📷 Edit</Text>
                            </View>
                        </Pressable>

                        {/* Info */}
                        <Text style={styles.recipeCount}>
                            {groupRecipes.length} {groupRecipes.length === 1 ? "recipe" : "recipes"}
                        </Text>

                        {/* Grid de recetas del grupo */}
                        {groupRecipes.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyIcon}>🍽️</Text>
                                <Text style={styles.emptyText}>No recipes yet</Text>
                                <Text style={styles.emptySubText}>Tap + to add recipes to this group</Text>
                            </View>
                        ) : (
                            <View style={styles.grid}>
                                {groupRecipes.map(recipe => (
                                    <Pressable
                                        key={recipe.id}
                                        style={styles.card}
                                        onPress={() => {
                                            if (!isEditing) {
                                                setSelectedRecipe(recipe);
                                                setShowRecipeDetail(true);
                                            }
                                        }}
                                    >
                                        <View style={styles.cardImage}>
                                            {recipe.image ? (
                                                <Image
                                                    source={{ uri: recipe.image }}
                                                    style={{ width: "100%", height: "100%" }}
                                                />
                                            ) : (
                                                <Text style={styles.cardImageEmoji}>🍽️</Text>
                                            )}
                                        </View>
                                        <View style={styles.cardInfo}>
                                            <Text style={styles.cardName} numberOfLines={2}>
                                                {recipe.name}
                                            </Text>
                                            <Text style={styles.cardMeta}>
                                                🔥 {recipe.totalCalories} kcal
                                            </Text>
                                        </View>

                                        {/* X para eliminar en modo edición */}
                                        {isEditing && (
                                            <Pressable
                                                style={styles.removeRecipeBtn}
                                                onPress={() => handleRemoveRecipe(recipe)}
                                            >
                                                <Text style={styles.removeRecipeBtnText}>✕</Text>
                                            </Pressable>
                                        )}
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </ScrollView>

                    {/* Menú flotante */}
                    {showMenu && (
                        <>
                            <Pressable
                                style={styles.menuBackdrop}
                                onPress={() => setShowMenu(false)}
                            />
                            <View style={styles.floatingMenu}>
                                <Pressable
                                    style={styles.menuItem}
                                    onPress={() => {
                                        setShowMenu(false);
                                        setShowSelectRecipes(true);
                                    }}
                                >
                                    <Text style={styles.menuItemIcon}>📋</Text>
                                    <View>
                                        <Text style={styles.menuItemLabel}>Select existing</Text>
                                        <Text style={styles.menuItemSub}>From your recipes</Text>
                                    </View>
                                </Pressable>
                                <View style={styles.menuDivider} />
                                <Pressable
                                    style={styles.menuItem}
                                    onPress={() => {
                                        setShowMenu(false);
                                        onCreateRecipe();
                                    }}
                                >
                                    <Text style={styles.menuItemIcon}>✏️</Text>
                                    <View>
                                        <Text style={styles.menuItemLabel}>Create new recipe</Text>
                                        <Text style={styles.menuItemSub}>Add from scratch</Text>
                                    </View>
                                </Pressable>
                            </View>
                        </>
                    )}

                    {/* Botón + */}
                    <Pressable
                        style={styles.fab}
                        onPress={() => setShowMenu(prev => !prev)}
                    >
                        <Text style={styles.fabText}>+</Text>
                    </Pressable>
                </SafeAreaView>
            </View>

            {/* Modal seleccionar recetas existentes */}
            <Modal
                visible={showSelectRecipes}
                animationType="slide"
                transparent
                onRequestClose={() => setShowSelectRecipes(false)}
            >
                <Pressable
                    style={styles.backdrop}
                    onPress={() => setShowSelectRecipes(false)}
                />
                <View style={[styles.sheet, { height: "70%" }]}>
                    <SafeAreaView style={{ flex: 1 }}>
                        <View style={styles.handle} />
                        <View style={styles.header}>
                            <Pressable onPress={() => setShowSelectRecipes(false)}>
                                <Text style={styles.closeBtn}>✕</Text>
                            </Pressable>
                            <Text style={styles.headerTitle}>Select Recipes</Text>
                            <Pressable onPress={() => setShowSelectRecipes(false)}>
                                <Text style={styles.doneBtnText}>Done</Text>
                            </Pressable>
                        </View>
                        <ScrollView contentContainerStyle={styles.scrollContent}>
                            {allRecipes.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>No recipes yet</Text>
                                    <Text style={styles.emptySubText}>Create a recipe first</Text>
                                </View>
                            ) : (
                                allRecipes.map(recipe => {
                                    const isSelected = group.recipeIds.includes(recipe.id);
                                    return (
                                        <Pressable
                                            key={recipe.id}
                                            style={styles.selectRow}
                                            onPress={() => handleToggleRecipe(recipe.id)}
                                        >
                                            <View style={styles.selectImageBox}>
                                                {recipe.image ? (
                                                    <Image
                                                        source={{ uri: recipe.image }}
                                                        style={{ width: "100%", height: "100%", borderRadius: 10 }}
                                                    />
                                                ) : (
                                                    <Text style={{ fontSize: 24 }}>🍽️</Text>
                                                )}
                                            </View>
                                            <View style={styles.selectInfo}>
                                                <Text style={styles.selectName}>{recipe.name}</Text>
                                                <Text style={styles.selectMeta}>
                                                    ⏱ {recipe.time} · 🔥 {recipe.totalCalories} kcal
                                                </Text>
                                            </View>
                                            <View style={[
                                                styles.checkbox,
                                                isSelected && styles.checkboxSelected
                                            ]}>
                                                {isSelected && (
                                                    <Text style={styles.checkmark}>✓</Text>
                                                )}
                                            </View>
                                        </Pressable>
                                    );
                                })
                            )}
                        </ScrollView>
                    </SafeAreaView>
                </View>
            </Modal>

            {/* Recipe Detail desde grupo */}
            <RecipeDetail
                visible={showRecipeDetail}
                recipe={selectedRecipe}
                onClose={() => setShowRecipeDetail(false)}
                onEdit={() => setShowRecipeDetail(false)}
            />
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
    sheet: {
        position: "absolute",
        left: 0, right: 0, bottom: 0,
        height: "90%",
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: "hidden",
    },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#ddd", alignSelf: "center", marginTop: 10, marginBottom: 4 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: "#f0f0f0" },
    headerTitle: { flex: 1, fontSize: 17, fontWeight: "700", color: "#222", textAlign: "center", marginHorizontal: 8 },
    editNameInput: { flex: 1, fontSize: 17, fontWeight: "700", color: "#222", textAlign: "center", marginHorizontal: 8, borderBottomWidth: 2, borderColor: ORANGE, paddingBottom: 2 },
    closeBtn: { fontSize: 18, color: "#aaa", padding: 4 },
    editBtn: { backgroundColor: ORANGE, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
    editBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
    doneBtn: { backgroundColor: ORANGE, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
    doneBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
    scrollContent: { padding: 16, paddingBottom: 100 },
    coverImage: { width: "100%", height: 160, borderRadius: 14, overflow: "hidden", marginBottom: 12, backgroundColor: "#f5f0eb" },
    coverImageFill: { width: "100%", height: "100%" },
    coverPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
    coverPlaceholderIcon: { fontSize: 36, marginBottom: 8 },
    coverPlaceholderText: { color: "#aaa", fontSize: 14 },
    coverEditBadge: { position: "absolute", bottom: 8, right: 8, backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    coverEditText: { color: "#fff", fontSize: 12 },
    recipeCount: { fontSize: 13, color: "#888", marginBottom: 16 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
    card: { width: CARD_WIDTH, backgroundColor: "#fafafa", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#f0f0f0" },
    cardImage: { width: "100%", height: CARD_WIDTH * 0.75, backgroundColor: "#f5f0eb", justifyContent: "center", alignItems: "center" },
    cardImageEmoji: { fontSize: 32 },
    cardInfo: { padding: 10 },
    cardName: { fontSize: 14, fontWeight: "600", color: "#222", marginBottom: 4 },
    cardMeta: { fontSize: 11, color: "#888" },
    removeRecipeBtn: {
        position: "absolute",
        top: 6,
        right: 6,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "rgba(0,0,0,0.55)",
        justifyContent: "center",
        alignItems: "center",
    },
    removeRecipeBtnText: { color: "#fff", fontSize: 11, fontWeight: "700" },
    emptyState: { alignItems: "center", paddingVertical: 40 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 16, fontWeight: "600", color: "#222", marginBottom: 4 },
    emptySubText: { fontSize: 13, color: "#aaa" },
    menuBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "transparent" },
    floatingMenu: { position: "absolute", bottom: 90, right: 24, backgroundColor: "#fff", borderRadius: 16, paddingVertical: 8, width: 220, elevation: 8, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
    menuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
    menuItemIcon: { fontSize: 20 },
    menuItemLabel: { fontSize: 14, fontWeight: "600", color: "#222" },
    menuItemSub: { fontSize: 12, color: "#aaa", marginTop: 1 },
    menuDivider: { height: 1, backgroundColor: "#f0f0f0", marginHorizontal: 16 },
    fab: { position: "absolute", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: ORANGE, justifyContent: "center", alignItems: "center", elevation: 6, shadowColor: ORANGE, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
    fabText: { color: "#fff", fontSize: 28, fontWeight: "300", marginTop: -2 },
    selectRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderColor: "#f0f0f0", gap: 12 },
    selectImageBox: { width: 50, height: 50, borderRadius: 10, backgroundColor: "#f5f0eb", justifyContent: "center", alignItems: "center", overflow: "hidden" },
    selectInfo: { flex: 1 },
    selectName: { fontSize: 14, fontWeight: "600", color: "#222" },
    selectMeta: { fontSize: 12, color: "#888", marginTop: 2 },
    checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: "#ddd", justifyContent: "center", alignItems: "center" },
    checkboxSelected: { backgroundColor: ORANGE, borderColor: ORANGE },
    checkmark: { color: "#fff", fontSize: 14, fontWeight: "700" },
});