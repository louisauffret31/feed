import * as React from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

function FeedScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Text>Feed</Text>
    </View>
  );
}
function PostScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Text>Poster</Text>
    </View>
  );
}
function ProfileScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Text>Profil</Text>
    </View>
  );
}

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
                <Ionicons name="add-circle-outline" size={size} color={color} />
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
        <Tab.Screen name="Profil" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
