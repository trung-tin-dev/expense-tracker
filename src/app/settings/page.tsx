// app/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "firebase/auth";

export default function Settings() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    if (confirm("Bạn có chắc muốn đăng xuất?")) {
      setLoggingOut(true);
      await signOut(auth);
      router.push("/");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Đang tải...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream-50 pb-24">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-cream-200 p-4 sticky top-0 z-20">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link
            href="/dashboard"
            className="w-10 h-10 bg-pink-soft hover:bg-pink-light text-plum-900 border border-pink-brand/20 rounded-full flex items-center justify-center text-lg transition-transform hover:scale-105 active:scale-95 shadow-sm"
          >
            ←
          </Link>
          <h1 className="text-lg font-extrabold text-plum-900 flex items-center gap-2">
            <span>⚙️</span> Cài đặt tài khoản
          </h1>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="max-w-xl mx-auto p-4 md:p-8 space-y-6">
        {/* User Info Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-pink-glow">
          <div className="flex items-center gap-5">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-20 h-20 rounded-2xl border-2 border-pink-brand/40 shadow-sm object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-pink-brand to-[#ffe3d8] flex items-center justify-center text-white text-3xl font-black shadow-pink-glow">
                {user?.email?.[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-extrabold text-xl text-plum-900 tracking-tight">{user?.displayName || "Người dùng Blossom"}</p>
              <p className="text-plum-600 text-sm font-semibold truncate mt-0.5">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Menu list */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 shadow-pink-glow overflow-hidden divide-y divide-pink-brand/10">
          <Link
            href="/budget"
            className="flex items-center justify-between p-5 hover:bg-pink-soft/30 transition-colors duration-200 group"
          >
            <span className="flex items-center gap-3.5">
              <span className="w-9 h-9 bg-pink-soft rounded-xl flex items-center justify-center text-lg border border-pink-brand/10 group-hover:scale-105 transition-transform">📊</span>
              <span className="font-bold text-plum-900 text-sm">Ngân sách tháng</span>
            </span>
            <span className="text-pink-dark font-extrabold group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <Link
            href="/history"
            className="flex items-center justify-between p-5 hover:bg-pink-soft/30 transition-colors duration-200 group"
          >
            <span className="flex items-center gap-3.5">
              <span className="w-9 h-9 bg-pink-soft rounded-xl flex items-center justify-center text-lg border border-pink-brand/10 group-hover:scale-105 transition-transform">📜</span>
              <span className="font-bold text-plum-900 text-sm">Lịch sử giao dịch</span>
            </span>
            <span className="text-pink-dark font-extrabold group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-between p-5 hover:bg-red-soft-bg text-left transition-colors duration-200 group cursor-pointer"
          >
            <span className="flex items-center gap-3.5 text-red-soft">
              <span className="w-9 h-9 bg-red-soft/10 rounded-xl flex items-center justify-center text-lg border border-red-soft/20 group-hover:scale-105 transition-transform">🚪</span>
              <span className="font-bold text-sm">{loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
            </span>
            <span className="text-red-soft font-extrabold group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </main>
  );
}
