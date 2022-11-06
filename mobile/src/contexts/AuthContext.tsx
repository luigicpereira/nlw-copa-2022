import { createContext, ReactNode, useEffect, useState } from "react";
import { makeRedirectUri } from "expo-auth-session";
import { useAuthRequest } from "expo-auth-session/providers/google";
import { maybeCompleteAuthSession } from "expo-web-browser";
import { api } from "../services/api";

maybeCompleteAuthSession();
interface UserProps {
  name: string;
  avatarUrl: string;
}

export interface AuthContextDataProps {
  user: UserProps;
  signIn: () => Promise<void>;
  isUserLoading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextDataProps);

export function AuthContextProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState({} as UserProps);
  const [isUserLoading, setIsUserLoading] = useState(false);

  const [googleAuthRequest, googleAuthResponse, promptAsync] = useAuthRequest({
    clientId: process.env.CLIENT_ID,
    redirectUri: makeRedirectUri({ useProxy: true }),
    scopes: ["profile", "email"],
  });

  async function signIn() {
    try {
      setIsUserLoading(true);
      await promptAsync();
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsUserLoading(false);
    }
  }

  async function signInWithGoogle(accessToken: string) {
    try {
      setIsUserLoading(true);

      const signInResponse = await api.post("/users", {
        accessToken,
      });

      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${signInResponse.data.token}`;

      const userInfoResponse = await api.get("/me");

      setUser(userInfoResponse.data.user);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsUserLoading(false);
    }
  }

  useEffect(() => {
    if (
      googleAuthResponse?.type === "success" &&
      googleAuthResponse.authentication?.accessToken
    ) {
      signInWithGoogle(googleAuthResponse.authentication.accessToken);
    }
  }, [googleAuthResponse]);

  return (
    <AuthContext.Provider
      value={{
        signIn,
        user,
        isUserLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
