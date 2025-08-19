import { tokenCache } from "@/utils/cache";
import { BASE_URL, TOKEN_KEY_NAME } from "@/utils/constants";
import { AuthUser } from "@/utils/middleware";
import {
  AuthError,
  AuthRequestConfig,
  DiscoveryDocument,
  exchangeCodeAsync,
  makeRedirectUri,
  useAuthRequest,
} from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as jose from "jose";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext({
  user: null as AuthUser | null,
  isLoading: false,
  error: null as AuthError | null,
  signIn: () => {},
  signOut: () => {},
  fetchWithAuth: (url: string, options: RequestInit) =>
    Promise.resolve(new Response()),
});

const config: AuthRequestConfig = {
  clientId: "google",
  scopes: ["openid", "profile", "email"],
  redirectUri: makeRedirectUri(),
};

const discovery: DiscoveryDocument = {
  authorizationEndpoint: `${BASE_URL}/api/auth/authorize`,
  tokenEndpoint: `${BASE_URL}/api/auth/token`,
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [accessToken, setAccessToken] = useState("");

  const [request, response, promptAsync] = useAuthRequest(config, discovery);

  const isWeb = Platform.OS === "web";

  const handleResponse = useCallback(async () => {
    setIsLoading(true);

    if (response?.type === "success") {
      try {
        const { code } = response.params;

        // Detras hace una llamada al endpoint /api/auth/token y envia
        // en el body el code, el platform OS...
        const tokenResponse = await exchangeCodeAsync(
          {
            code,
            extraParams: {
              platform: Platform.OS,
            },
            clientId: "google",
            redirectUri: makeRedirectUri(),
          },
          discovery,
        );

        if (isWeb) {
          // For web the server sets the tokens in HTTP-only cookies
          // We just need to get the user data from the response
          const sessionResponse = await fetch(`${BASE_URL}/api/auth/session`, {
            method: "GET",
            credentials: "include",
          });

          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            setUser({ ...sessionData, id: sessionData.sub } as AuthUser);
          }
        } else {
          const accessToken = tokenResponse.accessToken;
          if (accessToken) setAccessToken(accessToken);

          // Save token to local storage
          tokenCache?.saveToken(TOKEN_KEY_NAME, accessToken);

          // Get user info
          const decoded = jose.decodeJwt(accessToken);
          setUser({ ...decoded, id: decoded.sub } as AuthUser);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    } else if (response?.type === "error") {
      setError(response.error as AuthError);
    }
  }, [response, isWeb]);

  useEffect(() => {
    handleResponse();
  }, [handleResponse]);

  useEffect(() => {
    const restoreSession = async () => {
      setIsLoading(true);
      try {
        if (isWeb) {
          const sessionResponse = await fetch(`${BASE_URL}/api/auth/session`, {
            method: "GET",
            credentials: "include",
          });

          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            setUser({ ...sessionData, id: sessionData.sub } as AuthUser);
          }
        } else {
          const storedAccessToken = await tokenCache?.getToken(TOKEN_KEY_NAME);

          console.log(
            "Restoring session - Access token:",
            storedAccessToken ? "exists" : "missing",
          );

          if (storedAccessToken) {
            const decoded = jose.decodeJwt(storedAccessToken);
            const exp = decoded.exp;
            const now = Math.floor(Date.now() / 1000);

            if (exp && exp > now) {
              // Access token is still valid:
              console.log("Access token is still valid, using it");
              setAccessToken(storedAccessToken);
              setUser({ ...decoded, id: decoded.sub } as AuthUser);
            } else {
              console.log("Access token is invalid");
              setAccessToken("");
              setUser(null);
              tokenCache?.deleteToken(TOKEN_KEY_NAME);
            }
          }
        }
      } catch (err) {
        console.error("Error restoring session:", err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [isWeb]);

  const signIn = async () => {
    try {
      if (!request) {
        console.log("No request");
        return;
      }

      await promptAsync();
    } catch (err) {
      console.log(err);
    }
  };

  const signOut = () => {};

  const fetchWithAuth = async (url: string, options: RequestInit) => {
    if (isWeb) {
      const response = await fetch(url, { ...options, credentials: "include" });

      if (response.status === 401) {
        console.log("Api request failed with 401, attempting to refresh token");

        // await refreshAccessToken();

        // If we still hace a user after refresh, retry the request:
        if (user) {
          return fetch(url, { ...options, credentials: "include" });
        }
      }

      return response;
    } else {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // if repsonse is 401 you need to refresh token

      return response;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        signIn,
        signOut,
        fetchWithAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
