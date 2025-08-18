import { BASE_URL } from "@/utils/constants";
import {
  AuthError,
  AuthRequestConfig,
  DiscoveryDocument,
  exchangeCodeAsync,
  makeRedirectUri,
  useAuthRequest,
} from "expo-auth-session";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
  give_name?: string;
  family_name?: string;
  email_verified: boolean;
  provider?: string;
  exp?: number;
  cookieExpiration?: number;
};

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
  const [request, response, promptAsync] = useAuthRequest(config, discovery);
  const isWeb = Platform.OS === "web";

  useEffect(() => {
    const handleResponse = async () => {
      if (response?.type === "success") {
        const { code } = response.params;

        try {
          setIsLoading(true);

          const tokenResponse = await exchangeCodeAsync(
            {
              code,
              extraParams: {
                platfrom: Platform.OS,
              },
              clientId: "google",
              redirectUri: makeRedirectUri(),
            },
            discovery
          );

          if (isWeb) {
          } else {
            // const token = await
          }

          console.log({ tokenResponse });
        } catch (err) {
          console.log(err);
        } finally {
          setIsLoading(false);
        }
      } else if (response?.type === "error") {
        setError(response.error as AuthError);
      }
    };

    handleResponse();
  }, [response]);

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
    return new Response();
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
