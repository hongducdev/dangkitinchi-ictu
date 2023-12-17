"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";

interface AuthContextProps {
  isLogged: boolean;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  logOut: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // kiểm tra có cookie tên là SignIn hay không
    const cookie = document.cookie;
    if (cookie.includes("SignIn")) {
      setIsLogged(true);
      window.location.href = "/";
    } else {
      setIsLogged(false);
    }
  }, []);

  const signIn = async (username: string, password: string) => {
    setIsLoading(true);

    try {
      // gọi api để đăng nhập
      const response = await axios.post(
        "/api/login",
        {
          username,
          password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.error === true) {
        setIsLoading(false);
        alert(response.data.message);
        return;
      }

      setIsLoading(false);
      setIsLogged(true);
      window.location.href = "/";
    } catch (error) {
      console.error("Error during login:", error);
      setIsLoading(false);
      alert("An error occurred during login");
    }
  };

  const logOut = () => {
    document.cookie = "SignIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setIsLogged(false);
  };

  return (
    <AuthContext.Provider value={{ isLogged, isLoading, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
