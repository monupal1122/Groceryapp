import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

const BASE_URL = "https://grocery-backend-3pow.onrender.com";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  // Load session on app start
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const userData = await AsyncStorage.getItem("userData");

        console.log("Stored:", token, userData);

        if (token && userData) {
          setAuthToken(token);
          setUser(JSON.parse(userData));
        }
      } catch (err) {
        console.log("Error checking login:", err);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  // LOGIN
  const login = async (email, password) => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // SAVE TOKEN + USER
      await AsyncStorage.setItem("authToken", data.token);
      await AsyncStorage.setItem("userData", JSON.stringify(data.user));

      setAuthToken(data.token);
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (err) {
      console.log("Login error:", err);
      return { success: false, error: err.message };
    }
  };

  // SIGNUP
  const signup = async (username, email, password) => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Signup failed");

      return { success: true, user: data.user };
    } catch (err) {
      console.log("Signup error:", err);
      return { success: false, error: err.message };
    }
  };

  // LOGOUT
  const logout = async () => {
    try {
      if (authToken) {
        await fetch(`${BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
      }

      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("userData");

      setAuthToken(null);
      setUser(null);
    } catch (err) {
      console.log("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authToken,
        login,
        signup,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
