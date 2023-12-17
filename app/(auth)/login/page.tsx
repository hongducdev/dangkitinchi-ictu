"use client"
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@/authContext";

const LoginPage = () => {
  const { signIn, isLogged } = useAuth();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (username === "" || password === "") {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);

    try {
      await signIn(username, password);
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  if (isLogged) {
    // Redirect logic after successful login
    // For example, use Next.js router for client-side navigation
    // import { useRouter } from 'next/router';
    // useRouter().push('/');
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#EDF1D6]">
      <div className="w-1/4 bg-white p-5 rounded-xl">
        <h1 className="text-3xl font-bold mb-5 text-center">Đăng nhập</h1>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <label className="text-sm mb-1">Mã sinh viên</label>
          <input
            className="border border-gray-300 p-2 rounded-md mb-3"
            type="text"
            placeholder="e.g: dtc20418010343543"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label className="text-sm mb-1">Mật khẩu</label>
          <input
            className="border border-gray-300 p-2 rounded-md mb-3"
            type="password"
            placeholder="e.g:01/01/2024"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="bg-[#609966] text-white py-2 rounded-md"
            type="submit"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border border-white rounded-full animate-spin border-t-transparent"></div>
              </div>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
