import Google from "@/assets/icons/Google";
import { useAuth } from "@/context/auth";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginForm() {
  const { signIn } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 10 }}>
      <Text
        style={{
          ...styles.textBold,
          fontSize: 40,
        }}
      >
        CalAi
      </Text>
      <Text style={{ ...styles.textRegular, fontSize: 20, marginBottom: 10 }}>
        Analyze your food and get detailed nutritional information
      </Text>
      <TouchableOpacity style={styles.signInButton} onPress={signIn}>
        <Text style={styles.signInText}>Sign in with Google</Text>
        <Google width="20px" />
      </TouchableOpacity>
    </SafeAreaView>
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
    fontFamily: "Quicksand-Bold",
    fontSize: 18,
  },
  textRegular: {
    fontFamily: "Quicksand-Regular",
  },
  textBold: {
    fontFamily: "Quicksand-Bold",
  },
});
