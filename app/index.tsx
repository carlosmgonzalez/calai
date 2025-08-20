import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/context/auth";
import { useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Index() {
  const { isLoading, user, signOut, fetchWithAuth } = useAuth();
  const [protectedData, setProtectedData] = useState(null);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  const getProtectedData = async () => {
    setLoadingData(true);
    try {
      const response = await fetchWithAuth("/api/protected/data", {});
      const data = await response.json();
      setProtectedData(data);
    } catch {
      console.log("Error while getting the protected data");
    } finally {
      setLoadingData(false);
    }
  };

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
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
      <Pressable style={styles.fetchButton} onPress={getProtectedData}>
        <Text style={styles.buttonText}>Fetch protected data</Text>
      </Pressable>
      <Text>{protectedData && JSON.stringify(protectedData, null, 4)}</Text>
      {loadingData && <ActivityIndicator />}
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
  buttonText: {
    color: "#fff",
  },
  fetchButton: {
    padding: 5,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#186927",
    marginTop: 10,
  },
});
