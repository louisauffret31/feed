import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import FeedScreen from "../screens/FeedScreen";
import PostScreen from "../screens/PostScreen";
import LeaderboardScreen from "../screens/LeaderboardScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#D85A30",
          tabBarInactiveTintColor: "#888780",
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopColor: "#F1EFE8",
            paddingBottom: 4,
          },
          tabBarIcon: ({ color, size }) => {
            if (route.name === "Feed")
              return <Ionicons name="home-outline" size={size} color={color} />;
            if (route.name === "Poster")
              return (
                <Ionicons name="add-circle" size={size + 8} color="#D85A30" />
              );
            if (route.name === "Classement")
              return (
                <Ionicons name="trophy-outline" size={size} color={color} />
              );
            if (route.name === "Profil")
              return (
                <Ionicons name="person-outline" size={size} color={color} />
              );
          },
        })}
      >
        <Tab.Screen name="Feed" component={FeedScreen} />
        <Tab.Screen name="Poster" component={PostScreen} />
        <Tab.Screen name="Classement" component={LeaderboardScreen} />
        <Tab.Screen name="Profil" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
