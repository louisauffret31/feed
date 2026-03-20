import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../services/supabase";

type LeaderboardEntry = {
  id: string;
  username: string;
  score_week: number;
  score_total: number;
  rank: number;
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Text style={styles.medal}>🥇</Text>;
  if (rank === 2) return <Text style={styles.medal}>🥈</Text>;
  if (rank === 3) return <Text style={styles.medal}>🥉</Text>;
  return <Text style={styles.rankNum}>#{rank}</Text>;
}

export default function LeaderboardScreen() {
  const [entries, setEntries] = React.useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  async function loadLeaderboard() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    // Charger les amis + soi-même
    const { data: follows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    const friendIds = [user.id, ...(follows?.map((f) => f.following_id) ?? [])];

    const { data } = await supabase
      .from("leaderboard_friends")
      .select("id, username, score_week, score_total, rank")
      .in("id", friendIds)
      .order("score_week", { ascending: false });

    if (data) setEntries(data as LeaderboardEntry[]);
    setLoading(false);
  }

  React.useEffect(() => {
    loadLeaderboard();
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
      <View style={styles.topbar}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Cette semaine · entre amis</Text>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={[styles.row, item.id === currentUserId && styles.rowMe]}>
            <View style={styles.rankCol}>
              <RankBadge rank={index + 1} />
            </View>
            <View style={styles.avatar} />
            <View style={styles.userInfo}>
              <Text style={styles.username}>
                @{item.username}
                {item.id === currentUserId && (
                  <Text style={styles.meTag}> · toi</Text>
                )}
              </Text>
              <Text style={styles.scoreTotal}>
                {item.score_total?.toFixed(1)} pts à vie
              </Text>
            </View>
            <View style={styles.weekScore}>
              <Text style={styles.weekScoreNum}>
                {item.score_week?.toFixed(1)}
              </Text>
              <Text style={styles.weekScoreLbl}>pts / sem</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>🏆 Suis des amis pour voir</Text>
            <Text style={styles.emptySubText}>le leaderboard s'animer !</Text>
          </View>
        }
        ListHeaderComponent={
          entries.length > 0 ? (
            <View style={styles.resetInfo}>
              <Text style={styles.resetText}>
                🔄 Reset chaque lundi à minuit
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
  resetInfo: {
    padding: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1EFE8",
  },
  resetText: { fontSize: 12, color: "#bbb" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1EFE8",
    gap: 12,
  },
  rowMe: { backgroundColor: "#FAECE7" },
  rankCol: { width: 32, alignItems: "center" },
  medal: { fontSize: 22 },
  rankNum: { fontSize: 16, fontWeight: "500", color: "#888" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5C4B3",
  },
  userInfo: { flex: 1 },
  username: { fontSize: 14, fontWeight: "500", color: "#1a1a1a" },
  meTag: { fontSize: 13, color: "#D85A30", fontWeight: "400" },
  scoreTotal: { fontSize: 12, color: "#888", marginTop: 2 },
  weekScore: { alignItems: "flex-end" },
  weekScoreNum: { fontSize: 18, fontWeight: "500", color: "#D85A30" },
  weekScoreLbl: { fontSize: 10, color: "#888" },
  empty: { alignItems: "center", marginTop: 80, gap: 8 },
  emptyText: { fontSize: 16, color: "#888" },
  emptySubText: { fontSize: 14, color: "#bbb" },
});
