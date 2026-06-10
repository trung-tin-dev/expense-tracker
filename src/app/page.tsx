// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">💰 Expense Tracker</h1>
      <p className="text-gray-600 mb-8">App quản lý chi tiêu cho bạn gái</p>

      <Link
        href="/budget"
        className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium"
      >
        Bắt đầu →
      </Link>
    </main>
  );
}
