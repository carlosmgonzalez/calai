import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/auth";
import { Tabs } from "expo-router";
import { FolderKanban, House } from "lucide-react-native";
import { useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { top } = useSafeAreaInsets();
  const [showLogout, setShowLogout] = useState(false);
  const { user, signOut } = useAuth();
  return (
    <View style={{ flex: 1, marginTop: top }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 10,
        }}
      >
        <ThemedText
          fontFamily="bold"
          style={{
            fontSize: 40,
          }}
        >
          CalAi
        </ThemedText>
        {user && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <TouchableOpacity onPress={() => setShowLogout((c) => !c)}>
              <Image
                source={{ uri: user.picture }}
                style={{ width: 30, height: 30, borderRadius: 100 }}
              />
            </TouchableOpacity>
            {showLogout && (
              <TouchableOpacity onPress={signOut}>
                <ThemedText fontFamily="bold" style={{ fontSize: 14 }}>
                  Logout
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      <Tabs
        screenOptions={{ headerShown: false, tabBarActiveTintColor: "#000" }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color }) => <House size={28} color={color} />,
            title: "Home",
          }}
        />
        <Tabs.Screen
          name="record"
          options={{
            tabBarIcon: ({ color }) => <FolderKanban size={28} color={color} />,
            title: "Record",
          }}
        />
      </Tabs>
    </View>
  );
}
