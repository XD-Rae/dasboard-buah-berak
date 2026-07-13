import React, {createContext, useContext, useState, useEffect} from "react";
import {User} from "../types";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const parseJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(
        "http://localhost:3008/api/users/login",

      // const res = await fetch(
      //   "https://api-buah-berak.garnusa.com/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({EMAIL: email, PASSWORD: password}),
        },
      );

      if (!res.ok) return false;

      const data = await res.json();
      if (!data.success || !data.accessToken) return false;

      // Decode token
      const payload = parseJwt(data.accessToken);
      if (!payload) return false;

      // Susun data user
      const userData: User = {
        id: payload.IDUSER,
        name: payload.NAME,
        email: payload.MAIL,
        role: payload.ROLE,
        // Tambahkan logika kondisional di sini:
        // Jika ROLE adalah 'KDES', ambil IDDUSUN dari payload. Jika tidak, undefined.
        idDusun: payload.ROLE === "KDUS" ? payload.IDDUSUN : undefined,
      };

      setUser(userData);
      localStorage.setItem("accessToken", data.accessToken);

      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:3008/api/users/logout", {
        method: "POST",
        credentials: "include",

      // await fetch("https://api-buah-berak.garnusa.com/api/users/logout", {
      //   method: "POST",
      //   credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
    }
  };

  return (
    <AuthContext.Provider value={{user, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};
