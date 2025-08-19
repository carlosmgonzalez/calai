import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/context/auth";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Index() {
  const { isLoading, user, signOut } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <View style={styles.container}>
      <Text>{user.name}</Text>
      <Text>{user.id}</Text>
      <Pressable style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  signOutButton: {
    padding: 5,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#F15D0E",
    marginTop: 10,
  },
  signOutText: {
    color: "#fff",
  },
});
