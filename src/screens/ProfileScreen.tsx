import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { supabase } from "../services/supabase";

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

export default function ProfileScreen() {
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [meals, setMeals] = React.useState<Meal[]>([]);
  const [leaderboard, setLeaderboard] = React.useState(0);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Charger le profil
    const { data: profileData } = await supabase
      .from("profiles")
      .select("username, avatar_url, score_total, score_week")
      .eq("id", user.id)
      .single();

    if (profileData) setProfile(profileData);

    // Charger les repas
    const { data: mealsData } = await supabase
      .from("meals")
      .select("id, photo_url, name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (mealsData) setMeals(mealsData);

    // Calculer le rang dans le leaderboard
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
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  }

  React.useEffect(() => {
    loadProfile();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
        <View style={styles.avatar} />
        <Text style={styles.name}>@{profile?.username ?? "..."}</Text>
        <Text style={styles.handle}>{meals.length} repas</Text>

        {/* Triple score */}
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

      {/* Grille repas */}
      <FlatList
        data={meals}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
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
          </View>
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucun repas encore</Text>
            <Text style={styles.emptySubText}>
              Poste ton premier repas ! 🍽️
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
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
  scoreNum: { fontSize: 20, fontWeight: "500", color: "#712B13" },
  scoreLbl: { fontSize: 10, color: "#993C1D", marginTop: 2 },
  gridItem: { width: "33.33%", aspectRatio: 1, padding: 1 },
  gridPhoto: { width: "100%", height: "100%" },
  gridPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FAECE7",
    alignItems: "center",
    justifyContent: "center",
  },
  gridPlaceholderText: { fontSize: 24 },
  empty: { alignItems: "center", marginTop: 60, gap: 8 },
  emptyText: { fontSize: 16, color: "#888" },
  emptySubText: { fontSize: 14, color: "#bbb" },
});
