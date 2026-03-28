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
import { sendPushNotification } from "../services/notifications";
import MealDetailScreen from "./MealDetailScreen";
import UserProfileScreen from "./UserProfileScreen";
import { useFeedRefresh } from "../hooks/useFeedRefresh";

type Meal = {
  id: string;
  name: string;
  photo_url: string | null;
  score_earned: number;
  health_score: number;
  originality_score: number;
  created_at: string;
  profiles: { id: string; username: string; avatar_url: string | null } | null;
  reactions: { id: string }[];
  comments: { id: string }[];
};

function MealCard({
  item,
  onPress,
  onUserPress,
}: {
  item: Meal;
  onPress: () => void;
  onUserPress: () => void;
}) {
  const [liked, setLiked] = React.useState(false);
  const [reactionCount, setReactionCount] = React.useState(
    item.reactions?.length ?? 0,
  );
  const [showHeart, setShowHeart] = React.useState(false);
  const lastTap = React.useRef<number>(0);

  React.useEffect(() => {
    async function checkLiked() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("reactions")
        .select("id")
        .eq("meal_id", item.id)
        .eq("user_id", user.id)
        .single();
      setLiked(!!data);
    }
    checkLiked();
  }, []);

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

    const { data: mealOwner } = await supabase
      .from("meals")
      .select("user_id, profiles(username, push_token)")
      .eq("id", item.id)
      .single();

    const owner = mealOwner?.profiles as any;
    if (owner?.push_token && mealOwner?.user_id !== user.id) {
      await sendPushNotification(
        owner.push_token,
        "🤤 Nouveau réaction !",
        `${user.email} a réagi à ton repas`,
      );
    }
  }

  function handleDoubleTap() {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!liked) {
        handleReaction();
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 800);
      }
    } else {
      onPress();
    }
    lastTap.current = now;
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleDoubleTap}
      activeOpacity={0.95}
    >
      <TouchableOpacity style={styles.userRow} onPress={onUserPress}>
        <View style={styles.avatar} />
        <Text style={styles.username}>@{item.profiles?.username}</Text>
        <Text style={styles.time}>
          {new Date(item.created_at).toLocaleDateString("fr-FR")}
        </Text>
      </TouchableOpacity>

      <View style={styles.photoContainer}>
        {item.photo_url && (
          <Image source={{ uri: item.photo_url }} style={styles.photo} />
        )}
        {showHeart && (
          <View style={styles.heartOverlay}>
            <Text style={styles.heartEmoji}>🤤</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.mealName}>{item.name}</Text>

        {(item.health_score > 0 || item.originality_score > 0) && (
          <View style={styles.scoresRow}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreEmoji}>🥗</Text>
              <View style={styles.scoreDots}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.scoreDot,
                      i <= Math.round(item.health_score)
                        ? styles.dotGreen
                        : styles.dotEmpty,
                    ]}
                  />
                ))}
              </View>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreEmoji}>✨</Text>
              <View style={styles.scoreDots}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.scoreDot,
                      i <= Math.round(item.originality_score)
                        ? styles.dotAmber
                        : styles.dotEmpty,
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={styles.metaRow}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleReaction();
            }}
            style={styles.reactionBtn}
          >
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
    </TouchableOpacity>
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
  scoresRow: { flexDirection: "row", gap: 16, marginBottom: 8 },
  scoreItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  scoreEmoji: { fontSize: 14 },
  scoreDots: { flexDirection: "row", gap: 3 },
  scoreDot: { width: 8, height: 8, borderRadius: 4 },
  dotGreen: { backgroundColor: "#1D9E75" },
  dotAmber: { backgroundColor: "#EF9F27" },
  dotEmpty: { backgroundColor: "#F1EFE8" },
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
  skeletonList: { padding: 12, gap: 16 },
  skeletonCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F1EFE8",
    gap: 8,
    padding: 10,
  },
  skeletonUser: {
    width: 120,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#F1EFE8",
  },
  skeletonPhoto: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#F1EFE8",
  },
  skeletonText: {
    width: "60%",
    height: 14,
    borderRadius: 8,
    backgroundColor: "#F1EFE8",
  },
  photoContainer: { position: "relative" },
  heartOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  heartEmoji: { fontSize: 80 },
});

export default function FeedScreen() {
  const [meals, setMeals] = React.useState<Meal[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [selectedMealId, setSelectedMealId] = React.useState<string | null>(
    null,
  );
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(
    null,
  );
  const { refreshKey } = useFeedRefresh();

  async function loadMeals() {
    const { data, error } = await supabase
      .from("meals")
      .select(
        `
        id, name, photo_url, score_earned, health_score, originality_score, created_at,
        profiles ( id, username, avatar_url ),
        reactions ( id ),
        comments ( id )
      `,
      )
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) console.error(error);
    else setMeals(data as unknown as Meal[]);
    setLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadMeals();
    setRefreshing(false);
  }

  React.useEffect(() => {
    loadMeals();
  }, [refreshKey]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.topbar}>
          <Text style={styles.logo}>feed.</Text>
        </View>
        <View style={styles.skeletonList}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonCard}>
              <View style={styles.skeletonUser} />
              <View style={styles.skeletonPhoto} />
              <View style={styles.skeletonText} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (selectedUserId) {
    return (
      <UserProfileScreen
        userId={selectedUserId}
        onBack={() => setSelectedUserId(null)}
      />
    );
  }

  if (selectedMealId) {
    return (
      <MealDetailScreen
        mealId={selectedMealId}
        onBack={() => setSelectedMealId(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <Text style={styles.logo}>feed.</Text>
      </View>
      <FlatList
        data={meals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MealCard
            item={item}
            onPress={() => setSelectedMealId(item.id)}
            onUserPress={() => setSelectedUserId(item.profiles?.id ?? null)}
          />
        )}
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
