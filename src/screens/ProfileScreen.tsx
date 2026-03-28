import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";
import BadgesScreen from "./BadgesScreen";
import ChallengesScreen from "./ChallengesScreen";
import SearchScreen from "./SearchScreen";
import IngredientOfWeekScreen from "./IngredientOfWeekScreen";
import EditProfileScreen from "./EditProfileScreen";

type Profile = {
  username: string;
  avatar_url: string | null;
  score_total: number;
  score_week: number;
};

type Meal = {
  id: string;
  photo_url: string | null;
  name: string;
};

type Badge = {
  type: string;
};

type ScreenView =
  | "profile"
  | "badges"
  | "challenges"
  | "search"
  | "ingredient"
  | "edit";

const BADGE_CONFIG: Record<string, { emoji: string; label: string }> = {
  first_meal: { emoji: "🥚", label: "Premier repas" },
  "10_meals": { emoji: "🍽️", label: "10 repas" },
  "10_ingredients": { emoji: "🌿", label: "Explorateur" },
  "25_ingredients": { emoji: "🧑‍🍳", label: "Cuisinier" },
  "100_ingredients": { emoji: "👑", label: "Gourmet" },
};

function SubScreenWrapper({
  onBack,
  children,
}: {
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={22} color="#712B13" />
        <Text style={styles.backText}>Profil</Text>
      </TouchableOpacity>
      {children}
    </View>
  );
}

