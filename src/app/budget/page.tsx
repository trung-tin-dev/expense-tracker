// app/budget/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

interface Category {
  id: string;
  name: string;
  budget: number;
  icon: string;
}

const defaultCategories: Category[] = [
  { id: "rent", name: "Tiền nhà", budget: 0, icon: "🏠" },
  { id: "food", name: "Tiền ăn", budget: 0, icon: "🍔" },
  { id: "misc", name: "Lặt vặt", budget: 0, icon: "🛒" },
  { id: "savings", name: "Dự phòng", budget: 0, icon: "🎁" },
];

export default function BudgetPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [totalBudget, setTotalBudget] = useState("");
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(true);

  // Danh sách 12 tháng gần nhất
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleString("vi-VN", { month: "long", year: "numeric" }),
    };
  });

  // Load dữ liệu khi đổi tháng
  useEffect(() => {
    async function loadBudget() {
      if (!user) return;

      setChecking(true);
      const docRef = doc(db, "budgets", `${user.uid}_${selectedMonth}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setTotalBudget(data.totalBudget.toString());
        setCategories(data.categories);
      } else {
        // Reset về mặc định nếu chưa có
        setTotalBudget("");
        setCategories(defaultCategories);
      }
      setChecking(false);
    }

    if (user) loadBudget();
  }, [user, selectedMonth]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleCategoryChange = (
    id: string,
    field: string,
    value: string | number,
  ) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id ? { ...cat, [field]: value } : cat,
      ),
    );
  };

  const handleSave = async () => {
    if (!user) return;
    if (!totalBudget || parseInt(totalBudget) <= 0) {
      alert("Vui lòng nhập tổng ngân sách!");
      return;
    }

    setSaving(true);
    try {
      await setDoc(doc(db, "budgets", `${user.uid}_${selectedMonth}`), {
        userId: user.uid,
        month: selectedMonth,
        totalBudget: parseInt(totalBudget),
        categories: categories.map((cat) => ({
          ...cat,
          budget: parseInt(cat.budget.toString()) || 0,
        })),
        createdAt: new Date().toISOString(),
      });

      alert("Đã lưu ngân sách!");
      router.push("/");
    } catch (error) {
      console.error("Save error:", error);
      alert("Lưu thất bại! Thử lại.");
    }
    setSaving(false);
  };

  const totalAllocated = categories.reduce(
    (sum, cat) => sum + (parseInt(cat.budget.toString()) || 0),
    0,
  );

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
          <Link href="/" className="text-gray-600 text-2xl">
            ←
          </Link>
          <h1 className="text-lg font-semibold">Ngân sách</h1>
          <div className="w-8"></div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4">
        {/* Chọn tháng */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <label className="text-gray-500 text-sm block mb-2">
            📅 Chọn tháng
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full p-3 bg-gray-50 rounded-lg font-medium outline-none"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tổng ngân sách */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <label className="text-gray-600 text-sm">
            💰 Tổng ngân sách tháng
          </label>
          <input
            type="number"
            value={totalBudget}
            onChange={(e) => setTotalBudget(e.target.value)}
            placeholder="10,000,000"
            className="w-full text-3xl font-bold mt-1 outline-none"
          />
        </div>

        {/* Danh sách danh mục */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold mb-4">📊 Phân bổ chi tiêu</h2>

          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg"
            >
              <span className="text-2xl">{cat.icon}</span>
              <div className="flex-1">
                <input
                  type="text"
                  value={cat.name}
                  onChange={(e) =>
                    handleCategoryChange(cat.id, "name", e.target.value)
                  }
                  className="w-full font-medium bg-transparent outline-none mb-1"
                />
                <input
                  type="number"
                  value={cat.budget}
                  onChange={(e) =>
                    handleCategoryChange(cat.id, "budget", e.target.value)
                  }
                  placeholder="0"
                  className="w-full text-gray-600 bg-transparent outline-none"
                />
              </div>
            </div>
          ))}

          <div className="pt-4 border-t flex justify-between">
            <span className="text-gray-600">Đã phân bổ:</span>
            <span
              className={
                totalAllocated > parseInt(totalBudget || "0")
                  ? "text-red-500 font-bold"
                  : "text-gray-800 font-medium"
              }
            >
              {totalAllocated.toLocaleString()} /{" "}
              {parseInt(totalBudget || "0").toLocaleString()} đ
            </span>
          </div>
        </div>

        {/* Nút Lưu */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-6 py-3 bg-blue-500 text-white rounded-xl font-medium disabled:bg-blue-300 hover:bg-blue-600 transition-colors"
        >
          {saving ? "Đang lưu..." : "💾 Lưu ngân sách"}
        </button>
      </div>
    </main>
  );
}
