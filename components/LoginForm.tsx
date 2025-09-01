import Google from "@/assets/icons/Google";
import { useAuth } from "@/context/auth";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";

export default function LoginForm() {
  const { signIn } = useAuth();

  return (
    <View style={{ flex: 1, paddingHorizontal: 10 }}>
      <ThemedText style={{ fontSize: 20, marginBottom: 10 }}>
        Analyze your food and get detailed nutritional information
      </ThemedText>
      <TouchableOpacity style={styles.signInButton} onPress={signIn}>
        <ThemedText fontFamily="bold" style={styles.signInText}>
          Sign in with Google
        </ThemedText>
        <Google width="20px" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  signInButton: {
    padding: 12,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#000",
  },
  signInText: {
    color: "#fff",
    fontSize: 18,
  },
  textRegular: {
    fontFamily: "Quicksand-Regular",
  },
  textBold: {
    fontFamily: "Quicksand-Bold",
  },
});
