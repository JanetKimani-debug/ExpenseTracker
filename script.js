const descInput = document.getElementById("descInput");
const amountInput = document.getElementById("amountInput");
const typeSelect = document.getElementById("typeSelect");
const categorySelect = document.getElementById("categorySelect");

const addBtn = document.getElementById("addBtn");
const transactionList = document.getElementById("transactionList");

const incomeAmount = document.getElementById("incomeAmount");
const expenseAmount = document.getElementById("expenseAmount");
const balanceAmount = document.getElementById("balanceAmount");
const clearAllBtn = document.getElementById("clearAllBtn");

// Load saved transactions
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
render();

// Budget storage
let monthlyBudget = JSON.parse(localStorage.getItem("monthlyBudget")) || 0;

addBtn.addEventListener("click", () => {
    const desc = descInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeSelect.value;
    const category = categorySelect.value;

    if (desc === "" || amount <= 0) {
        alert("Enter valid description and amount!");
        return;
    }

    const newItem = {
        id: Date.now(),
        desc,
        amount,
        type,
        category
    };

    transactions.push(newItem);
    save();
    render();

    descInput.value = "";
    amountInput.value = "";
});

function render() {
    transactionList.innerHTML = "";
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(item => {
        const li = document.createElement("li");

        li.innerHTML = `
            <div>
                <strong>${item.desc}</strong><br>
                <small>${item.category}</small>
            </div>
            <span class="${item.type === 'income' ? 'amount-income' : 'amount-expense'}">
                ${item.type === 'income' ? '+' : '-'}KES ${item.amount}
            </span>
            <button class="delete-btn">🗑</button>
        `;

        li.querySelector(".delete-btn").addEventListener("click", () => {
            transactions = transactions.filter(t => t.id !== item.id);
            save();
            render();
        });

        transactionList.appendChild(li);

        if (item.type === "income") {
            totalIncome += item.amount;
        } else {
            totalExpense += item.amount;
        }
    });

    incomeAmount.textContent = `KES ${totalIncome}`;
expenseAmount.textContent = `KES ${totalExpense}`;
balanceAmount.textContent = `KES ${totalIncome - totalExpense}`;

// 🔥 Add this line
checkBudgetWarnings(totalExpense);

}

function save() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}
// Set Monthly Budget
document.getElementById("setMonthlyBudgetBtn").addEventListener("click", () => {
    const value = Number(document.getElementById("monthlyBudgetInput").value);

    if (value <= 0) return alert("Enter a valid monthly budget!");

    monthlyBudget = value;
    localStorage.setItem("monthlyBudget", JSON.stringify(monthlyBudget));

    renderBudgets();
});
function checkBudgetWarnings(totalExpense) {
    const warningBox = document.getElementById("budgetWarning");

    // MONTHLY budget warning
    if (monthlyBudget > 0 && totalExpense > monthlyBudget) {
        warningBox.textContent = "⚠️ You have exceeded your monthly budget!";
        warningBox.style.color = "red";
    } else {
        warningBox.textContent = "";
    }

    // CATEGORY LIMITS — SUM expenses per category
    const categoryTotals = {};

    transactions.forEach(t => {
        if (t.type === "expense") {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        }
    });

    for (const cat in categoryLimits) {
        if (categoryTotals[cat] && categoryTotals[cat] > categoryLimits[cat]) {
            alert(`⚠️ You have exceeded the limit for ${cat} category!`);
        }
    }
}


    // Category limits
    transactions
        .filter(t => t.type === "expense")
        .forEach(t => {
            if (categoryLimits[t.category] && t.amount > categoryLimits[t.category]) {
                alert(`⚠️ Category limit exceeded for ${t.category}!`);
            }
        });
}


document.getElementById("setCategoryLimitBtn").addEventListener("click", () => {
    const category = document.getElementById("limitCategorySelect").value;
    const value = Number(document.getElementById("categoryLimitInput").value);

    if (value <= 0) return alert("Enter a valid limit!");

    categoryLimits[category] = value;
    localStorage.setItem("categoryLimits", JSON.stringify(categoryLimits));

    renderBudgets();
});
function renderBudgets() {
    const box = document.getElementById("limitsList");
    box.innerHTML = "";

    const monthly = document.createElement("p");
    monthly.innerHTML = `<strong>Monthly Budget:</strong> KES ${monthlyBudget}`;
    box.appendChild(monthly);

    const catTitle = document.createElement("h4");
    catTitle.textContent = "Category Limits:";
    box.appendChild(catTitle);

    for (const c in categoryLimits) {
        const item = document.createElement("p");
        item.textContent = `${c}: KES ${categoryLimits[c]}`;
        box.appendChild(item);
    }
}

// Budget storage
let monthlyBudget = JSON.parse(localStorage.getItem("monthlyBudget")) || 0;
let categoryLimits = JSON.parse(localStorage.getItem("categoryLimits")) || {};


// Clear all
clearAllBtn.addEventListener("click", () => {
    if (confirm("Clear all transactions?")) {
        transactions = [];
        save();
        render();
    }
});

