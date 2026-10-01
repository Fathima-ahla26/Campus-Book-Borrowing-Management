declare module "react" {
  const React: any;
  export default React;
  export type ReactNode = any;
  export function createContext<T>(defaultValue: T): any;
  export function useContext<T>(context: any): T;
  export function useEffect(
    effect: () => void | (() => void),
    deps?: any[]
  ): void;
  export function useState<T>(
    initialState: T | (() => T)
  ): [T, (value: T | ((prev: T) => T)) => void];
}

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiRequest } from "../api/api";

type User = {
  _id?: string;
  name?: string;
  studentId?: string;
  email?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    studentId: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Authentication persistence can be added with AsyncStorage
    // once the Expo dependencies are repaired.
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    setToken(data.token);
    setUser(data.user);
  }

  async function register(
    name: string,
    studentId: string,
    email: string,
    password: string
  ) {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        studentId,
        email,
        password,
      }),
    });

    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}