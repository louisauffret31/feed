import * as React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";

const MOCK_MEALS = [
  {
    id: "1",
    user: "Marie",
    meal: "Tagliatelles carbonara",
    score: 3.2,
    reactions: 8,
    comments: 2,
    photo: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400",
  },
  {
    id: "2",
    user: "Lucas",
    meal: "Buddha bowl avocat",
    score: 5.1,
    reactions: 14,
    comments: 5,
    photo: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
  },
  {
    id: "3",
    user: "Sophie",
    meal: "Ramen miso poulet",
    score: 4.7,
    reactions: 11,
    comments: 3,
    photo: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
  },
];

function MealCard({ item }: { item: (typeof MOCK_MEALS)[0] }) {
  return (
    <View style={styles.card}>
      <View style={styles.userRow}>
        <View style={styles.avatar} />
        <Text style={styles.username}>{item.user}</Text>
      </View>
      <Image source={{ uri: item.photo }} style={styles.photo} />
      <View style={styles.info}>
        <Text style={styles.mealName}>{item.meal}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>❤️ {item.reactions}</Text>
          <Text style={styles.meta}>💬 {item.comments}</Text>
          <View style={styles.scorePill}>
            <Text style={styles.scoreText}>+{item.score} pts</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function FeedScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <Text style={styles.logo}>feed.</Text>
      </View>
      <FlatList
        data={MOCK_MEALS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MealCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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
  logo: { fontSize: 24, fontWeight: "500", color: "#712B13" },
  list: { padding: 12, gap: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F1EFE8",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F5C4B3",
  },
  username: { fontSize: 13, color: "#444", fontWeight: "500" },
  photo: { width: "100%", height: 220 },
  info: { padding: 12 },
  mealName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  meta: { fontSize: 13, color: "#888" },
  scorePill: {
    marginLeft: "auto",
    backgroundColor: "#FAEEDA",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  scoreText: { fontSize: 12, color: "#633806", fontWeight: "500" },
});
