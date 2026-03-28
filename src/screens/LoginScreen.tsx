import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";

const FEATURES = [
  {
    emoji: "📸",
    title: "Poste tes repas",
    desc: "Photo + ingrédients en 30 secondes",
  },
  {
    emoji: "⭐",
    title: "Gagne des points",
    desc: "Plus tu explores, plus tu montes",
  },
  { emoji: "👥", title: "Suis tes amis", desc: "Découvre ce qu'ils mangent" },
  {
    emoji: "🏆",
    title: "Défis & badges",
    desc: "Relève les défis de la semaine",
  },
];

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLogin, setIsLogin] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert("Erreur", "Remplis tous les champs");
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        Alert.alert("🎉 Compte créé !", "Tu peux maintenant te connecter.");
        setIsLogin(true);
      }
      onLogin();
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setLoading(false);
    }
  }

  if (showForm) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.formScreen}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setShowForm(false)}
          >
            <Ionicons name="arrow-back" size={24} color="#712B13" />
          </TouchableOpacity>

          <Text style={styles.formTitle}>
            {isLogin ? "Content de te revoir 👋" : "Rejoins feed. 🍽️"}
          </Text>
          <Text style={styles.formSubtitle}>
            {isLogin
              ? "Connecte-toi pour voir ce que mangent tes amis"
              : "Crée ton compte et commence à partager"}
          </Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={18}
                color="#bbb"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#bbb"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color="#bbb"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#bbb"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="#bbb"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.mainBtn, loading && styles.mainBtnDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={styles.mainBtnText}>
              {loading
                ? "Chargement..."
                : isLogin
                  ? "Se connecter"
                  : "Créer mon compte"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.switchText}>
              {isLogin ? "Pas encore de compte ? " : "Déjà un compte ? "}
              <Text style={styles.switchTextBold}>
                {isLogin ? "S'inscrire" : "Se connecter"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.landing}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.heroSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.logo}>feed.</Text>
          <Text style={styles.tagline}>Share what you eat.</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.featuresSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>{f.emoji}</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.mainBtn}
            onPress={() => {
              setIsLogin(false);
              setShowForm(true);
            }}
          >
            <Text style={styles.mainBtnText}>Créer mon compte</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => {
              setIsLogin(true);
              setShowForm(true);
            }}
          >
            <Text style={styles.secondaryBtnText}>J'ai déjà un compte</Text>
          </TouchableOpacity>

          <Text style={styles.legalText}>
            En continuant, tu acceptes nos conditions d'utilisation
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAECE7" },
  landing: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  heroSection: { alignItems: "center", marginBottom: 48 },
  logo: {
    fontSize: 72,
    fontWeight: "500",
    color: "#712B13",
    letterSpacing: -2,
  },
  tagline: { fontSize: 18, color: "#993C1D", marginTop: 8 },
  featuresSection: { gap: 20, marginBottom: 48 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  featureIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureEmoji: { fontSize: 24 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: "500", color: "#712B13" },
  featureDesc: { fontSize: 13, color: "#993C1D", marginTop: 2 },
  ctaSection: { gap: 12 },
  mainBtn: {
    backgroundColor: "#D85A30",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  mainBtnDisabled: { opacity: 0.6 },
  mainBtnText: { fontSize: 17, color: "#fff", fontWeight: "500" },
  secondaryBtn: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(216,90,48,0.3)",
  },
  secondaryBtnText: { fontSize: 17, color: "#712B13", fontWeight: "500" },
  legalText: {
    textAlign: "center",
    fontSize: 11,
    color: "#993C1D",
    opacity: 0.6,
    marginTop: 4,
  },
  formScreen: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    paddingTop: 60,
  },
  backBtn: { marginBottom: 32 },
  formTitle: {
    fontSize: 28,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 15,
    color: "#888",
    marginBottom: 32,
    lineHeight: 22,
  },
  inputGroup: { gap: 12, marginBottom: 24 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1EFE8",
    borderRadius: 14,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1a1a1a",
    paddingVertical: 16,
  },
  eyeBtn: { padding: 4 },
  switchBtn: { marginTop: 16, alignItems: "center" },
  switchText: { fontSize: 14, color: "#888" },
  switchTextBold: { color: "#D85A30", fontWeight: "500" },
});