export default function ProfileScreen() {
  const [currentView, setCurrentView] = React.useState<ScreenView>("profile");
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [meals, setMeals] = React.useState<Meal[]>([]);
  const [badges, setBadges] = React.useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = React.useState(0);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("username, avatar_url, score_total, score_week")
      .eq("id", user.id)
      .single();
    if (profileData) setProfile(profileData);

    const { data: mealsData } = await supabase
      .from("meals")
      .select("id, photo_url, name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (mealsData) setMeals(mealsData);

    const { data: badgesData } = await supabase
      .from("badges")
      .select("type")
      .eq("user_id", user.id);
    if (badgesData) setBadges(badgesData);

    const { data: rankData } = await supabase
      .from("profiles")
      .select("id")
      .gte("score_week", profileData?.score_week ?? 0);
    if (rankData) setLeaderboard(rankData.length);
  }

  async function handleDeleteMeal(mealId: string) {
    Alert.alert("Supprimer ce repas", "Cette action est irréversible.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("meals")
            .delete()
            .eq("id", mealId);
          if (!error) setMeals(meals.filter((m) => m.id !== mealId));
        },
      },
    ]);
  }

  useFocusEffect(
    React.useCallback(() => {
      setCurrentView("profile");
      loadProfile();
    }, []),
  );

  if (currentView === "badges")
    return (
      <SubScreenWrapper onBack={() => setCurrentView("profile")}>
        <BadgesScreen />
      </SubScreenWrapper>
    );
  if (currentView === "challenges")
    return (
      <SubScreenWrapper onBack={() => setCurrentView("profile")}>
        <ChallengesScreen />
      </SubScreenWrapper>
    );
  if (currentView === "search")
    return (
      <SubScreenWrapper onBack={() => setCurrentView("profile")}>
        <SearchScreen />
      </SubScreenWrapper>
    );
  if (currentView === "ingredient")
    return (
      <SubScreenWrapper onBack={() => setCurrentView("profile")}>
        <IngredientOfWeekScreen />
      </SubScreenWrapper>
    );
  if (currentView === "edit")
    return (
      <EditProfileScreen
        onBack={() => {
          setCurrentView("profile");
          loadProfile();
        }}
      />
    );

  const initials = profile?.username?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => setCurrentView("edit")}
        >
          <Ionicons name="settings-outline" size={20} color="#993C1D" />
        </TouchableOpacity>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {profile?.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={styles.avatarImg}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
        </View>

        <Text style={styles.name}>@{profile?.username ?? "..."}</Text>
        <Text style={styles.handle}>
          {meals.length} repas · {badges.length} badges
        </Text>

        {/* Triple score */}
        <View style={styles.scoreRow}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreNum}>
              {profile?.score_total?.toFixed(0) ?? "0"}
            </Text>
            <Text style={styles.scoreLbl}>Score à vie</Text>
          </View>
          <View style={[styles.scoreBox, styles.scoreBoxCenter]}>
            <Text style={styles.scoreNum}>
              {profile?.score_week?.toFixed(0) ?? "0"}
            </Text>
            <Text style={styles.scoreLbl}>Cette semaine</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreNum}>#{leaderboard}</Text>
            <Text style={styles.scoreLbl}>Classement</Text>
          </View>
        </View>
      </View>

      {/* Badges */}
      {badges.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes badges</Text>
            <TouchableOpacity onPress={() => setCurrentView("badges")}>
              <Text style={styles.sectionLink}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.badgeScroll}>
              {badges.map((b) => {
                const config = BADGE_CONFIG[b.type];
                if (!config) return null;
                return (
                  <View key={b.type} style={styles.badgeCard}>
                    <Text style={styles.badgeCardEmoji}>{config.emoji}</Text>
                    <Text style={styles.badgeCardLabel}>{config.label}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Raccourcis */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Explorer</Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => setCurrentView("ingredient")}
          >
            <Text style={styles.quickEmoji}>🥦</Text>
            <Text style={styles.quickTitle}>Défi semaine</Text>
            <Text style={styles.quickDesc}>Ingrédient imposé</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => setCurrentView("challenges")}
          >
            <Text style={styles.quickEmoji}>🎯</Text>
            <Text style={styles.quickTitle}>Défis</Text>
            <Text style={styles.quickDesc}>Cette semaine</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => setCurrentView("badges")}
          >
            <Text style={styles.quickEmoji}>🏆</Text>
            <Text style={styles.quickTitle}>Badges</Text>
            <Text style={styles.quickDesc}>{badges.length} obtenus</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => setCurrentView("search")}
          >
            <Text style={styles.quickEmoji}>👥</Text>
            <Text style={styles.quickTitle}>Amis</Text>
            <Text style={styles.quickDesc}>Rechercher</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Grille repas */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes repas</Text>
          <Text style={styles.sectionHint}>Appui long pour supprimer</Text>
        </View>
        <View style={styles.grid}>
          {meals.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.gridItem}
              onLongPress={() => handleDeleteMeal(item.id)}
              activeOpacity={0.85}
            >
              {item.photo_url ? (
                <Image
                  source={{ uri: item.photo_url }}
                  style={styles.gridPhoto}
                />
              ) : (
                <View style={styles.gridPlaceholder}>
                  <Text style={styles.gridPlaceholderText}>🍽️</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
          {meals.length === 0 && (
            <View style={styles.emptyMeals}>
              <Text style={styles.emptyMealsText}>Aucun repas encore</Text>
              <Text style={styles.emptyMealsSubText}>
                Poste ton premier repas !
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    backgroundColor: "#FAECE7",
  },
  backText: { fontSize: 16, color: "#712B13", fontWeight: "500" },

  header: {
    backgroundColor: "#FAECE7",
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: "center",
  },
  settingsBtn: {
    position: "absolute",
    top: 56,
    right: 20,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 20,
  },
  avatarContainer: { marginBottom: 12 },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#D85A30",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarInitials: { fontSize: 28, fontWeight: "500", color: "#fff" },
  name: { fontSize: 20, fontWeight: "500", color: "#712B13", marginBottom: 4 },
  handle: { fontSize: 13, color: "#993C1D", marginBottom: 20, opacity: 0.8 },

  scoreRow: { flexDirection: "row", gap: 10, width: "100%" },
  scoreBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
  },
  scoreBoxCenter: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "rgba(216,90,48,0.2)",
  },
  scoreNum: { fontSize: 22, fontWeight: "500", color: "#712B13" },
  scoreLbl: { fontSize: 10, color: "#993C1D", marginTop: 2, opacity: 0.8 },

  section: { paddingHorizontal: 16, marginTop: 24, marginBottom: 4 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "500", color: "#1a1a1a" },
  sectionLink: { fontSize: 13, color: "#D85A30" },
  sectionHint: { fontSize: 11, color: "#bbb" },

  badgeScroll: { flexDirection: "row", gap: 10, paddingBottom: 4 },
  badgeCard: {
    backgroundColor: "#FAEEDA",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    width: 90,
    gap: 6,
  },
  badgeCardEmoji: { fontSize: 28 },
  badgeCardLabel: {
    fontSize: 11,
    color: "#633806",
    fontWeight: "500",
    textAlign: "center",
  },

  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickCard: {
    width: "47%",
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1EFE8",
    gap: 4,
  },
  quickEmoji: { fontSize: 24, marginBottom: 4 },
  quickTitle: { fontSize: 14, fontWeight: "500", color: "#1a1a1a" },
  quickDesc: { fontSize: 12, color: "#888" },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 2 },
  gridItem: { width: "32%", aspectRatio: 1 },
  gridPhoto: { width: "100%", height: "100%", borderRadius: 8 },
  gridPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FAECE7",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  gridPlaceholderText: { fontSize: 24 },
  emptyMeals: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyMealsText: { fontSize: 15, color: "#888" },
  emptyMealsSubText: { fontSize: 13, color: "#bbb" },
});
