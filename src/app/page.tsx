"use client";

import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

export default function Home() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-plum-600 font-medium">Đang tải...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-cream-50">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#fbe3e3] rounded-full blur-[100px] opacity-75 animate-float-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#ffe3d8] rounded-full blur-[100px] opacity-75 animate-float-slow-reverse" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-tr from-pink-brand to-[#ffe3d8] rounded-3xl flex items-center justify-center text-5xl shadow-pink-glow mx-auto mb-6">
            🌸
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-plum-900 mb-4">
            Blossom Budget
          </h1>
          <p className="text-plum-600 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Quản lý chi tiêu thông minh, trực quan và dễ dàng với tông màu hồng kem lãng mạn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="glass-panel rounded-2xl p-6 border border-white/60 shadow-pink-glow text-center">
            <p className="text-3xl mb-2">📊</p>
            <h2 className="font-extrabold text-plum-900 mb-1">Ngân sách tháng</h2>
            <p className="text-plum-600 text-sm">Thiết lập và theo dõi hạn mức theo từng danh mục</p>
          </div>
          <div className="glass-panel rounded-2xl p-6 border border-white/60 shadow-pink-glow text-center">
            <p className="text-3xl mb-2">➕</p>
            <h2 className="font-extrabold text-plum-900 mb-1">Ghi chi tiêu</h2>
            <p className="text-plum-600 text-sm">Ghi nhận giao dịch nhanh chóng, mọi lúc mọi nơi</p>
          </div>
          <div className="glass-panel rounded-2xl p-6 border border-white/60 shadow-pink-glow text-center">
            <p className="text-3xl mb-2">🕐</p>
            <h2 className="font-extrabold text-plum-900 mb-1">Tổng quan</h2>
            <p className="text-plum-600 text-sm">Xem số dư còn lại và giao dịch gần đây trên dashboard</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-pink-brand hover:bg-pink-dark text-white rounded-2xl font-bold shadow-pink-button transition-all duration-300 hover:-translate-y-0.5"
            >
              Vào Dashboard →
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-pink-brand hover:bg-pink-dark text-white rounded-2xl font-bold shadow-pink-button transition-all duration-300 hover:-translate-y-0.5"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
