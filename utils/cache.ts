import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

type TokenCache = {
  getToken: (key: string) => Promise<string | null>;
  saveToken: (key: string, value: string) => Promise<void>;
  deleteToken: (key: string) => Promise<void>;
};

const createTokenCache = (): TokenCache => {
  return {
    getToken: async (key: string) => {
      try {
        const item = await SecureStore.getItemAsync(key);
        if (!item) {
          console.log("We don't hace a cached session");
        } else {
          console.log("Session restored from cache");
        }
        return item;
      } catch {
        await SecureStore.deleteItemAsync(key);
        return null;
      }
    },
    saveToken: async (key: string, value: string) => {
      await SecureStore.setItemAsync(key, value);
    },
    deleteToken: async (key: string) => {
      await SecureStore.deleteItemAsync(key);
    },
  };
};

export const tokenCache =
  Platform.OS === "web" ? undefined : createTokenCache();
