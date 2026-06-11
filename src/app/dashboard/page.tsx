"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
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
} from "firebase/firestore";
import { db } from "../firebase";

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
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const months = Array.from({ length: 25 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + 12 - i);
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleString("vi-VN", { month: "long", year: "numeric" }),
    };
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (loading || !user) {
      if (!loading && !user) {
        setChecking(false);
      }
      return;
    }

    async function fetchData() {
      setChecking(true);

      try {
        const month = selectedMonth;

        const budgetDoc = await getDoc(
          doc(db, "budgets", `${user!.uid}_${month}`),
        );
        if (budgetDoc.exists()) {
          const data = budgetDoc.data();
          setTotalBudget(data.totalBudget);
          setCategories(data.categories);
        } else {
          setTotalBudget(0);
          setCategories([]);
        }

        const txnQuery = query(
          collection(db, "transactions"),
          where("userId", "==", user!.uid),
          orderBy("date", "desc"),
        );

        const txnSnapshot = await getDocs(txnQuery);
        const txns: Transaction[] = [];
        const spent: { [key: string]: number } = {};

        txnSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.date && data.date.startsWith(month)) {
            txns.push({
              id: docSnap.id,
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
      } catch (error) {
        console.error("Firestore error:", error);
        setTotalBudget(0);
        setCategories([]);
        setTransactions([]);
        setSpentData({});
      } finally {
        setChecking(false);
      }
    }

    fetchData();
  }, [user, loading, selectedMonth]);

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

  if (!user) {
    return null;
  }

  const totalSpent = Object.values(spentData).reduce((a, b) => a + b, 0);
  const remaining = totalBudget - totalSpent;
  const percentUsed =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <main className="min-h-screen bg-cream-50 pb-24">
      <header className="bg-white/70 backdrop-blur-md border-b border-cream-200 p-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-plum-900 flex items-center gap-2">
              <span>🌸</span> Blossom Budget
            </h1>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-xs md:text-sm font-extrabold bg-pink-soft hover:bg-pink-light text-plum-900 rounded-full px-4 py-2 border border-pink-brand/20 transition-all duration-300 shadow-sm flex items-center gap-1.5 cursor-pointer hover:shadow-pink-glow"
              >
                <span>📅 {months.find(m => m.value === selectedMonth)?.label || selectedMonth}</span>
                <span className={`transition-transform duration-300 text-[10px] ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-60 max-h-60 overflow-y-auto glass-panel border border-pink-brand/20 rounded-2xl shadow-pink-glow z-40 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 gap-1">
                    {months.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => {
                          setSelectedMonth(m.value);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                          m.value === selectedMonth
                            ? "bg-pink-brand text-white shadow-sm"
                            : "text-plum-900 hover:bg-pink-soft"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <Link
            href="/settings"
            className="w-10 h-10 bg-pink-soft hover:bg-pink-light text-plum-900 border border-pink-brand/20 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-plum-900">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <Link
              href={`/budget?month=${selectedMonth}`}
              className="relative overflow-hidden bg-gradient-to-br from-cream-100 to-pink-soft border border-pink-light rounded-3xl p-8 shadow-pink-glow block hover:shadow-[0_12px_40px_rgba(242,155,155,0.25)] hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="absolute -right-10 -top-10 w-36 h-36 bg-pink-brand/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-cream-300/30 rounded-full blur-xl" />

              <div className="relative z-10">
                <div className="text-plum-600 text-xs font-bold tracking-wider uppercase mb-1 flex justify-between items-center">
                  <span>Tổng ngân sách tháng</span>
                  <span className="text-xs text-pink-dark font-semibold group-hover:underline flex items-center gap-1">
                    Cập nhật ✏️
                  </span>
                </div>
                <p className="text-4xl font-black text-plum-900 mb-6 tracking-tight">
                  {totalBudget.toLocaleString()} <span className="text-2xl font-semibold">đ</span>
                </p>

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-plum-600 font-medium">Đã chi tiêu</span>
                    <span
                      className={`font-semibold ${
                        percentUsed > 80 ? "text-red-soft" : "text-green-soft"
                      }`}
                    >
                      {percentUsed}% ({totalSpent.toLocaleString()} đ)
                    </span>
                  </div>
                  <div className="h-4 bg-white/60 border border-white/80 rounded-full overflow-hidden p-[2px]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentUsed > 80
                          ? "bg-gradient-to-r from-red-soft to-[#e88d9c]"
                          : "bg-gradient-to-r from-pink-brand to-pink-dark"
                      }`}
                      style={{ width: `${Math.min(percentUsed, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-pink-brand/10">
                  <div>
                    <p className="text-plum-600 text-xs font-bold tracking-wider uppercase mb-0.5">Số dư còn lại</p>
                    <p
                      className={`text-2xl font-black ${
                        remaining < 0 ? "text-red-soft" : "text-green-soft"
                      }`}
                    >
                      {remaining.toLocaleString()} đ
                    </p>
                  </div>
                  {percentUsed > 80 && (
                    <div className="px-4 py-1.5 bg-red-soft-bg text-red-soft border border-red-soft/20 rounded-full text-xs font-bold animate-pulse">
                      ⚠️ Sắp hết hạn mức (Còn {100 - percentUsed}%)
                    </div>
                  )}
                </div>
              </div>
            </Link>

            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-pink-glow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-extrabold text-plum-900 text-lg flex items-center gap-2">
                  <span>📊</span> Phân bổ theo danh mục
                </h2>
                <Link
                  href={`/budget?month=${selectedMonth}`}
                  className="text-pink-dark hover:text-pink-brand text-xs font-bold hover:underline"
                >
                  Thiết lập hạn mức
                </Link>
              </div>

              {categories.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-plum-100 rounded-2xl bg-cream-50/50">
                  <p className="text-plum-300 text-3xl mb-2">🌸</p>
                  <p className="text-plum-600 font-medium">Chưa có danh mục nào được lập</p>
                  <p className="text-plum-600 text-xs mt-1">Bấm vào Thẻ Ngân sách phía trên để bắt đầu thiết lập</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {categories.map((cat) => {
                    const spent = spentData[cat.id] || 0;
                    const percent =
                      cat.budget > 0 ? Math.round((spent / cat.budget) * 100) : 0;
                    const isOver = percent > 100;

                    return (
                      <div key={cat.id} className="group">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2.5">
                            <span className="w-9 h-9 bg-pink-soft rounded-xl flex items-center justify-center text-lg shadow-sm border border-pink-brand/10 group-hover:scale-110 transition-transform">
                              {cat.icon}
                            </span>
                            <span className="font-bold text-plum-900 text-sm">
                              {cat.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-sm font-bold ${
                                isOver ? "text-red-soft" : "text-plum-900"
                              }`}
                            >
                              {spent.toLocaleString()} <span className="text-xs text-plum-600 font-normal">/ {cat.budget.toLocaleString()} đ</span>
                            </p>
                          </div>
                        </div>
                        <div className="h-2.5 bg-cream-200 rounded-full overflow-hidden p-[1px] border border-white">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isOver
                                ? "bg-gradient-to-r from-red-soft to-[#e88d9c]"
                                : "bg-gradient-to-r from-pink-brand to-[#e9b8b8]"
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
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="hidden lg:block bg-gradient-to-br from-white to-pink-soft rounded-3xl p-6 border border-white/60 shadow-pink-glow text-center">
              <h3 className="font-extrabold text-plum-900 mb-2">Thêm chi tiêu mới</h3>
              <p className="text-plum-600 text-xs mb-4">Ghi chép giao dịch nhanh chóng giúp kiểm soát ví của bạn tốt hơn</p>
              <Link
                href="/add"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 w-full bg-pink-brand hover:bg-pink-dark text-white rounded-2xl font-bold shadow-pink-button transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              >
                <span>➕</span> Thêm giao dịch
              </Link>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-pink-glow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-extrabold text-plum-900 text-lg flex items-center gap-2">
                  <span>🕐</span> Giao dịch gần đây
                </h2>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-plum-100 rounded-2xl bg-cream-50/50">
                  <div className="text-4xl mb-3 animate-bounce">📝</div>
                  <p className="text-plum-900 font-bold text-sm">Chưa có giao dịch nào</p>
                  <p className="text-plum-600 text-xs mt-1">Bấm nút cộng bên dưới để ghi nhận chi tiêu</p>
                </div>
              ) : (
                <div className="divide-y divide-cream-200">
                  {transactions.slice(0, 8).map((txn) => (
                    <div
                      key={txn.id}
                      className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 hover:bg-pink-soft/30 rounded-xl px-2 -mx-2 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 bg-cream-200 rounded-full flex items-center justify-center text-xl shadow-sm border border-white">
                          {txn.categoryIcon}
                        </span>
                        <div>
                          <p className="font-bold text-plum-900 text-sm">
                            {txn.note || txn.category}
                          </p>
                          <p className="text-[11px] font-semibold text-plum-600 mt-0.5">
                            {new Date(txn.date).toLocaleDateString("vi-VN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-red-soft text-sm">
                        -{txn.amount.toLocaleString()} đ
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Link
        href="/add"
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-pink-brand hover:bg-pink-dark text-white rounded-full shadow-pink-button flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all duration-300 z-30"
      >
        ➕
      </Link>
    </main>
  );
}
