export function calculateBudgetSummary(
  totalBudget: number,
  spentByCategory: Record<string, number>,
) {
  const totalSpent = Object.values(spentByCategory).reduce(
    (sum, amount) => sum + amount,
    0,
  );
  const remaining = totalBudget - totalSpent;
  const percentUsed =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return { totalSpent, remaining, percentUsed };
}

export function calculateCategoryUsage(spent: number, budget: number) {
  const percent = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  return { percent, isOver: percent > 100 };
}

export function sumCategoryBudgets(
  categories: { budget: number | string }[],
) {
  return categories.reduce(
    (sum, cat) => sum + (parseInt(String(cat.budget)) || 0),
    0,
  );
}
