import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const MOCK_INGREDIENTS = ["pâtes", "lardons", "oeuf", "parmesan", "poivre"];

export default function PostScreen() {
  const [mealName, setMealName] = React.useState("");
  const [ingredients, setIngredients] = React.useState<string[]>([]);
  const [inputIngredient, setInputIngredient] = React.useState("");
  const [visibility, setVisibility] = React.useState<"public" | "private">(
    "public",
  );

  function addIngredient() {
    if (inputIngredient.trim() === "") return;
    setIngredients([...ingredients, inputIngredient.trim().toLowerCase()]);
    setInputIngredient("");
  }

  function removeIngredient(index: number) {
    setIngredients(ingredients.filter((_, i) => i !== index));
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {/* Topbar */}
        <View style={styles.topbar}>
          <Text style={styles.topbarTitle}>Nouveau repas</Text>
        </View>

        {/* Zone photo */}
        <TouchableOpacity style={styles.photoZone}>
          <Ionicons name="camera-outline" size={32} color="#993C1D" />
          <Text style={styles.photoText}>Ajouter une photo</Text>
        </TouchableOpacity>

        {/* Nom du plat */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Nom du plat</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Tagliatelles carbonara"
            placeholderTextColor="#bbb"
            value={mealName}
            onChangeText={setMealName}
          />
        </View>

        {/* Ingrédients */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Ingrédients</Text>
          <View style={styles.ingredientInput}>
            <TextInput
              style={styles.ingredientTextInput}
              placeholder="Ajouter un ingrédient..."
              placeholderTextColor="#bbb"
              value={inputIngredient}
              onChangeText={setInputIngredient}
              onSubmitEditing={addIngredient}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={addIngredient} style={styles.addBtn}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.chips}>
            {ingredients.map((ing, index) => (
              <TouchableOpacity
                key={index}
                style={styles.chip}
                onPress={() => removeIngredient(index)}
              >
                <Text style={styles.chipText}>{ing}</Text>
                <Ionicons name="close" size={12} color="#3C3489" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Visibilité */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Visibilité</Text>
          <View style={styles.visibilityRow}>
            <TouchableOpacity
              style={[
                styles.visBtn,
                visibility === "public" && styles.visBtnActive,
              ]}
              onPress={() => setVisibility("public")}
            >
              <Text
                style={[
                  styles.visBtnText,
                  visibility === "public" && styles.visBtnTextActive,
                ]}
              >
                🌍 Public
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.visBtn,
                visibility === "private" && styles.visBtnActive,
              ]}
              onPress={() => setVisibility("private")}
            >
              <Text
                style={[
                  styles.visBtnText,
                  visibility === "private" && styles.visBtnTextActive,
                ]}
              >
                🔒 Amis uniquement
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bouton publier */}
        <TouchableOpacity style={styles.publishBtn}>
          <Text style={styles.publishText}>Publier le repas</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topbar: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1EFE8",
  },
  topbarTitle: { fontSize: 18, fontWeight: "500", color: "#1a1a1a" },
  photoZone: {
    margin: 16,
    height: 180,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#F0997B",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FAECE7",
  },
  photoText: { fontSize: 14, color: "#993C1D" },
  field: { paddingHorizontal: 16, marginBottom: 20 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#F1EFE8",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#1a1a1a",
    backgroundColor: "#FAFAFA",
  },
  ingredientInput: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  ingredientTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#F1EFE8",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#1a1a1a",
    backgroundColor: "#FAFAFA",
  },
  addBtn: {
    backgroundColor: "#D85A30",
    borderRadius: 10,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EEEDFE",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  chipText: { fontSize: 13, color: "#3C3489" },
  visibilityRow: { flexDirection: "row", gap: 10 },
  visBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F1EFE8",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  visBtnActive: {
    borderColor: "#D85A30",
    backgroundColor: "#FAECE7",
  },
  visBtnText: { fontSize: 13, color: "#888" },
  visBtnTextActive: { color: "#D85A30", fontWeight: "500" },
  publishBtn: {
    margin: 16,
    backgroundColor: "#D85A30",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginBottom: 40,
  },
  publishText: { fontSize: 16, color: "#fff", fontWeight: "500" },
});
