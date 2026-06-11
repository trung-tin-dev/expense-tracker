// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";

interface Category {
  id: string;
  name: string;
  budget: number;
  icon: string;
}

interface Transaction {
  id: string;
  amount: number;
  category: string;
  categoryIcon: string;
  date: string;
  note: string;
}

export default function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  const [totalBudget, setTotalBudget] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [spentData, setSpentData] = useState<{ [key: string]: number }>({});
  const [checking, setChecking] = useState(true);
  // Thêm vào phần state (sau useState khác)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // Thêm danh sách tháng: từ 12 tháng tương lai đến 12 tháng quá khứ
  const months = Array.from({ length: 25 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + 12 - i);
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleString("vi-VN", { month: "long", year: "numeric" }),
    };
  });

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      const month = selectedMonth;

      // Lấy budget
      const budgetDoc = await getDoc(
        doc(db, "budgets", `${user.uid}_${month}`),
      );
      if (budgetDoc.exists()) {
        const data = budgetDoc.data();
        setTotalBudget(data.totalBudget);
        setCategories(data.categories);
      } else {
        setTotalBudget(0);
        setCategories([]);
      }

      // Lấy transactions
      const txnQuery = query(
        collection(db, "transactions"),
        where("userId", "==", user.uid),
        orderBy("date", "desc"),
      );

      const txnSnapshot = await getDocs(txnQuery);
      const txns: Transaction[] = [];
      const spent: { [key: string]: number } = {};

      txnSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.date && data.date.startsWith(month)) {
          txns.push({
            id: doc.id,
            amount: data.amount,
            category: data.category,
            categoryIcon: data.categoryIcon,
            date: data.date,
            note: data.note,
          });

          const catId = data.category;
          spent[catId] = (spent[catId] || 0) + data.amount;
        }
      });

      setTransactions(txns);
      setSpentData(spent);
      setChecking(false);
    }

    if (user) fetchData();
  }, [user, selectedMonth]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </main>
    );
  }

  const totalSpent = Object.values(spentData).reduce((a, b) => a + b, 0);
  const remaining = totalBudget - totalSpent;
  const percentUsed =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const percentRemaining = 100 - percentUsed;


  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800">💰 Chi tiêu</h1>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-sm bg-gray-100 rounded-lg px-2 py-1 outline-none"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <Link
            href="/settings"
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg"
          >
            ⚙️
          </Link>
        </div>
      </header>
      <div className="max-w-md mx-auto p-4">
        {/* Card Tổng quan */}
        <Link
          href={`/budget?month=${selectedMonth}`}
          className="bg-white rounded-2xl p-6 shadow-lg mb-6 relative overflow-hidden hover:shadow-xl transition-all cursor-pointer block decoration-transparent"
        >
          {/* Background decoration */}
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-100 rounded-full opacity-50"></div>
          <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-green-100 rounded-full opacity-50"></div>

          <div className="relative">
            <div className="text-gray-500 text-sm mb-1 flex justify-between items-center">
              <span>Tổng ngân sách</span>
              <span className="text-xs text-blue-500 hover:underline">Chỉnh sửa ✏️</span>
            </div>
            <p className="text-4xl font-bold text-gray-800 mb-6">
              {totalBudget.toLocaleString()} đ
            </p>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Đã chi</span>
                <span
                  className={
                    percentUsed > 80
                      ? "text-red-500 font-medium"
                      : "text-green-600 font-medium"
                  }
                >
                  {percentUsed}% ({totalSpent.toLocaleString()} đ)
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    percentUsed > 80
                      ? "bg-gradient-to-r from-red-400 to-red-500"
                      : "bg-gradient-to-r from-blue-400 to-blue-500"
                  }`}
                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                />
              </div>
            </div>

            {/* Remaining */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-gray-500 text-sm">Còn lại</p>
                <p
                  className={`text-2xl font-bold ${remaining < 0 ? "text-red-500" : "text-green-600"}`}
                >
                  {remaining.toLocaleString()} đ
                </p>
              </div>
              {percentUsed > 80 && (
                <div className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                  ⚠️ Còn {100 - percentUsed}%
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Danh mục */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            📊 Chi tiết theo danh mục
          </h2>

          {categories.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Chưa có danh mục</p>
          ) : (
            <div className="space-y-4">
              {categories.map((cat) => {
                const spent = spentData[cat.id] || 0;
                const percent =
                  cat.budget > 0 ? Math.round((spent / cat.budget) * 100) : 0;
                const isOver = percent > 100;

                return (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{cat.icon}</span>
                        <span className="font-medium text-gray-700">
                          {cat.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${isOver ? "text-red-500" : "text-gray-700"}`}
                        >
                          {spent.toLocaleString()} /{" "}
                          {cat.budget.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isOver ? "bg-red-400" : "bg-blue-400"
                        }`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Giao dịch gần đây */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">
              🕐 Giao dịch gần đây
            </h2>
            <Link
              href="/history"
              className="text-blue-500 text-sm hover:underline"
            >
              Xem tất cả →
            </Link>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-gray-500">Chưa có giao dịch nào</p>
              <p className="text-gray-400 text-sm">Click + để thêm chi tiêu</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.slice(0, 5).map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{txn.categoryIcon}</span>
                    <div>
                      <p className="font-medium text-gray-800">
                        {txn.note || txn.category}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(txn.date).toLocaleDateString("vi-VN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-red-500">
                    -{txn.amount.toLocaleString()} đ
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* FAB */}
      <Link
        href="/add"
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-blue-600 hover:scale-110 transition-all active:scale-95"
      >
        +
      </Link>
    </main>
  );
}
