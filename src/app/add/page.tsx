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

  // Lấy danh sách categories
  useEffect(() => {
    async function fetchCategories() {
      if (!user) return;

      const month = new Date().toISOString().slice(0, 7);
      const budgetDoc = await getDoc(
        doc(db, "budgets", `${user.uid}_${month}`),
      );

      if (budgetDoc.exists()) {
        const data = budgetDoc.data();
        setCategories(data.categories);
      }
      setChecking(false);
    }

    if (user) fetchCategories();
  }, [user]);

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

      router.push("/");
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
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/" className="text-gray-600">
            ←
          </Link>
          <h1 className="text-lg font-semibold">Thêm chi tiêu</h1>
          <div className="w-8"></div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4">
        {/* Số tiền */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <label className="text-gray-500 text-sm">Số tiền</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full text-3xl font-bold outline-none"
            />
            <span className="text-xl">đ</span>
          </div>
        </div>

        {/* Danh mục */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <label className="text-gray-500 text-sm block mb-3">Danh mục</label>

          <div className="grid grid-cols-4 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className={`p-3 rounded-lg text-center transition-colors ${
                  selectedCategory?.id === cat.id
                    ? "bg-blue-100 border-2 border-blue-500"
                    : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                }`}
              >
                <div className="text-2xl mb-1">{cat.icon}</div>
                <div className="text-xs">{cat.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Ngày */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <label className="text-gray-500 text-sm block mb-2">Ngày</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full outline-none"
          />
        </div>

        {/* Ghi chú */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <label className="text-gray-500 text-sm block mb-2">
            Ghi chú (tùy chọn)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Mua gì?..."
            className="w-full outline-none"
          />
        </div>

        {/* Nút Lưu */}
        <button
          onClick={handleSave}
          disabled={saving || !selectedCategory || !amount}
          className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium disabled:bg-blue-300"
        >
          {saving ? "Đang lưu..." : "💾 Lưu"}
        </button>
      </div>
    </main>
  );
}
