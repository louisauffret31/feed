import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";

type Ingredient = {
  id: string;
  name: string;
  health_score: number;
  originality_score: number;
  category: string;
};

function HealthDots({ score }: { score: number }) {
  return (
    <View style={styles.dots}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i <= score ? styles.dotHealthFilled : styles.dotEmpty,
          ]}
        />
      ))}
    </View>
  );
}

function OriginalityDots({ score }: { score: number }) {
  return (
    <View style={styles.dots}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i <= score ? styles.dotOrigFilled : styles.dotEmpty,
          ]}
        />
      ))}
    </View>
  );
}

const CATEGORY_EMOJI: Record<string, string> = {
  légumes: "🥦",
  protéines: "🥩",
  céréales: "🌾",
  fruits: "🍎",
  herbes: "🌿",
  laitiers: "🧀",
  autres: "🫙",
};

export default function IngredientSearch({
  onAdd,
  selectedIngredients,
}: {
  onAdd: (name: string) => void;
  selectedIngredients: string[];
}) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Ingredient[]>([]);
  const [showResults, setShowResults] = React.useState(false);

  async function search(text: string) {
    setQuery(text);
    if (text.trim().length < 1) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const { data } = await supabase
      .from("ingredients")
      .select("id, name, health_score, originality_score, category")
      .ilike("name", `%${text}%`)
      .eq("status", "approved")
      .order("health_score", { ascending: false })
      .limit(8);

    setResults(data ?? []);
    setShowResults(true);
  }

  function handleAdd(ingredient: Ingredient) {
    onAdd(ingredient.name);
    setQuery("");
    setResults([]);
    setShowResults(false);
  }

  function handleAddCustom() {
    if (!query.trim()) return;
    onAdd(query.trim().toLowerCase());
    setQuery("");
    setResults([]);
    setShowResults(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Rechercher un ingrédient..."
          placeholderTextColor="#bbb"
          value={query}
          onChangeText={search}
          returnKeyType="done"
          onSubmitEditing={handleAddCustom}
        />
        <TouchableOpacity onPress={handleAddCustom} style={styles.addBtn}>
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {showResults && results.length > 0 && (
        <View style={styles.dropdown}>
          {results.map((item) => {
            const alreadyAdded = selectedIngredients.includes(item.name);
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.resultRow,
                  alreadyAdded && styles.resultRowAdded,
                ]}
                onPress={() => !alreadyAdded && handleAdd(item)}
                disabled={alreadyAdded}
              >
                <Text style={styles.resultEmoji}>
                  {CATEGORY_EMOJI[item.category] ?? "🍽️"}
                </Text>
                <View style={styles.resultInfo}>
                  <Text
                    style={[
                      styles.resultName,
                      alreadyAdded && styles.resultNameAdded,
                    ]}
                  >
                    {item.name}
                    {alreadyAdded && " ✓"}
                  </Text>
                  <View style={styles.scoresRow}>
                    <View style={styles.scoreItem}>
                      <Text style={styles.scoreLabel}>Santé</Text>
                      <HealthDots score={item.health_score} />
                    </View>
                    <View style={styles.scoreItem}>
                      <Text style={styles.scoreLabel}>Originalité</Text>
                      <OriginalityDots score={item.originality_score} />
                    </View>
                  </View>
                </View>
                {!alreadyAdded && (
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color="#D85A30"
                  />
                )}
              </TouchableOpacity>
            );
          })}

          {query.trim() &&
            !results.find((r) => r.name === query.trim().toLowerCase()) && (
              <TouchableOpacity
                style={styles.customRow}
                onPress={handleAddCustom}
              >
                <Ionicons name="add-circle-outline" size={18} color="#888" />
                <Text style={styles.customText}>
                  Ajouter "{query.trim()}" comme nouvel ingrédient
                </Text>
              </TouchableOpacity>
            )}
        </View>
      )}

      {showResults && results.length === 0 && query.trim().length > 0 && (
        <View style={styles.dropdown}>
          <TouchableOpacity style={styles.customRow} onPress={handleAddCustom}>
            <Ionicons name="add-circle-outline" size={18} color="#888" />
            <Text style={styles.customText}>
              Ajouter "{query.trim()}" comme nouvel ingrédient
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "relative", zIndex: 10 },
  inputRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  input: {
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
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1EFE8",
    overflow: "hidden",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1EFE8",
  },
  resultRowAdded: { backgroundColor: "#F9FFF9" },
  resultEmoji: { fontSize: 20 },
  resultInfo: { flex: 1 },
  resultName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  resultNameAdded: { color: "#1D9E75" },
  scoresRow: { flexDirection: "row", gap: 12 },
  scoreItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  scoreLabel: { fontSize: 10, color: "#bbb" },
  dots: { flexDirection: "row", gap: 2 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotHealthFilled: { backgroundColor: "#1D9E75" },
  dotOrigFilled: { backgroundColor: "#EF9F27" },
  dotEmpty: { backgroundColor: "#F1EFE8" },
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 8,
  },
  customText: { fontSize: 13, color: "#888", flex: 1 },
});
