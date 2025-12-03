// Elements
const descInput = document.getElementById("descInput");
const amountInput = document.getElementById("amountInput");
const typeSelect = document.getElementById("typeSelect");
const categorySelect = document.getElementById("categorySelect");
const dateInput = document.getElementById("dateInput");
const addBtn = document.getElementById("addBtn");
const transactionList = document.getElementById("transactionList");
const incomeAmount = document.getElementById("incomeAmount");
const expenseAmount = document.getElementById("expenseAmount");
const balanceAmount = document.getElementById("balanceAmount");
const clearAllBtn = document.getElementById("clearAllBtn");
const monthlyChartCanvas = document.getElementById("monthlyChart");
const categoryPieCanvas = document.getElementById("categoryPie");
const monthlyBudgetInput = document.getElementById("monthlyBudgetInput");
const setMonthlyBudgetBtn = document.getElementById("setMonthlyBudgetBtn");
const limitCategorySelect = document.getElementById("limitCategorySelect");
const categoryLimitInput = document.getElementById("categoryLimitInput");
const setCategoryLimitBtn = document.getElementById("setCategoryLimitBtn");
const limitsList = document.getElementById("limitsList");
const budgetWarning = document.getElementById("budgetWarning");

// Setup date default = today
if (!dateInput.value) {
  const today = new Date().toISOString().substr(0, 10);
  dateInput.value = today;
}

// Load saved data
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let monthlyBudget = JSON.parse(localStorage.getItem("monthlyBudget")) || null;
let categoryLimits = JSON.parse(localStorage.getItem("categoryLimits")) || {}; // { category: limit }

// Charts
let monthlyChart = null;
let categoryPie = null;

// Render on load
render();

// Add new transaction
addBtn.addEventListener("click", () => {
  const desc = descInput.value.trim();
  const amount = Number(amountInput.value);
  const type = typeSelect.value;
  const category = categorySelect.value;
  const dateStr = dateInput.value || new Date().toISOString().substr(0,10);

  if (desc === "" || !amount || amount <= 0) {
    alert("Enter valid description and amount!");
    return;
  }

  const newItem = {
    id: Date.now(),
    desc,
    amount,
    type,
    category,
    date: dateStr
  };

  transactions.push(newItem);
  save();
  render();

  descInput.value = "";
  amountInput.value = "";
});

// Save
function save() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("monthlyBudget", JSON.stringify(monthlyBudget));
  localStorage.setItem("categoryLimits", JSON.stringify(categoryLimits));
}

// Render everything
function render() {
  renderList();
  renderSummary();
  renderCharts();
  renderLimitsUI();
  checkBudgets();
}

// Render transaction list
function renderList() {
  transactionList.innerHTML = "";
  transactions.slice().reverse().forEach(item => {
    const li = document.createElement("li");

    const left = document.createElement("div");
    left.className = "tx-left";

    const info = document.createElement("div");
    info.className = "tx-info";
    const strong = document.createElement("strong");
    strong.textContent = item.desc;
    const small = document.createElement("small");
    small.textContent = `${item.category} • ${item.date}`;
    info.appendChild(strong);
    info.appendChild(small);

    const categoryTag = document.createElement("span");
    categoryTag.className = "tx-category";
    categoryTag.textContent = item.category;

    left.appendChild(info);
    left.appendChild(categoryTag);

    const amountSpan = document.createElement("span");
    amountSpan.className = item.type === "income" ? "amount-income" : "amount-expense";
    amountSpan.textContent = `${item.type === 'income' ? '+' : '-'}KES ${item.amount}`;

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "🗑";
    delBtn.addEventListener("click", () => {
      if (!confirm("Delete this transaction?")) return;
      transactions = transactions.filter(t => t.id !== item.id);
      save();
      render();
    });

    li.appendChild(left);
    li.appendChild(amountSpan);
    li.appendChild(delBtn);
    transactionList.appendChild(li);
  });
}

// Render income/expense/balance
function renderSummary() {
  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach(t => {
    if (t.type === "income") totalIncome += Number(t.amount);
    else totalExpense += Number(t.amount);
  });

  incomeAmount.textContent = `KES ${totalIncome}`;
  expenseAmount.textContent = `KES ${totalExpense}`;
  balanceAmount.textContent = `KES ${totalIncome - totalExpense}`;
}

