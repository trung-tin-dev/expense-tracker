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
      router.push("/login");
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
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/" className="text-gray-600">
            ←
          </Link>
          <h1 className="text-lg font-semibold">Cài đặt</h1>
          <div className="w-8"></div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4">
        {/* User Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <div className="flex items-center gap-4">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl">
                {user?.email?.[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold">{user?.displayName || "User"}</p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-xl shadow-sm">
          <Link
            href="/budget"
            className="flex items-center justify-between p-4 border-b hover:bg-gray-50"
          >
            <span className="flex items-center gap-3">
              <span>📊</span>
              <span>Ngân sách tháng</span>
            </span>
            <span className="text-gray-400">→</span>
          </Link>

          <Link
            href="/history"
            className="flex items-center justify-between p-4 border-b hover:bg-gray-50"
          >
            <span className="flex items-center gap-3">
              <span>📜</span>
              <span>Lịch sử giao dịch</span>
            </span>
            <span className="text-gray-400">→</span>
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-between p-4 hover:bg-red-50 text-left"
          >
            <span className="flex items-center gap-3 text-red-500">
              <span>🚪</span>
              <span>{loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
            </span>
          </button>
        </div>
      </div>
    </main>
  );
}
