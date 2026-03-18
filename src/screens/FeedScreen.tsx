import * as React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { supabase } from "../services/supabase";

type Meal = {
  id: string;
  name: string;
  photo_url: string | null;
  score_earned: number;
  created_at: string;
  profiles: any;
  reactions: { id: string }[];
  comments: { id: string }[];
};

function MealCard({ item }: { item: Meal }) {
  const [liked, setLiked] = React.useState(false);
  const [reactionCount, setReactionCount] = React.useState(
    item.reactions?.length ?? 0,
  );

  async function handleReaction() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (liked) {
      await supabase
        .from("reactions")
        .delete()
        .eq("meal_id", item.id)
        .eq("user_id", user.id);
      setReactionCount(reactionCount - 1);
      setLiked(false);
    } else {
      await supabase
        .from("reactions")
        .insert({ meal_id: item.id, user_id: user.id, emoji: "🤤" });
      setReactionCount(reactionCount + 1);
      setLiked(true);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.userRow}>
        <View style={styles.avatar} />
        <Text style={styles.username}>@{item.profiles?.username}</Text>
        <Text style={styles.time}>
          {new Date(item.created_at).toLocaleDateString("fr-FR")}
        </Text>
      </View>
      {item.photo_url && (
        <Image source={{ uri: item.photo_url }} style={styles.photo} />
      )}
      <View style={styles.info}>
        <Text style={styles.mealName}>{item.name}</Text>
        <View style={styles.metaRow}>
          <TouchableOpacity onPress={handleReaction} style={styles.reactionBtn}>
            <Text style={styles.meta}>
              {liked ? "🤤" : "😐"} {reactionCount}
            </Text>
          </TouchableOpacity>
          <Text style={styles.meta}>💬 {item.comments?.length ?? 0}</Text>
          {item.score_earned > 0 && (
            <View style={styles.scorePill}>
              <Text style={styles.scoreText}>+{item.score_earned} pts</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export default function FeedScreen() {
  const [meals, setMeals] = React.useState<Meal[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  async function loadMeals() {
    const { data, error } = await supabase
      .from("meals")
      .select(
        `
        id,
        name,
        photo_url,
        score_earned,
        created_at,
        profiles ( username, avatar_url ),
        reactions ( id ),
        comments ( id )
      `,
      )
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) console.error(error);
    else setMeals(data as Meal[]);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadMeals();
    setRefreshing(false);
  }

  React.useEffect(() => {
    loadMeals();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <Text style={styles.logo}>feed.</Text>
      </View>
      <FlatList
        data={meals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MealCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D85A30"
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucun repas pour l'instant.</Text>
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
  time: { fontSize: 11, color: "#bbb", marginLeft: "auto" },
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
  empty: { alignItems: "center", marginTop: 80, gap: 8 },
  emptyText: { fontSize: 16, color: "#888" },
  emptySubText: { fontSize: 14, color: "#bbb" },

  reactionBtn: { flexDirection: "row", alignItems: "center" },
});
