import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../services/supabase";

export default function EditProfileScreen({ onBack }: { onBack: () => void }) {
  const [username, setUsername] = React.useState("");
  const [avatar, setAvatar] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .single();
    if (data) {
      setUsername(data.username ?? "");
      setAvatar(data.avatar_url ?? null);
    }
    setLoading(false);
  }

  async function pickAvatar() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission refusée", "On a besoin d'accéder à ta galerie.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setAvatar(result.assets[0].uri);
  }

  async function uploadAvatar(uri: string): Promise<string | null> {
    try {
      const fileExt = uri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `avatar_${Date.now()}.${fileExt}`;
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: fileName,
        type: `image/${fileExt}`,
      } as any);
      const { error } = await supabase.storage
        .from("meals")
        .upload(`avatars/${fileName}`, formData, {
          contentType: "multipart/form-data",
        });
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from("meals")
        .getPublicUrl(`avatars/${fileName}`);
      return urlData.publicUrl;
    } catch (e) {
      console.error("Avatar upload error:", e);
      return null;
    }
  }

  async function handleSave() {
    if (!username.trim()) {
      Alert.alert("Erreur", "Le nom d'utilisateur ne peut pas être vide.");
      return;
    }
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      let avatarUrl = avatar;
      if (avatar && avatar.startsWith("file://")) {
        avatarUrl = await uploadAvatar(avatar);
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          username: username.trim().toLowerCase(),
          avatar_url: avatarUrl,
        })
        .eq("id", user.id);

      if (error) {
        if (error.code === "23505") {
          Alert.alert("Erreur", "Ce nom d'utilisateur est déjà pris.");
        } else {
          Alert.alert("Erreur", error.message);
        }
        return;
      }

      Alert.alert("✅ Profil mis à jour !", "", [
        { text: "OK", onPress: onBack },
      ]);
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setSaving(false);
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
    <ScrollView style={styles.container}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#712B13" />
        </TouchableOpacity>
        <Text style={styles.title}>Modifier le profil</Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <TouchableOpacity style={styles.avatarContainer} onPress={pickAvatar}>
          {avatar ? (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#F0997B" />
            </View>
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#F0997B" />
            </View>
          )}
          <View style={styles.avatarEditBtn}>
            <Ionicons name="camera" size={14} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarHint}>Appuie pour changer la photo</Text>
      </View>

      {/* Username */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Nom d'utilisateur</Text>
        <View style={styles.inputRow}>
          <Text style={styles.atSign}>@</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={30}
            placeholder="ton_username"
            placeholderTextColor="#bbb"
          />
        </View>
        <Text style={styles.fieldHint}>
          Uniquement des lettres, chiffres et underscores. Min 3 caractères.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveBtnText}>Enregistrer</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => {
          Alert.alert("Déconnexion", "Tu veux te déconnecter ?", [
            { text: "Annuler", style: "cancel" },
            {
              text: "Déconnexion",
              style: "destructive",
              onPress: async () => await supabase.auth.signOut(),
            },
          ]);
        }}
      >
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1EFE8",
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: "500", color: "#1a1a1a" },
  avatarSection: { alignItems: "center", paddingVertical: 32 },
  avatarContainer: { position: "relative" },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FAECE7",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEditBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#D85A30",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarHint: { fontSize: 12, color: "#bbb", marginTop: 8 },
  field: { paddingHorizontal: 16, marginBottom: 24 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1EFE8",
    borderRadius: 10,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 12,
  },
  atSign: { fontSize: 16, color: "#888", marginRight: 4 },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1a1a1a",
    paddingVertical: 12,
  },
  fieldHint: { fontSize: 11, color: "#bbb", marginTop: 6 },
  saveBtn: {
    margin: 16,
    backgroundColor: "#D85A30",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 16, color: "#fff", fontWeight: "500" },
  logoutBtn: {
    margin: 16,
    marginTop: 4,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1EFE8",
  },
  logoutText: { fontSize: 16, color: "#D85A30", fontWeight: "500" },
});
