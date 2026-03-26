import * as React from "react";
import { supabase } from "./src/services/supabase";
import Navigation from "./src/navigation/index";
import LoginScreen from "./src/screens/LoginScreen";
import {
  registerForPushNotifications,
  savePushToken,
} from "./src/services/notifications";

export default function App() {
  const [session, setSession] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

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

  if (loading) return null;

  return session ? <Navigation /> : <LoginScreen onLogin={() => {}} />;
}
