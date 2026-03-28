import * as React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { supabase } from "./src/services/supabase";
import Navigation from "./src/navigation/index";
import LoginScreen from "./src/screens/LoginScreen";
import {
  registerForPushNotifications,
  savePushToken,
} from "./src/services/notifications";

function SplashScreen({ onDone }: { onDone: () => void }) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => onDone());
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.splash}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Text style={styles.splashLogo}>feed.</Text>
        <Text style={styles.splashTagline}>Share what you eat.</Text>
      </Animated.View>
    </View>
  );
}

export default function App() {
  const [session, setSession] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        registerForPushNotifications().then((token) => {
          if (token) savePushToken(token);
        });
      }
    });
  }, []);

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  if (loading) return null;

  return session ? <Navigation /> : <LoginScreen onLogin={() => {}} />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: "#FAECE7",
    alignItems: "center",
    justifyContent: "center",
  },
  splashLogo: {
    fontSize: 64,
    fontWeight: "500",
    color: "#712B13",
    textAlign: "center",
    letterSpacing: -1,
  },
  splashTagline: {
    fontSize: 16,
    color: "#993C1D",
    textAlign: "center",
    marginTop: 8,
  },
});
