import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const ORANGE = "#E07B39";
const USDA_API_KEY = process.env.EXPO_PUBLIC_USDA_API_KEY;

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

export interface Recipe {
    id: string;
    name: string;
    time: string;
    image?: string | null;
    ingredients: Ingredient[];
    steps: string[];
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
}

interface Props {
    visible: boolean;
    onClose: () => void;
    onSave: (recipe: Recipe) => void;
}

async function searchUSDA(ingredientName: string): Promise<any | null> {
    try {
        const res = await fetch(
            `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(ingredientName)}&pageSize=1&api_key=${USDA_API_KEY}`
        );
        const data = await res.json();
        if (data.foods && data.foods.length > 0) return data.foods[0];
        return null;
    } catch (e) {
        console.log("USDA error:", e);
        return null;
    }
}

function getNutrient(food: any, name: string): number {
    const nutrient = food.foodNutrients?.find((n: any) =>
        n.nutrientName?.toLowerCase().includes(name.toLowerCase())
    );
    return nutrient?.value ?? 0;
}

export default function RecipeForm({ visible, onClose, onSave }: Props) {
    const [name, setName] = useState("");
    const [time, setTime] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [steps, setSteps] = useState<string[]>([""]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [ingName, setIngName] = useState("");
    const [ingAmount, setIngAmount] = useState("");
    const [ingUnit, setIngUnit] = useState("g");
    const [searchingUSDA, setSearchingUSDA] = useState(false);

    const totalCalories = ingredients.reduce((s, i) => s + i.calories, 0);
    const totalProtein = ingredients.reduce((s, i) => s + i.protein, 0);
    const totalFat = ingredients.reduce((s, i) => s + i.fat, 0);
    const totalCarbs = ingredients.reduce((s, i) => s + i.carbs, 0);

    const handlePickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission needed", "Please allow access to your photo library.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleAddIngredient = async () => {
        if (!ingName.trim() || !ingAmount.trim()) {
            Alert.alert("Missing info", "Please enter ingredient name and amount.");
            return;
        }
        setSearchingUSDA(true);
        const food = await searchUSDA(ingName);
        setSearchingUSDA(false);

        if (!food) {
            Alert.alert("Not found", `"${ingName}" was not found in USDA database. Try a simpler name.`);
            return;
        }

        const amount = parseFloat(ingAmount) || 100;
        const factor = amount / 100;

        const ingredient: Ingredient = {
            id: Date.now().toString(),
            name: ingName.trim(),
            amount: ingAmount,
            unit: ingUnit,
            calories: Math.round(getNutrient(food, "energy") * factor),
            protein: Math.round(getNutrient(food, "protein") * factor * 10) / 10,
            fat: Math.round(getNutrient(food, "total lipid") * factor * 10) / 10,
            carbs: Math.round(getNutrient(food, "carbohydrate") * factor * 10) / 10,
        };

        setIngredients(prev => [...prev, ingredient]);
        setIngName("");
        setIngAmount("");
        setIngUnit("g");
    };

    const handleRemoveIngredient = (id: string) => {
        setIngredients(prev => prev.filter(i => i.id !== id));
    };

    const handleAddStep = () => setSteps(prev => [...prev, ""]);

    const handleStepChange = (text: string, index: number) => {
        setSteps(prev => prev.map((s, i) => i === index ? text : s));
    };

    const handleRemoveStep = (index: number) => {
        setSteps(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert("Missing info", "Please enter a recipe name.");
            return;
        }
        if (ingredients.length === 0) {
            Alert.alert("Missing info", "Please add at least one ingredient.");
            return;
        }

        const recipe: Recipe = {
            id: Date.now().toString(),
            name: name.trim(),
            time: time.trim() || "N/A",
            image: image ?? null,
            ingredients,
            steps: steps.filter(s => s.trim()),
            totalCalories,
            totalProtein,
            totalFat,
            totalCarbs,
        };

        onSave(recipe);
        setName("");
        setTime("");
        setImage(null);
        setSteps([""]);
        setIngredients([]);
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <SafeAreaView style={styles.safe}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Pressable onPress={onClose}>
                            <Text style={styles.cancelBtn}>Cancel</Text>
                        </Pressable>
                        <Text style={styles.headerTitle}>New Recipe</Text>
                        <Pressable onPress={handleSave}>
                            <Text style={styles.saveBtn}>Save</Text>
                        </Pressable>
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent}>

                        {/* Recipe Info */}
                        <Text style={styles.sectionTitle}>Recipe Info</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Recipe name"
                            placeholderTextColor="#aaa"
                            value={name}
                            onChangeText={setName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Prep time (e.g. 20 min)"
                            placeholderTextColor="#aaa"
                            value={time}
                            onChangeText={setTime}
                        />

                        {/* Imagen */}
                        <Pressable style={styles.imagePicker} onPress={handlePickImage}>
                            {image ? (
                                <Image source={{ uri: image }} style={styles.imagePreview} />
                            ) : (
                                <View style={styles.imagePlaceholderBox}>
                                    <Text style={styles.imagePickerIcon}>📷</Text>
                                    <Text style={styles.imagePickerText}>Add Photo</Text>
                                </View>
                            )}
                        </Pressable>

                        {/* Ingredientes */}
                        <Text style={styles.sectionTitle}>Ingredients</Text>

                        {ingredients.map(ing => (
                            <View key={ing.id} style={styles.ingredientRow}>
                                <View style={styles.ingredientInfo}>
                                    <Text style={styles.ingredientName}>
                                        {ing.amount}{ing.unit} {ing.name}
                                    </Text>
                                    <Text style={styles.ingredientNutrients}>
                                        {ing.calories} kcal · {ing.protein}g protein · {ing.carbs}g carbs · {ing.fat}g fat
                                    </Text>
                                </View>
                                <Pressable onPress={() => handleRemoveIngredient(ing.id)}>
                                    <Text style={styles.removeBtn}>✕</Text>
                                </Pressable>
                            </View>
                        ))}

                        <View style={styles.addIngredientBox}>
                            <TextInput
                                style={[styles.input, { marginBottom: 8 }]}
                                placeholder="Ingredient name (e.g. chicken breast)"
                                placeholderTextColor="#aaa"
                                value={ingName}
                                onChangeText={setIngName}
                            />
                            <View style={styles.amountRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1, marginRight: 8, marginBottom: 0 }]}
                                    placeholder="Amount (e.g. 100)"
                                    placeholderTextColor="#aaa"
                                    value={ingAmount}
                                    onChangeText={setIngAmount}
                                    keyboardType="numeric"
                                />
                                <Pressable
                                    style={styles.unitBtn}
                                    onPress={() => setIngUnit(u => u === "g" ? "ml" : u === "ml" ? "cup" : "g")}
                                >
                                    <Text style={styles.unitBtnText}>{ingUnit}</Text>
                                </Pressable>
                            </View>
                            <Pressable
                                style={[styles.addIngBtn, searchingUSDA && { opacity: 0.6 }]}
                                onPress={handleAddIngredient}
                                disabled={searchingUSDA}
                            >
                                {searchingUSDA
                                    ? <ActivityIndicator color="#fff" />
                                    : <Text style={styles.addIngBtnText}>+ Add Ingredient</Text>
                                }
                            </Pressable>
                        </View>

                        {/* Total nutricional */}
                        {ingredients.length > 0 && (
                            <View style={styles.nutritionBox}>
                                <Text style={styles.nutritionTitle}>Nutritional Total</Text>
                                <View style={styles.nutritionRow}>
                                    <NutrientBadge label="Calories" value={`${totalCalories} kcal`} />
                                    <NutrientBadge label="Protein" value={`${totalProtein}g`} />
                                    <NutrientBadge label="Carbs" value={`${totalCarbs}g`} />
                                    <NutrientBadge label="Fat" value={`${totalFat}g`} />
                                </View>
                            </View>
                        )}

                        {/* Pasos */}
                        <Text style={styles.sectionTitle}>Steps</Text>
                        {steps.map((step, index) => (
                            <View key={index} style={styles.stepRow}>
                                <Text style={styles.stepNumber}>{index + 1}</Text>
                                <TextInput
                                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                    placeholder={`Step ${index + 1}`}
                                    placeholderTextColor="#aaa"
                                    value={step}
                                    onChangeText={text => handleStepChange(text, index)}
                                    multiline
                                />
                                {steps.length > 1 && (
                                    <Pressable onPress={() => handleRemoveStep(index)}>
                                        <Text style={styles.removeBtn}>✕</Text>
                                    </Pressable>
                                )}
                            </View>
                        ))}
                        <Pressable style={styles.addStepBtn} onPress={handleAddStep}>
                            <Text style={styles.addStepBtnText}>+ Add Step</Text>
                        </Pressable>

                    </ScrollView>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </Modal>
    );
}

