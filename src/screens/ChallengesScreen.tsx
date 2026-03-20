import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../services/supabase";

type Challenge = {
  id: string;
  title: string;
  description: string;
  target_count: number;
  bonus_points: number;
  week_end: string;
  participation?: {
    progress: number;
    completed: boolean;
  };
};

export default function ChallengesScreen() {
  const [challenges, setChallenges] = React.useState<Challenge[]>([]);
  const [loading, setLoading] = React.useState(true);

  async function loadChallenges() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("weekly_challenges")
      .select(
        `
        id, title, description, target_count, bonus_points, week_end,
        challenge_participations ( progress, completed )
      `,
      )
      .gte("week_end", today)
      .order("created_at", { ascending: true });

    if (data) {
      setChallenges(
        data.map((c: any) => ({
          ...c,
          participation:
            c.challenge_participations?.find((p: any) => p) ?? null,
        })),
      );
    }
    setLoading(false);
  }

  async function joinChallenge(challenge: Challenge) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("challenge_participations").insert({
      user_id: user.id,
      challenge_id: challenge.id,
      progress: 0,
      completed: false,
    });

    if (error && error.code !== "23505") {
      Alert.alert("Erreur", error.message);
      return;
    }

    loadChallenges();
  }

  useFocusEffect(
    React.useCallback(() => {
      loadChallenges();
    }, []),
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#D85A30" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topbar}>
        <Text style={styles.title}>Défis</Text>
        <Text style={styles.subtitle}>Cette semaine</Text>
      </View>

      <View style={styles.list}>
        {challenges.map((challenge) => {
          const progress = challenge.participation?.progress ?? 0;
          const completed = challenge.participation?.completed ?? false;
          const joined =
            challenge.participation !== null &&
            challenge.participation !== undefined;
          const percent = Math.min(
            (progress / challenge.target_count) * 100,
            100,
          );

          return (
            <View
              key={challenge.id}
              style={[styles.card, completed && styles.cardCompleted]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardEmoji}>
                  {completed ? "✅" : joined ? "🔥" : "🎯"}
                </Text>
                <View style={styles.cardTitles}>
                  <Text style={styles.cardTitle}>{challenge.title}</Text>
                  <Text style={styles.cardDesc}>{challenge.description}</Text>
                </View>
                <View style={styles.bonusPill}>
                  <Text style={styles.bonusText}>
                    +{challenge.bonus_points} pts
                  </Text>
                </View>
              </View>

              {joined && (
                <View style={styles.progressSection}>
                  <View style={styles.progressBar}>
                    <View
                      style={[styles.progressFill, { width: `${percent}%` }]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {progress} / {challenge.target_count}
                    {completed ? " · Complété ! 🎉" : ""}
                  </Text>
                </View>
              )}

              {!joined && (
                <TouchableOpacity
                  style={styles.joinBtn}
                  onPress={() => joinChallenge(challenge)}
                >
                  <Text style={styles.joinText}>Rejoindre le défi</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.deadline}>
                Jusqu'au{" "}
                {new Date(challenge.week_end).toLocaleDateString("fr-FR")}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  topbar: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1EFE8",
  },
  title: { fontSize: 24, fontWeight: "500", color: "#1a1a1a" },
  subtitle: { fontSize: 13, color: "#888", marginTop: 2 },
  list: { padding: 16, gap: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1EFE8",
    padding: 16,
    gap: 12,
  },
  cardCompleted: {
    borderColor: "#1D9E75",
    backgroundColor: "#E1F5EE",
  },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  cardEmoji: { fontSize: 24 },
  cardTitles: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "500", color: "#1a1a1a" },
  cardDesc: { fontSize: 12, color: "#888", marginTop: 3, lineHeight: 18 },
  bonusPill: {
    backgroundColor: "#FAEEDA",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bonusText: { fontSize: 12, color: "#633806", fontWeight: "500" },
  progressSection: { gap: 6 },
  progressBar: {
    height: 8,
    backgroundColor: "#F1EFE8",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#D85A30",
    borderRadius: 4,
  },
  progressText: { fontSize: 12, color: "#888" },
  joinBtn: {
    backgroundColor: "#D85A30",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  joinText: { fontSize: 14, color: "#fff", fontWeight: "500" },
  deadline: { fontSize: 11, color: "#bbb" },
});