// Render charts
function renderCharts() {
  const lastMonths = getLastNMonths(6); // [{key:'2025-06', label:'Jun 2025'}, ...]
  const incomeData = [];
  const expenseData = [];

  lastMonths.forEach(m => {
    const [year, month] = m.key.split("-");
    const monthTotals = transactions.filter(t => {
      return t.date && t.date.startsWith(m.key);
    });
    let inc = 0, exp = 0;
    monthTotals.forEach(t => {
      if (t.type === "income") inc += Number(t.amount);
      else exp += Number(t.amount);
    });
    incomeData.push(inc);
    expenseData.push(exp);
  });

  // Monthly line chart (income vs expense)
  const labels = lastMonths.map(m => m.label);
  if (monthlyChart) monthlyChart.destroy();
  monthlyChart = new Chart(monthlyChartCanvas.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Income", data: incomeData, borderColor: "#2ecc71", backgroundColor: "transparent", tension:0.3 },
        { label: "Expense", data: expenseData, borderColor: "#e74c3c", backgroundColor: "transparent", tension:0.3 }
      ]
    },
    options: { responsive:true, maintainAspectRatio:false }
  });

  // Pie chart by category (expenses only)
  const categorySums = {};
  transactions.forEach(t => {
    if (t.type === "expense") {
      categorySums[t.category] = (categorySums[t.category] || 0) + Number(t.amount);
    }
  });
  const pieLabels = Object.keys(categorySums);
  const pieData = pieLabels.map(k => categorySums[k]);

  if (categoryPie) categoryPie.destroy();
  categoryPie = new Chart(categoryPieCanvas.getContext("2d"), {
    type: "pie",
    data: {
      labels: pieLabels,
      datasets: [{ data: pieData, backgroundColor: generateColors(pieLabels.length) }]
    },
    options: { responsive:true, maintainAspectRatio:false }
  });
}

// Utilities: last N months keys
function getLastNMonths(n) {
  const result = [];
  const now = new Date();
  for (let i = n-1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; // YYYY-MM
    const label = d.toLocaleString(undefined, { month: "short", year: "numeric" });
    result.push({ key, label });
  }
  return result;
}

// Generate colors for pie
function generateColors(n) {
  const base = ["#3498db","#9b59b6","#f1c40f","#e67e22","#2ecc71","#e74c3c","#34495e"];
  const out = [];
  for (let i=0;i<n;i++) out.push(base[i % base.length]);
  return out;
}

// Budget limits UI
function renderLimitsUI() {
  // Monthly
  if (monthlyBudget) {
    limitsList.innerHTML = `<div>Monthly budget: KES ${monthlyBudget}</div>`;
  } else {
    limitsList.innerHTML = `<div>No monthly budget set</div>`;
  }

  // Per-category
  const keys = Object.keys(categoryLimits);
  if (keys.length) {
    const rows = keys.map(k => `<div>${k}: KES ${categoryLimits[k]}</div>`).join("");
    limitsList.innerHTML += `<div style="margin-top:6px">${rows}</div>`;
  }
}

// Set monthly budget
setMonthlyBudgetBtn.addEventListener("click", () => {
  const val = Number(monthlyBudgetInput.value);
  if (!val || val <=0) { alert("Enter valid monthly budget"); return; }
  monthlyBudget = val;
  save();
  renderLimitsUI();
  checkBudgets();
  monthlyBudgetInput.value = "";
});

// Set per-category limit
setCategoryLimitBtn.addEventListener("click", () => {
  const cat = limitCategorySelect.value;
  const val = Number(categoryLimitInput.value);
  if (!val || val <= 0) { alert("Enter valid category limit"); return; }
  categoryLimits[cat] = val;
  save();
  renderLimitsUI();
  checkBudgets();
  categoryLimitInput.value = "";
});

// Check budgets and show warnings
function checkBudgets() {
  budgetWarning.textContent = "";

  // Check monthly (current month)
  const nowKey = new Date().toISOString().substr(0,7); // YYYY-MM
  const currentMonthExpenses = transactions
    .filter(t => t.type === "expense" && t.date && t.date.startsWith(nowKey))
    .reduce((s,t) => s + Number(t.amount), 0);

  if (monthlyBudget && currentMonthExpenses > monthlyBudget) {
    budgetWarning.textContent = `Warning: You exceeded monthly budget by KES ${currentMonthExpenses - monthlyBudget}`;
  } else if (monthlyBudget) {
    const remaining = monthlyBudget - currentMonthExpenses;
    budgetWarning.textContent = `Monthly budget remaining: KES ${remaining}`;
  }

  // Per-category (current month)
  Object.keys(categoryLimits).forEach(cat => {
    const catSum = transactions
      .filter(t => t.type==='expense' && t.category===cat && t.date && t.date.startsWith(nowKey))
      .reduce((s,t)=>s+Number(t.amount),0);
    if (catSum > categoryLimits[cat]) {
      budgetWarning.textContent += ` • ${cat}: exceeded by KES ${catSum - categoryLimits[cat]}`;
    }
  });
}

// Clear all
clearAllBtn.addEventListener("click", () => {
  if (!confirm("Clear all transactions?")) return;
  transactions = [];
  save();
  render();
});

// Helpers: human-friendly
function formatKES(n) {
  return `KES ${n}`;
}

