import Google from "@/assets/icons/Google";
import { useAuth } from "@/context/auth";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function LoginForm() {
  const { signIn } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Login</Text>
      <Pressable style={styles.signInButton} onPress={signIn}>
        <Text style={styles.signInText}>Sign in with Google</Text>
        <Google width="18px" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  signInButton: {
    padding: 5,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#062D6F",
  },
  signInText: {
    color: "#fff",
  },
});
