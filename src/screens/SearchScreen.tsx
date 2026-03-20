import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";

type UserResult = {
  id: string;
  username: string;
  score_total: number;
  isFollowing: boolean;
};

export default function SearchScreen() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<UserResult[]>([]);
  const [loading, setLoading] = React.useState(false);

  async function searchUsers(text: string) {
    setQuery(text);
    if (text.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: users } = await supabase
      .from("profiles")
      .select("id, username, score_total")
      .ilike("username", `%${text}%`)
      .neq("id", user.id)
      .limit(20);

    if (!users) {
      setLoading(false);
      return;
    }

    // Vérifier qui on suit déjà
    const { data: follows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    const followingIds = follows?.map((f) => f.following_id) ?? [];

    setResults(
      users.map((u) => ({
        ...u,
        isFollowing: followingIds.includes(u.id),
      })),
    );
    setLoading(false);
  }

  async function toggleFollow(targetUser: UserResult) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (targetUser.isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetUser.id);
    } else {
      await supabase
        .from("follows")
        .insert({ follower_id: user.id, following_id: targetUser.id });
    }

    setResults(
      results.map((u) =>
        u.id === targetUser.id ? { ...u, isFollowing: !u.isFollowing } : u,
      ),
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <Text style={styles.title}>Rechercher</Text>
      </View>

      <View style={styles.searchRow}>
        <Ionicons
          name="search-outline"
          size={18}
          color="#888"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Rechercher un utilisateur..."
          placeholderTextColor="#bbb"
          value={query}
          onChangeText={searchUsers}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setQuery("");
              setResults([]);
            }}
          >
            <Ionicons name="close-circle" size={18} color="#bbb" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userRow}>
            <View style={styles.avatar} />
            <View style={styles.userInfo}>
              <Text style={styles.username}>@{item.username}</Text>
              <Text style={styles.score}>
                {item.score_total?.toFixed(1)} pts
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.followBtn,
                item.isFollowing && styles.followingBtn,
              ]}
              onPress={() => toggleFollow(item)}
            >
              <Text
                style={[
                  styles.followText,
                  item.isFollowing && styles.followingText,
                ]}
              >
                {item.isFollowing ? "Suivi ✓" : "Suivre"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          query.length >= 2 && !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
            </View>
          ) : query.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>🔍 Trouve tes amis</Text>
              <Text style={styles.emptySubText}>
                Tape au moins 2 caractères
              </Text>
            </View>
          ) : null
        }
      />
    </View>
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1EFE8",
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: { flexShrink: 0 },
  input: { flex: 1, fontSize: 15, color: "#1a1a1a", paddingVertical: 12 },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1EFE8",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5C4B3",
  },
  userInfo: { flex: 1 },
  username: { fontSize: 14, fontWeight: "500", color: "#1a1a1a" },
  score: { fontSize: 12, color: "#888", marginTop: 2 },
  followBtn: {
    backgroundColor: "#D85A30",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  followingBtn: {
    backgroundColor: "#F1EFE8",
  },
  followText: { fontSize: 13, color: "#fff", fontWeight: "500" },
  followingText: { color: "#888" },
  empty: { alignItems: "center", marginTop: 60, gap: 8 },
  emptyText: { fontSize: 16, color: "#888" },
  emptySubText: { fontSize: 14, color: "#bbb" },
});
