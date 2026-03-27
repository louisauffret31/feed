import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";

type Profile = {
  id: string;
  username: string;
  score_total: number;
  score_week: number;
};

type Meal = {
  id: string;
  photo_url: string | null;
  name: string;
};

export default function UserProfileScreen({
  userId,
  onBack,
}: {
  userId: string;
  onBack: () => void;
}) {
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [meals, setMeals] = React.useState<Meal[]>([]);
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [isMe, setIsMe] = React.useState(false);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (user.id === userId) setIsMe(true);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, username, score_total, score_week")
      .eq("id", userId)
      .single();
    if (profileData) setProfile(profileData);

    const { data: mealsData } = await supabase
      .from("meals")
      .select("id, photo_url, name")
      .eq("user_id", userId)
      .eq("visibility", "public")
      .order("created_at", { ascending: false });
    if (mealsData) setMeals(mealsData);

    const { data: followData } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", userId)
      .single();
    setIsFollowing(!!followData);

    setLoading(false);
  }

  async function toggleFollow() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", userId);
      setIsFollowing(false);
    } else {
      await supabase
        .from("follows")
        .insert({ follower_id: user.id, following_id: userId });
      setIsFollowing(true);
    }
  }

  React.useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#D85A30" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={meals}
        keyExtractor={(item) => item.id}
        numColumns={3}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#712B13" />
            </TouchableOpacity>
            <View style={styles.avatar} />
            <Text style={styles.name}>@{profile?.username}</Text>
            <Text style={styles.handle}>{meals.length} repas</Text>
            <View style={styles.scoreRow}>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreNum}>
                  {profile?.score_total?.toFixed(1)}
                </Text>
                <Text style={styles.scoreLbl}>Score à vie</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreNum}>
                  {profile?.score_week?.toFixed(1)}
                </Text>
                <Text style={styles.scoreLbl}>Cette semaine</Text>
              </View>
            </View>
            {!isMe && (
              <TouchableOpacity
                style={[styles.followBtn, isFollowing && styles.followingBtn]}
                onPress={toggleFollow}
              >
                <Text
                  style={[
                    styles.followText,
                    isFollowing && styles.followingText,
                  ]}
                >
                  {isFollowing ? "Suivi ✓" : "Suivre"}
                </Text>
              </TouchableOpacity>
            )}
            <Text style={styles.mealsTitle}>Repas</Text>
          </View>
        )}
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
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucun repas public</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    backgroundColor: "#FAECE7",
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: { marginBottom: 12 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0997B",
    marginBottom: 6,
  },
  name: { fontSize: 18, fontWeight: "500", color: "#712B13" },
  handle: { fontSize: 13, color: "#993C1D", marginBottom: 10 },
  scoreRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  scoreBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  scoreNum: { fontSize: 20, fontWeight: "500", color: "#712B13" },
  scoreLbl: { fontSize: 10, color: "#993C1D", marginTop: 2 },
  followBtn: {
    backgroundColor: "#D85A30",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  followingBtn: { backgroundColor: "#F1EFE8" },
  followText: { fontSize: 14, color: "#fff", fontWeight: "500" },
  followingText: { color: "#888" },
  mealsTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
    marginTop: 8,
    marginBottom: 8,
  },
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
  empty: { alignItems: "center", marginTop: 60 },
  emptyText: { fontSize: 15, color: "#888" },
});
