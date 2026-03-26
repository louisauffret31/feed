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
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../services/supabase";

export default function PostScreen() {
  const [mealName, setMealName] = React.useState("");
  const [ingredients, setIngredients] = React.useState<string[]>([]);
  const [inputIngredient, setInputIngredient] = React.useState("");
  const [visibility, setVisibility] = React.useState<"public" | "private">(
    "public",
  );
  const [photo, setPhoto] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function pickPhoto() {
    Alert.alert("Ajouter une photo", "Choisir une source", [
      {
        text: "📷 Prendre une photo",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            Alert.alert(
              "Permission refusée",
              "Va dans Paramètres > Applications > Feed > Permissions pour autoriser la caméra.",
            );
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
          });
          if (!result.canceled) setPhoto(result.assets[0].uri);
        },
      },
      {
        text: "🖼️ Choisir depuis la galerie",
        onPress: async () => {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            Alert.alert(
              "Permission refusée",
              "Va dans Paramètres > Applications > Feed > Permissions pour autoriser la galerie.",
            );
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
          });
          if (!result.canceled) setPhoto(result.assets[0].uri);
        },
      },
      { text: "Annuler", style: "cancel" },
    ]);
  }

  function addIngredient() {
    if (inputIngredient.trim() === "") return;
    setIngredients([...ingredients, inputIngredient.trim().toLowerCase()]);
    setInputIngredient("");
  }

  function removeIngredient(index: number) {
    setIngredients(ingredients.filter((_, i) => i !== index));
  }

  async function uploadPhoto(uri: string): Promise<string | null> {
    try {
      const fileExt = uri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${Date.now()}.${fileExt}`;
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: fileName,
        type: `image/${fileExt}`,
      } as any);

      const { data, error } = await supabase.storage
        .from("meals")
        .upload(fileName, formData, {
          contentType: "multipart/form-data",
        });

      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from("meals")
        .getPublicUrl(fileName);
      return urlData.publicUrl;
    } catch (e) {
      console.error("Upload error:", e);
      return null;
    }
  }

  async function handlePublish() {
    if (!mealName.trim()) {
      Alert.alert("Erreur", "Donne un nom à ton repas");
      return;
    }
    if (ingredients.length === 0) {
      Alert.alert("Erreur", "Ajoute au moins un ingrédient");
      return;
    }
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");

      let photoUrl = null;
      if (photo) photoUrl = await uploadPhoto(photo);

      const { data: meal, error: mealError } = await supabase
        .from("meals")
        .insert({
          user_id: user.id,
          name: mealName.trim(),
          photo_url: photoUrl,
          visibility,
          score_earned: 0,
        })
        .select()
        .single();
      if (mealError) throw mealError;

      for (const ing of ingredients) {
        const { data: ingredient } = await supabase
          .from("ingredients")
          .upsert({ name: ing }, { onConflict: "name" })
          .select()
          .single();

        if (ingredient) {
          const { data: existing } = await supabase
            .from("meal_ingredients")
            .select("id")
            .eq("ingredient_id", ingredient.id)
            .limit(1);

          const isNew = !existing || existing.length === 0;
          const points = isNew ? 1 : 0.1;

          await supabase.from("meal_ingredients").insert({
            meal_id: meal.id,
            ingredient_id: ingredient.id,
            is_new_for_user: isNew,
            points_earned: points,
          });

          await supabase.rpc("increment_score", {
            user_id: user.id,
            points,
          });
        }
      }

      // Vérifier les badges APRÈS la boucle
      await supabase.rpc("check_and_award_badges", { p_user_id: user.id });

      Alert.alert("🎉 Repas publié !", "Ton repas a été ajouté au feed.");
      setMealName("");
      setIngredients([]);
      setPhoto(null);
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.topbar}>
          <Text style={styles.topbarTitle}>Nouveau repas</Text>
        </View>

        <TouchableOpacity style={styles.photoZone} onPress={pickPhoto}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photoPreview} />
          ) : (
            <>
              <Ionicons name="camera-outline" size={32} color="#993C1D" />
              <Text style={styles.photoText}>Ajouter une photo</Text>
            </>
          )}
        </TouchableOpacity>

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

        <TouchableOpacity
          style={[styles.publishBtn, loading && styles.publishBtnDisabled]}
          onPress={handlePublish}
          disabled={loading}
        >
          <Text style={styles.publishText}>
            {loading ? "Publication..." : "Publier le repas"}
          </Text>
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
    overflow: "hidden",
  },
  photoPreview: { width: "100%", height: "100%" },
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
  ingredientInput: { flexDirection: "row", gap: 8, marginBottom: 10 },
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
  visBtnActive: { borderColor: "#D85A30", backgroundColor: "#FAECE7" },
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
  publishBtnDisabled: { opacity: 0.6 },
  publishText: { fontSize: 16, color: "#fff", fontWeight: "500" },
});
