// app/page.tsx
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  // Nếu đã login thì chuyển sang budget
  useEffect(() => {
    if (user && !loading) {
      router.push("/budget");
    }
  }, [user, loading, router]);

  // Đang load hoặc chưa login
  if (loading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Đang tải...</p>
      </main>
    );
  }

  // Backup - nếu ko redirect đc thì hiện link
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">💰 Expense Tracker</h1>
      <Link
        href="/budget"
        className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium"
      >
        Bắt đầu →
      </Link>
    </main>
  );
}
