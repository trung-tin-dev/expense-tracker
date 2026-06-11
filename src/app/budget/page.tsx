// app/budget/page.tsx
"use client";

import { useState, useEffect, Suspense, useRef } from "react";
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
  { id: "rent", name: "Tiền nhà", budget: 0, icon: "🏡" },
  { id: "food", name: "Tiền ăn", budget: 0, icon: "🍰" },
  { id: "misc", name: "Lặt vặt", budget: 0, icon: "🛍️" },
  { id: "savings", name: "Dự phòng", budget: 0, icon: "🧸" },
];

const emojiOptions = [
  "🏡","🍰","🛍️","🧸","🚗","🎓","💊","✈️","🎬","🏋️",
  "📱","💡","🍕","☕","🎮","📚","🐾","🌸","💄","👗",
  "🏖️","🎁","💈","🛁","🧴","🔧","🎵","🌿","🥗","🍜",
];

function BudgetContent() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const paramMonth = searchParams?.get("month");
    if (paramMonth && /^\d{4}-\d{2}$/.test(paramMonth)) {
      return paramMonth;
    }
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [totalBudget, setTotalBudget] = useState("");
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [emojiPickerOpenId, setEmojiPickerOpenId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Close month dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setEmojiPickerOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Danh sách tháng: từ 12 tháng tương lai đến 12 tháng quá khứ
  const months = Array.from({ length: 25 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + 12 - i);
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

  const handleAddCategory = () => {
    const newId = `custom_${Date.now()}`;
    const randomEmoji = emojiOptions[Math.floor(Math.random() * emojiOptions.length)];
    setCategories([
      ...categories,
      { id: newId, name: "Danh mục mới", budget: 0, icon: randomEmoji },
    ]);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id));
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
      router.push("/dashboard");
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
      <main className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-plum-600 font-semibold">Đang tải...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream-50 pb-24">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-cream-200 p-4 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href="/dashboard"
            className="w-10 h-10 bg-pink-soft hover:bg-pink-light text-plum-900 border border-pink-brand/20 rounded-full flex items-center justify-center text-lg transition-transform hover:scale-105 active:scale-95 shadow-sm"
          >
            ←
          </Link>
          <h1 className="text-lg font-extrabold text-plum-900 flex items-center gap-2">
            <span>📊</span> Thiết lập ngân sách
          </h1>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
        {/* Chọn tháng — z-30 để nổi lên trên các card bên dưới */}
        <div className="relative z-30" ref={dropdownRef}>
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-pink-glow">
            <label className="text-plum-600 text-xs font-bold tracking-wider uppercase block mb-3">
              📅 Chọn tháng thiết lập
            </label>

            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full p-4 bg-pink-soft border border-pink-brand/20 text-plum-900 font-extrabold rounded-2xl outline-none flex items-center justify-between transition-all duration-300 shadow-sm hover:bg-pink-light hover:shadow-pink-glow cursor-pointer"
            >
              <span>{months.find((m) => m.value === selectedMonth)?.label || selectedMonth}</span>
              <span className={`transition-transform duration-300 text-xs ${isDropdownOpen ? "rotate-180" : ""}`}>▼</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 right-0 mt-2 max-h-64 overflow-y-auto glass-panel border border-pink-brand/20 rounded-2xl shadow-pink-glow z-50 p-2">
                <div className="grid grid-cols-1 gap-1">
                  {months.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => {
                        setSelectedMonth(m.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
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

        {/* Tổng ngân sách */}
        <div className="relative z-10 bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-pink-glow">
          <label className="text-plum-600 text-xs font-bold tracking-wider uppercase block mb-1">
            💰 Tổng ngân sách tháng
          </label>
          <div className="flex items-center border-b-2 border-pink-brand/30 focus-within:border-pink-brand py-2 transition-colors">
            <input
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              placeholder="10,000,000"
              className="w-full text-3xl font-black bg-transparent text-plum-900 outline-none placeholder-plum-300"
            />
            <span className="text-xl font-bold text-plum-900 ml-2">đ</span>
          </div>
        </div>

        {/* Danh sách danh mục */}
        <div className="relative z-10 bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-pink-glow">
          <h2 className="font-extrabold text-plum-900 text-lg mb-6 flex items-center gap-2">
            <span>⚙️</span> Phân bổ chi tiêu cho danh mục
          </h2>

          <div className="space-y-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-3 p-4 bg-pink-soft/30 hover:bg-pink-soft/60 border border-pink-brand/10 rounded-2xl transition-colors group"
              >
                {/* Emoji button — opens emoji picker */}
                <div className="relative flex-shrink-0" ref={emojiPickerOpenId === cat.id ? emojiPickerRef : undefined}>
                  <button
                    type="button"
                    onClick={() => setEmojiPickerOpenId(emojiPickerOpenId === cat.id ? null : cat.id)}
                    className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-pink-brand/10 group-hover:scale-105 transition-transform cursor-pointer hover:border-pink-brand/40"
                    title="Đổi biểu tượng"
                  >
                    {cat.icon}
                  </button>

                  {emojiPickerOpenId === cat.id && (
                    <div className="absolute left-0 top-14 w-56 bg-white border border-pink-brand/20 rounded-2xl shadow-pink-glow z-50 p-3 grid grid-cols-6 gap-2">
                      {emojiOptions.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            handleCategoryChange(cat.id, "icon", emoji);
                            setEmojiPickerOpenId(null);
                          }}
                          className={`text-xl p-1.5 rounded-xl hover:bg-pink-soft transition-colors cursor-pointer ${cat.icon === emoji ? "bg-pink-soft ring-2 ring-pink-brand" : ""}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Name + Budget inputs */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) =>
                      handleCategoryChange(cat.id, "name", e.target.value)
                    }
                    className="w-full font-bold text-plum-900 bg-transparent outline-none mb-1 text-sm border-b border-transparent focus:border-pink-brand/30 placeholder-plum-300"
                    placeholder="Tên danh mục"
                  />
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={cat.budget}
                      onChange={(e) =>
                        handleCategoryChange(cat.id, "budget", e.target.value)
                      }
                      placeholder="0"
                      className="w-full text-xs font-semibold text-plum-600 bg-transparent outline-none placeholder-plum-300"
                    />
                    <span className="text-xs text-plum-600 ml-1">đ</span>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-plum-300 hover:bg-red-soft-bg hover:text-red-soft border border-transparent hover:border-red-soft/20 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                  title="Xóa danh mục"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Add category button */}
          <button
            type="button"
            onClick={handleAddCategory}
            className="mt-4 w-full py-3 border-2 border-dashed border-pink-brand/30 hover:border-pink-brand rounded-2xl text-pink-dark hover:text-pink-brand font-bold text-sm flex items-center justify-center gap-2 transition-all hover:bg-pink-soft/20 cursor-pointer"
          >
            ＋ Thêm danh mục mới
          </button>

          <div className="pt-6 mt-4 border-t border-pink-brand/10 flex justify-between items-center text-sm">
            <span className="text-plum-600 font-bold">Tổng số tiền đã phân bổ:</span>
            <span
              className={`font-extrabold text-base ${
                totalAllocated > parseInt(totalBudget || "0")
                  ? "text-red-soft"
                  : "text-green-soft"
              }`}
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
          className="w-full py-4 bg-pink-brand hover:bg-pink-dark text-white rounded-2xl font-bold shadow-pink-button transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:bg-plum-300 cursor-pointer"
        >
          {saving ? "Đang lưu ngân sách..." : "💾 Lưu ngân sách"}
        </button>
      </div>
    </main>
  );
}

export default function BudgetPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-plum-600 font-semibold">Đang tải...</p>
        </div>
      </main>
    }>
      <BudgetContent />
    </Suspense>
  );
}