function NutrientBadge({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.badge}>
            <Text style={styles.badgeValue}>{value}</Text>
            <Text style={styles.badgeLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#fff" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: "#f0f0f0",
    },
    headerTitle: { fontSize: 17, fontWeight: "700", color: "#222" },
    cancelBtn: { fontSize: 16, color: "#888" },
    saveBtn: { fontSize: 16, color: ORANGE, fontWeight: "700" },
    scrollContent: { padding: 16, paddingBottom: 60 },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#222",
        marginTop: 20,
        marginBottom: 10,
    },
    input: {
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        color: "#222",
        marginBottom: 10,
    },
    imagePicker: {
        width: "100%",
        height: 180,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 10,
        backgroundColor: "#f5f5f5",
        borderWidth: 1.5,
        borderColor: "#e0e0e0",
        borderStyle: "dashed",
    },
    imagePreview: {
        width: "100%",
        height: "100%",
    },
    imagePlaceholderBox: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    imagePickerIcon: { fontSize: 32, marginBottom: 8 },
    imagePickerText: { color: "#aaa", fontSize: 14 },
    addIngredientBox: {
        backgroundColor: "#fff8f4",
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: "#f0e0d0",
        marginTop: 8,
    },
    amountRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    unitBtn: {
        backgroundColor: ORANGE,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 10,
    },
    unitBtnText: { color: "#fff", fontWeight: "600" },
    addIngBtn: {
        backgroundColor: ORANGE,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
    },
    addIngBtnText: { color: "#fff", fontWeight: "600" },
    ingredientRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fafafa",
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#f0f0f0",
    },
    ingredientInfo: { flex: 1 },
    ingredientName: { fontSize: 14, fontWeight: "600", color: "#222" },
    ingredientNutrients: { fontSize: 12, color: "#888", marginTop: 2 },
    removeBtn: { fontSize: 16, color: "#ccc", paddingLeft: 8 },
    nutritionBox: {
        backgroundColor: "#fff8f4",
        borderRadius: 12,
        padding: 14,
        marginTop: 12,
        borderWidth: 1,
        borderColor: "#f0e0d0",
    },
    nutritionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#222",
        marginBottom: 10,
    },
    nutritionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    badge: { alignItems: "center" },
    badgeValue: { fontSize: 15, fontWeight: "700", color: ORANGE },
    badgeLabel: { fontSize: 11, color: "#888", marginTop: 2 },
    stepRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        marginBottom: 8,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: ORANGE,
        color: "#fff",
        textAlign: "center",
        lineHeight: 24,
        fontSize: 12,
        fontWeight: "700",
        marginTop: 10,
    },
    addStepBtn: {
        paddingVertical: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#f0f0f0",
        borderRadius: 10,
        marginTop: 4,
    },
    addStepBtnText: { color: "#888", fontSize: 14 },
});