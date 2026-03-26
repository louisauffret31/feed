import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  profiles: { username: string };
};

type Meal = {
  id: string;
  name: string;
  photo_url: string | null;
  score_earned: number;
  created_at: string;
  profiles: any;
  reactions: { id: string }[];
};

export default function MealDetailScreen({
  mealId,
  onBack,
}: {
  mealId: string;
  onBack: () => void;
}) {
  const [meal, setMeal] = React.useState<Meal | null>(null);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [newComment, setNewComment] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);

  async function loadMeal() {
    const { data } = await supabase
      .from("meals")
      .select(
        `
        id, name, photo_url, score_earned, created_at,
        profiles ( username, avatar_url ),
        reactions ( id )
      `,
      )
      .eq("id", mealId)
      .single();

    if (data) setMeal(data as unknown as Meal);
    setLoading(false);
  }

  async function loadComments() {
    const { data } = await supabase
      .from("comments")
      .select(
        `
        id, content, created_at,
        profiles ( username )
      `,
      )
      .eq("meal_id", mealId)
      .order("created_at", { ascending: true });

    if (data) setComments(data as unknown as Comment[]);
  }

  async function sendComment() {
    if (!newComment.trim()) return;
    setSending(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("comments").insert({
      meal_id: mealId,
      user_id: user.id,
      content: newComment.trim(),
    });

    if (!error) {
      setNewComment("");
      loadComments();
    }
    setSending(false);
  }

  React.useEffect(() => {
    loadMeal();
    loadComments();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#D85A30" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Repas</Text>
        </View>

        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <View>
              {/* Photo */}
              {meal?.photo_url && (
                <Image source={{ uri: meal.photo_url }} style={styles.photo} />
              )}

              {/* Infos repas */}
              <View style={styles.mealInfo}>
                <View style={styles.userRow}>
                  <View style={styles.avatar} />
                  <Text style={styles.username}>
                    @{meal?.profiles?.username}
                  </Text>
                  <Text style={styles.time}>
                    {new Date(meal?.created_at ?? "").toLocaleDateString(
                      "fr-FR",
                    )}
                  </Text>
                </View>
                <Text style={styles.mealName}>{meal?.name}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.meta}>
                    🤤 {meal?.reactions?.length ?? 0}
                  </Text>
                  <Text style={styles.meta}>💬 {comments.length}</Text>
                  {(meal?.score_earned ?? 0) > 0 && (
                    <View style={styles.scorePill}>
                      <Text style={styles.scoreText}>
                        +{meal?.score_earned} pts
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Séparateur commentaires */}
              <View style={styles.commentsSeparator}>
                <Text style={styles.commentsTitle}>
                  {comments.length} commentaire{comments.length > 1 ? "s" : ""}
                </Text>
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.commentRow}>
              <View style={styles.commentAvatar} />
              <View style={styles.commentBubble}>
                <Text style={styles.commentUsername}>
                  @{item.profiles?.username}
                </Text>
                <Text style={styles.commentContent}>{item.content}</Text>
                <Text style={styles.commentTime}>
                  {new Date(item.created_at).toLocaleDateString("fr-FR")}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyComments}>
              <Text style={styles.emptyText}>Aucun commentaire encore</Text>
              <Text style={styles.emptySubText}>
                Sois le premier à commenter !
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />

        {/* Input commentaire */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ajouter un commentaire..."
            placeholderTextColor="#bbb"
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={280}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!newComment.trim() || sending) && styles.sendBtnDisabled,
            ]}
            onPress={sendComment}
            disabled={!newComment.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1EFE8",
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "500", color: "#1a1a1a" },
  photo: { width: "100%", height: 280 },
  mealInfo: { padding: 16, gap: 8 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F5C4B3",
  },
  username: { fontSize: 13, fontWeight: "500", color: "#444" },
  time: { fontSize: 11, color: "#bbb", marginLeft: "auto" },
  mealName: { fontSize: 18, fontWeight: "500", color: "#1a1a1a" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  meta: { fontSize: 14, color: "#888" },
  scorePill: {
    marginLeft: "auto",
    backgroundColor: "#FAEEDA",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  scoreText: { fontSize: 12, color: "#633806", fontWeight: "500" },
  commentsSeparator: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1EFE8",
    backgroundColor: "#FAFAFA",
  },
  commentsTitle: { fontSize: 13, fontWeight: "500", color: "#888" },
  commentRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1EFE8",
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5C4B3",
    flexShrink: 0,
  },
  commentBubble: { flex: 1, gap: 3 },
  commentUsername: { fontSize: 13, fontWeight: "500", color: "#1a1a1a" },
  commentContent: { fontSize: 14, color: "#444", lineHeight: 20 },
  commentTime: { fontSize: 11, color: "#bbb" },
  emptyComments: { alignItems: "center", padding: 32, gap: 8 },
  emptyText: { fontSize: 15, color: "#888" },
  emptySubText: { fontSize: 13, color: "#bbb" },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1EFE8",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#F1EFE8",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1a1a1a",
    backgroundColor: "#FAFAFA",
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D85A30",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.4 },
});
