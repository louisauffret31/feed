import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";

const MOCK_PROFILE = {
  name: "Marie Dupont",
  username: "@marie",
  meals: 48,
  scoreTotal: 247,
  scoreWeek: 18,
  leaderboard: 2,
};

const MOCK_GRID = [
  {
    id: "1",
    photo: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=200",
  },
  {
    id: "2",
    photo: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200",
  },
  {
    id: "3",
    photo: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200",
  },
  {
    id: "4",
    photo: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200",
  },
  {
    id: "5",
    photo: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200",
  },
  {
    id: "6",
    photo: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200",
  },
];

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar} />
        <Text style={styles.name}>{MOCK_PROFILE.name}</Text>
        <Text style={styles.handle}>
          {MOCK_PROFILE.username} · {MOCK_PROFILE.meals} repas
        </Text>

        {/* Triple score */}
        <View style={styles.scoreRow}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreNum}>{MOCK_PROFILE.scoreTotal}</Text>
            <Text style={styles.scoreLbl}>Score à vie</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreNum}>{MOCK_PROFILE.scoreWeek}</Text>
            <Text style={styles.scoreLbl}>Cette semaine</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreNum}>#{MOCK_PROFILE.leaderboard}</Text>
            <Text style={styles.scoreLbl}>Leaderboard</Text>
          </View>
        </View>
      </View>

      {/* Grille repas */}
      <FlatList
        data={MOCK_GRID}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={({ item }) => (
          <Image source={{ uri: item.photo }} style={styles.gridItem} />
        )}
        showsVerticalScrollIndicator={false}
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
  gridItem: {
    width: "33.33%",
    aspectRatio: 1,
    padding: 1,
  },
});
