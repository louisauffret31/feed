import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";

type Challenge = {
  id: string;
  ingredient_name: string;
  week_start: string;
  week_end: string;
  participants: number;
  participation?: {
    completed: boolean;
  } | null;
};

function DaysLeft({ weekEnd }: { weekEnd: string }) {
  const end = new Date(weekEnd);
  const now = new Date();
  const diff = Math.ceil(
    (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  return (
    <Text style={styles.daysLeft}>
      {diff > 0
        ? `${diff} jour${diff > 1 ? "s" : ""} restant${diff > 1 ? "s" : ""}`
        : "Dernier jour !"}
    </Text>
  );
}

export default function IngredientOfWeekScreen() {
  const [challenge, setChallenge] = React.useState<Challenge | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [joining, setJoining] = React.useState(false);

  async function loadChallenge() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("ingredient_of_week")
      .select(
        `
        id, ingredient_name, week_start, week_end, participants,
        ingredient_week_participations ( completed )
      `,
      )
      .lte("week_start", today)
      .gte("week_end", today)
      .single();

    if (data) {
      setChallenge({
        ...data,
        participation:
          (data.ingredient_week_participations as any[])?.[0] ?? null,
      });
    }
    setLoading(false);
  }

  async function joinChallenge() {
    if (!challenge) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setJoining(true);
    const { error } = await supabase
      .from("ingredient_week_participations")
      .insert({
        user_id: user.id,
        challenge_id: challenge.id,
        completed: false,
      });

    if (error && error.code !== "23505") {
      Alert.alert("Erreur", error.message);
    } else {
      await supabase
        .from("ingredient_of_week")
        .update({ participants: challenge.participants + 1 })
        .eq("id", challenge.id);
      loadChallenge();
    }
    setJoining(false);
  }

  async function markCompleted() {
    if (!challenge) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("ingredient_week_participations")
      .update({ completed: true })
      .eq("user_id", user.id)
      .eq("challenge_id", challenge.id);

    await supabase.rpc("increment_score", {
      user_id: user.id,
      points: 25,
    });

    Alert.alert("🎉 Bravo !", "+25 pts bonus ajoutés à ton score !");
    loadChallenge();
  }

  useFocusEffect(
    React.useCallback(() => {
      loadChallenge();
    }, []),
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#D85A30" />
      </View>
    );
  }

  if (!challenge) {
    return (
      <View style={styles.loading}>
        <Text style={styles.noChallenge}>Aucun défi cette semaine</Text>
      </View>
    );
  }

  const joined =
    challenge.participation !== null && challenge.participation !== undefined;
  const completed = challenge.participation?.completed ?? false;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topbar}>
        <Text style={styles.title}>Défi de la semaine</Text>
        <DaysLeft weekEnd={challenge.week_end} />
      </View>

      {/* Hero */}
      <View style={[styles.hero, completed && styles.heroCompleted]}>
        <Text style={styles.heroEmoji}>{completed ? "✅" : "🥦"}</Text>
        <Text style={styles.heroIngredient}>{challenge.ingredient_name}</Text>
        <Text style={styles.heroDesc}>
          Cuisine cet ingrédient cette semaine et poste ton repas pour valider
          le défi !
        </Text>
        <View style={styles.participantsPill}>
          <Ionicons name="people-outline" size={14} color="#712B13" />
          <Text style={styles.participantsText}>
            {challenge.participants} participant
            {challenge.participants > 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {/* Règles */}
      <View style={styles.rulesCard}>
        <Text style={styles.rulesTitle}>Comment participer</Text>
        <View style={styles.rule}>
          <View style={styles.ruleNum}>
            <Text style={styles.ruleNumText}>1</Text>
          </View>
          <Text style={styles.ruleText}>
            Rejoins le défi en cliquant sur le bouton ci-dessous
          </Text>
        </View>
        <View style={styles.rule}>
          <View style={styles.ruleNum}>
            <Text style={styles.ruleNumText}>2</Text>
          </View>
          <Text style={styles.ruleText}>
            Cuisine un repas avec{" "}
            <Text style={styles.bold}>{challenge.ingredient_name}</Text>
          </Text>
        </View>
        <View style={styles.rule}>
          <View style={styles.ruleNum}>
            <Text style={styles.ruleNumText}>3</Text>
          </View>
          <Text style={styles.ruleText}>
            Poste ton repas sur Feed avec l'ingrédient tagué
          </Text>
        </View>
        <View style={styles.rule}>
          <View style={styles.ruleNum}>
            <Text style={styles.ruleNumText}>4</Text>
          </View>
          <Text style={styles.ruleText}>
            Marque le défi comme complété et gagne{" "}
            <Text style={styles.bold}>+25 pts</Text> bonus !
          </Text>
        </View>
      </View>

      {/* Boutons */}
      {!joined && (
        <TouchableOpacity
          style={[styles.btn, joining && styles.btnDisabled]}
          onPress={joinChallenge}
          disabled={joining}
        >
          <Text style={styles.btnText}>
            {joining ? "Inscription..." : "🎯 Rejoindre le défi"}
          </Text>
        </TouchableOpacity>
      )}

      {joined && !completed && (
        <View style={styles.joinedSection}>
          <View style={styles.joinedBanner}>
            <Ionicons name="checkmark-circle" size={20} color="#1D9E75" />
            <Text style={styles.joinedText}>Tu participes à ce défi !</Text>
          </View>
          <TouchableOpacity style={styles.btnGreen} onPress={markCompleted}>
            <Text style={styles.btnText}>
              ✅ J'ai cuisiné {challenge.ingredient_name} !
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {completed && (
        <View style={styles.completedBanner}>
          <Ionicons name="trophy" size={24} color="#EF9F27" />
          <Text style={styles.completedText}>
            Défi complété cette semaine !
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  noChallenge: { fontSize: 16, color: "#888" },
  topbar: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1EFE8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 20, fontWeight: "500", color: "#1a1a1a" },
  daysLeft: { fontSize: 12, color: "#D85A30", fontWeight: "500" },
  hero: {
    margin: 16,
    backgroundColor: "#FAECE7",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  heroCompleted: { backgroundColor: "#E1F5EE" },
  heroEmoji: { fontSize: 64 },
  heroIngredient: { fontSize: 32, fontWeight: "500", color: "#712B13" },
  heroDesc: {
    fontSize: 14,
    color: "#993C1D",
    textAlign: "center",
    lineHeight: 20,
  },
  participantsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 4,
  },
  participantsText: { fontSize: 13, color: "#712B13" },
  rulesCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1EFE8",
    padding: 16,
    gap: 12,
  },
  rulesTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  rule: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  ruleNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FAECE7",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  ruleNumText: { fontSize: 12, fontWeight: "500", color: "#D85A30" },
  ruleText: { flex: 1, fontSize: 13, color: "#444", lineHeight: 20 },
  bold: { fontWeight: "500", color: "#1a1a1a" },
  btn: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#D85A30",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  btnGreen: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#1D9E75",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 15, color: "#fff", fontWeight: "500" },
  joinedSection: { gap: 8 },
  joinedBanner: {
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E1F5EE",
    borderRadius: 12,
    padding: 12,
  },
  joinedText: { fontSize: 14, color: "#085041", fontWeight: "500" },
  completedBanner: {
    marginHorizontal: 16,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FAEEDA",
    borderRadius: 14,
    padding: 16,
    justifyContent: "center",
  },
  completedText: { fontSize: 15, color: "#633806", fontWeight: "500" },
});
