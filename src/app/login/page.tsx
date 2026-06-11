// app/login/page.tsx
"use client";

import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useRouter } from "next/navigation";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert("Đăng nhập thất bại! Thử lại.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-cream-50">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#fbe3e3] rounded-full blur-[100px] opacity-75 animate-float-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#ffe3d8] rounded-full blur-[100px] opacity-75 animate-float-slow-reverse" />

      <div className="relative max-w-md w-full glass-panel rounded-3xl shadow-pink-glow p-10 border border-white/60 text-center z-10 transition-all duration-300 hover:shadow-[0_15px_40px_rgba(242,155,155,0.25)]">
        {/* Decorative Flower or Budget Icon */}
        <div className="w-20 h-20 bg-gradient-to-tr from-pink-brand to-[#ffe3d8] rounded-2xl flex items-center justify-center text-4xl shadow-pink-glow mx-auto mb-6 animate-pulse">
          🌸
        </div>
        
        <h1 className="text-3xl font-extrabold tracking-tight text-plum-900 mb-2">
          Blossom Budget
        </h1>
        <p className="text-plum-600 font-medium mb-8">
          Quản lý chi tiêu trong tầm tay với tông màu hồng kem tinh tế
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-10 h-10 border-4 border-pink-brand border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-plum-600 font-medium text-sm">Đang kết nối tài khoản Google...</p>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="w-full px-6 py-4 bg-white hover:bg-pink-soft border border-plum-100 hover:border-pink-brand rounded-2xl font-semibold text-plum-900 flex items-center justify-center gap-3 transition-all duration-300 shadow-sm hover:shadow-pink-button hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Đăng nhập bằng Google</span>
          </button>
        )}
      </div>
    </main>
  );
}
