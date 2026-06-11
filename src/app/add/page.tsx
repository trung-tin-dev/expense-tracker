// app/add/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

interface Category {
  id: string;
  name: string;
  budget: number;
  icon: string;
}

const defaultCategories: Category[] = [
  { id: "rent", name: "Tiền nhà", budget: 0, icon: "🏡" },
  { id: "food", name: "Tiền ăn", budget: 0, icon: "🍰" },
  { id: "misc", name: "Lặt vặt", budget: 0, icon: "🛍️" },
  { id: "savings", name: "Dự phòng", budget: 0, icon: "🧸" },
];

export default function AddTransaction() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(true);

  // Lấy danh sách categories theo tháng của ngày giao dịch
  useEffect(() => {
    async function fetchCategories() {
      if (!user) return;

      const month = date.slice(0, 7);
      const budgetDoc = await getDoc(
        doc(db, "budgets", `${user.uid}_${month}`),
      );

      if (budgetDoc.exists()) {
        const data = budgetDoc.data();
        setCategories(data.categories);
      } else {
        setCategories(defaultCategories);
      }
      setSelectedCategory(null); // Reset danh mục đã chọn khi đổi tháng để tránh lệch danh mục
      setChecking(false);
    }

    if (user) fetchCategories();
  }, [user, date]);

  // Chưa login
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleSave = async () => {
    if (!user || !selectedCategory || !amount) {
      alert("Vui lòng nhập số tiền và chọn danh mục!");
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        amount: parseInt(amount),
        category: selectedCategory.id,
        categoryIcon: selectedCategory.icon,
        categoryName: selectedCategory.name,
        note: note,
        date: date,
        createdAt: serverTimestamp(),
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Save error:", error);
      alert("Lưu thất bại! Thử lại.");
    }
    setSaving(false);
  };

  if (loading || checking) {
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
            <span>➕</span> Ghi nhận chi tiêu
          </h1>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="max-w-xl mx-auto p-4 md:p-8 space-y-6">
        {/* Số tiền */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-pink-glow">
          <label className="text-plum-600 text-xs font-bold tracking-wider uppercase block mb-1">
            Số tiền chi tiêu
          </label>
          <div className="flex items-center border-b-2 border-pink-brand/30 focus-within:border-pink-brand py-2 transition-colors">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full text-4xl font-black bg-transparent text-plum-900 outline-none placeholder-plum-300"
              autoFocus
            />
            <span className="text-2xl font-bold text-plum-900 ml-2">đ</span>
          </div>
        </div>

        {/* Danh mục */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-pink-glow">
          <label className="text-plum-600 text-xs font-bold tracking-wider uppercase block mb-4">
            Chọn danh mục chi tiêu
          </label>

          {categories.length === 0 ? (
            <p className="text-plum-600 text-center text-sm py-4">Đang tải danh mục...</p>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`p-4 rounded-2xl text-center transition-all duration-300 cursor-pointer border flex flex-col items-center justify-center gap-1.5 ${
                    selectedCategory?.id === cat.id
                      ? "bg-pink-soft border-pink-brand shadow-pink-glow scale-105"
                      : "bg-cream-100 hover:bg-pink-soft/30 border-transparent hover:border-pink-brand/20"
                  }`}
                >
                  <span className="text-3xl transition-transform duration-300 select-none">{cat.icon}</span>
                  <span className="text-xs font-extrabold text-plum-900">{cat.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ngày */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-pink-glow">
          <label className="text-plum-600 text-xs font-bold tracking-wider uppercase block mb-2">
            Ngày giao dịch
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-4 bg-pink-soft border border-pink-brand/20 text-plum-900 font-bold rounded-2xl outline-none focus:border-pink-brand transition-colors cursor-pointer"
          />
        </div>

        {/* Ghi chú */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-pink-glow">
          <label className="text-plum-600 text-xs font-bold tracking-wider uppercase block mb-2">
            Ghi chú chi tiết (tùy chọn)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: Ăn trưa cùng đồng nghiệp, Mua gói cước internet..."
            className="w-full p-4 bg-pink-soft border border-pink-brand/20 text-plum-900 font-bold rounded-2xl outline-none focus:border-pink-brand transition-colors placeholder-plum-300"
          />
        </div>

        {/* Nút Lưu */}
        <button
          onClick={handleSave}
          disabled={saving || !selectedCategory || !amount}
          className="w-full py-4 bg-pink-brand hover:bg-pink-dark text-white rounded-2xl font-bold shadow-pink-button transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:bg-plum-300 cursor-pointer"
        >
          {saving ? "Đang lưu giao dịch..." : "💾 Lưu chi tiêu"}
        </button>
      </div>
    </main>
  );
}
