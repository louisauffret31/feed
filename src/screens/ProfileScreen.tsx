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

  async function handleLogout() {
    Alert.alert("Déconnexion", "Tu veux te déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => await supabase.auth.signOut(),
      },
    ]);
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
          if (!error) {
            setMeals(meals.filter((m) => m.id !== mealId));
          }
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

  if (currentView === "badges") {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setCurrentView("profile")}
        >
          <Ionicons name="arrow-back" size={24} color="#712B13" />
          <Text style={styles.backText}>Profil</Text>
        </TouchableOpacity>
        <BadgesScreen />
      </View>
    );
  }

  if (currentView === "challenges") {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setCurrentView("profile")}
        >
          <Ionicons name="arrow-back" size={24} color="#712B13" />
          <Text style={styles.backText}>Profil</Text>
        </TouchableOpacity>
        <ChallengesScreen />
      </View>
    );
  }

  if (currentView === "search") {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setCurrentView("profile")}
        >
          <Ionicons name="arrow-back" size={24} color="#712B13" />
          <Text style={styles.backText}>Profil</Text>
        </TouchableOpacity>
        <SearchScreen />
      </View>
    );
  }

  if (currentView === "ingredient") {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setCurrentView("profile")}
        >
          <Ionicons name="arrow-back" size={24} color="#712B13" />
          <Text style={styles.backText}>Profil</Text>
        </TouchableOpacity>
        <IngredientOfWeekScreen />
      </View>
    );
  }

  if (currentView === "edit") {
    return (
      <EditProfileScreen
        onBack={() => {
          setCurrentView("profile");
          loadProfile();
        }}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setCurrentView("edit")}
        >
          <Ionicons name="settings-outline" size={20} color="#993C1D" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => setCurrentView("edit")}
        >
          <Ionicons name="pencil-outline" size={18} color="#993C1D" />
        </TouchableOpacity>
        <View style={styles.avatar} />
        <Text style={styles.name}>@{profile?.username ?? "..."}</Text>
        <Text style={styles.handle}>{meals.length} repas</Text>
        <View style={styles.scoreRow}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreNum}>
              {profile?.score_total?.toFixed(1) ?? "0"}
            </Text>
            <Text style={styles.scoreLbl}>Score à vie</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreNum}>
              {profile?.score_week?.toFixed(1) ?? "0"}
            </Text>
            <Text style={styles.scoreLbl}>Cette semaine</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreNum}>#{leaderboard}</Text>
            <Text style={styles.scoreLbl}>Leaderboard</Text>
          </View>
        </View>
      </View>

      <View style={styles.shortcuts}>
        <TouchableOpacity
          style={styles.shortcutBtn}
          onPress={() => setCurrentView("badges")}
        >
          <Ionicons name="ribbon-outline" size={20} color="#D85A30" />
          <Text style={styles.shortcutText}>Badges</Text>
          <Text style={styles.shortcutCount}>{badges.length} obtenus</Text>
          <Ionicons name="chevron-forward" size={16} color="#bbb" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shortcutBtn}
          onPress={() => setCurrentView("challenges")}
        >
          <Ionicons name="flag-outline" size={20} color="#D85A30" />
          <Text style={styles.shortcutText}>Défis</Text>
          <Text style={styles.shortcutCount}>Cette semaine</Text>
          <Ionicons name="chevron-forward" size={16} color="#bbb" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shortcutBtn}
          onPress={() => setCurrentView("ingredient")}
        >
          <Ionicons name="leaf-outline" size={20} color="#D85A30" />
          <Text style={styles.shortcutText}>Défi de la semaine</Text>
          <Text style={styles.shortcutCount}>Ingrédient imposé</Text>
          <Ionicons name="chevron-forward" size={16} color="#bbb" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.shortcutBtn, { borderBottomWidth: 0 }]}
          onPress={() => setCurrentView("search")}
        >
          <Ionicons name="search-outline" size={20} color="#D85A30" />
          <Text style={styles.shortcutText}>Trouver des amis</Text>
          <Text style={styles.shortcutCount}>Rechercher</Text>
          <Ionicons name="chevron-forward" size={16} color="#bbb" />
        </TouchableOpacity>
      </View>

      {badges.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes badges</Text>
          <View style={styles.badgeRow}>
            {badges.map((b) => {
              const config = BADGE_CONFIG[b.type];
              if (!config) return null;
              return (
                <View key={b.type} style={styles.badgePill}>
                  <Text style={styles.badgeEmoji}>{config.emoji}</Text>
                  <Text style={styles.badgeLabel}>{config.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes repas</Text>
        <View style={styles.grid}>
          {meals.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.gridItem}
              onLongPress={() => handleDeleteMeal(item.id)}
              activeOpacity={0.8}
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
        </View>
        <Text style={styles.deleteHint}>
          Appuie longtemps sur un repas pour le supprimer
        </Text>
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
  editBtn: { position: "absolute", top: 56, right: 90 },
  backText: { fontSize: 16, color: "#712B13", fontWeight: "500" },
  header: {
    backgroundColor: "#FAECE7",
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  logoutBtn: { position: "absolute", top: 56, right: 16 },
  logoutText: { fontSize: 13, color: "#993C1D" },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0997B",
    marginBottom: 10,
  },
  name: { fontSize: 18, fontWeight: "500", color: "#712B13" },
  handle: { fontSize: 13, color: "#993C1D", marginBottom: 14 },
  scoreRow: { flexDirection: "row", gap: 10 },
  scoreBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  deleteHint: {
    fontSize: 11,
    color: "#bbb",
    textAlign: "center",
    marginTop: 8,
  },
  scoreNum: { fontSize: 20, fontWeight: "500", color: "#712B13" },
  scoreLbl: { fontSize: 10, color: "#993C1D", marginTop: 2 },
  shortcuts: {
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1EFE8",
    overflow: "hidden",
  },
  shortcutBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1EFE8",
  },
  shortcutText: { flex: 1, fontSize: 14, fontWeight: "500", color: "#1a1a1a" },
  shortcutCount: { fontSize: 12, color: "#888" },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FAEEDA",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeEmoji: { fontSize: 16 },
  badgeLabel: { fontSize: 12, color: "#633806", fontWeight: "500" },
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
});
