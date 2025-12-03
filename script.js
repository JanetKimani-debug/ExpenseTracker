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
}

function save() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Clear all
clearAllBtn.addEventListener("click", () => {
    if (confirm("Clear all transactions?")) {
        transactions = [];
        save();
        render();
    }
});




