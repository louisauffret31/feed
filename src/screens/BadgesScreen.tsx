import * as React from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { supabase } from "../services/supabase";

type Badge = {
  type: string;
  earned_at: string;
};

const BADGE_CONFIG: Record<
  string,
  { emoji: string; label: string; description: string }
> = {
  first_meal: {
    emoji: "🥚",
    label: "Premier repas",
    description: "Tu as posté ton premier repas !",
  },
  "10_meals": {
    emoji: "🍽️",
    label: "10 repas",
    description: "Tu as posté 10 repas !",
  },
  "10_ingredients": {
    emoji: "🌿",
    label: "Explorateur",
    description: "10 ingrédients différents découverts",
  },
  "25_ingredients": {
    emoji: "🧑‍🍳",
    label: "Cuisinier",
    description: "25 ingrédients différents découverts",
  },
  "100_ingredients": {
    emoji: "👑",
    label: "Gourmet",
    description: "100 ingrédients différents découverts",
  },
};

const ALL_BADGES = Object.keys(BADGE_CONFIG);

export default function BadgesScreen() {
  const [earnedBadges, setEarnedBadges] = React.useState<Badge[]>([]);

  async function loadBadges() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("badges")
      .select("type, earned_at")
      .eq("user_id", user.id);
    console.log("badges data:", JSON.stringify(data));
    if (data) setEarnedBadges(data);
  }

  useFocusEffect(
    React.useCallback(() => {
      loadBadges();
    }, []),
  );

  const earnedTypes = earnedBadges.map((b) => b.type);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topbar}>
        <Text style={styles.title}>Badges</Text>
        <Text style={styles.subtitle}>
          {earnedTypes.length} / {ALL_BADGES.length} obtenus
        </Text>
      </View>

      <View style={styles.grid}>
        {ALL_BADGES.map((type) => {
          const config = BADGE_CONFIG[type];
          const earned = earnedTypes.includes(type);
          const badge = earnedBadges.find((b) => b.type === type);
          return (
            <View
              key={type}
              style={[styles.badgeCard, !earned && styles.badgeCardLocked]}
            >
              <Text
                style={[styles.badgeEmoji, !earned && styles.badgeEmojiLocked]}
              >
                {earned ? config.emoji : "🔒"}
              </Text>
              <Text
                style={[styles.badgeLabel, !earned && styles.badgeLabelLocked]}
              >
                {config.label}
              </Text>
              <Text
                style={[styles.badgeDesc, !earned && styles.badgeDescLocked]}
              >
                {config.description}
              </Text>
              {earned && badge && (
                <Text style={styles.badgeDate}>
                  {new Date(badge.earned_at).toLocaleDateString("fr-FR")}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
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
  title: { fontSize: 24, fontWeight: "500", color: "#1a1a1a" },
  subtitle: { fontSize: 13, color: "#888", marginTop: 2 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 12,
  },
  badgeCard: {
    width: "47%",
    backgroundColor: "#FAEEDA",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  badgeCardLocked: { backgroundColor: "#F1EFE8" },
  badgeEmoji: { fontSize: 36 },
  badgeEmojiLocked: { opacity: 0.4 },
  badgeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#633806",
    textAlign: "center",
  },
  badgeLabelLocked: { color: "#888" },
  badgeDesc: {
    fontSize: 11,
    color: "#BA7517",
    textAlign: "center",
    lineHeight: 16,
  },
  badgeDescLocked: { color: "#bbb" },
  badgeDate: { fontSize: 10, color: "#EF9F27", marginTop: 4 },
});
