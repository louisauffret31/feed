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
} from "react-native";
import { supabase } from "../services/supabase";

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLogin, setIsLogin] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

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
        Alert.alert("Compte créé !", "Tu peux maintenant te connecter.");
        setIsLogin(true);
      }
      onLogin();
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.hero}>
        <Text style={styles.logo}>feed.</Text>
        <Text style={styles.tagline}>Share what you eat.</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#bbb"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor="#bbb"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading
              ? "Chargement..."
              : isLogin
                ? "Se connecter"
                : "Créer mon compte"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchText}>
            {isLogin
              ? "Pas encore de compte ? S'inscrire"
              : "Déjà un compte ? Se connecter"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAECE7" },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { fontSize: 56, fontWeight: "500", color: "#712B13" },
  tagline: { fontSize: 16, color: "#993C1D", marginTop: 8 },
  form: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 12,
    paddingBottom: 48,
  },
  input: {
    borderWidth: 1,
    borderColor: "#F1EFE8",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#1a1a1a",
    backgroundColor: "#FAFAFA",
  },
  btn: {
    backgroundColor: "#D85A30",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 16, color: "#fff", fontWeight: "500" },
  switchText: {
    textAlign: "center",
    fontSize: 13,
    color: "#993C1D",
    marginTop: 4,
  },
});
