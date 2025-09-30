// Expenses Data
let expensesData = [
  {
    id: 1,
    date: "2024-01-10",
    description: "All-purpose flour (25 lbs)",
    category: "ingredients",
    amount: 15.99,
  },
  {
    id: 2,
    date: "2024-01-12",
    description: "Stand mixer repair",
    category: "equipment",
    amount: 85.0,
  },
  {
    id: 3,
    date: "2024-01-14",
    description: "Cake boxes (50 pieces)",
    category: "packaging",
    amount: 25.5,
  },
  {
    id: 4,
    date: "2024-01-15",
    description: "Vanilla extract (2 bottles)",
    category: "ingredients",
    amount: 12.99,
  },
  {
    id: 5,
    date: "2024-01-16",
    description: "Electricity bill",
    category: "utilities",
    amount: 45.0,
  },
  {
    id: 6,
    date: "2024-01-18",
    description: "Butter (10 lbs)",
    category: "ingredients",
    amount: 32.5,
  },
]

// Import Bootstrap
const bootstrap = window.bootstrap

// Initialize Expenses Page
function initExpenses() {
  loadExpenseSummary()
  loadExpenses()
  setupFAB()
  setupMobileNotification()
}

// Load Expense Summary
function loadExpenseSummary() {
  const container = document.getElementById("expenseSummary")

  const thisMonth = expensesData.reduce((sum, exp) => sum + exp.amount, 0)
  const ingredients = expensesData
    .filter((exp) => exp.category === "ingredients")
    .reduce((sum, exp) => sum + exp.amount, 0)
  const equipment = expensesData.filter((exp) => exp.category === "equipment").reduce((sum, exp) => sum + exp.amount, 0)

  container.innerHTML = `
    <div class="col-12 col-md-4">
      <div class="stat-card">
        <div class="stat-icon bg-danger">
          <i class="fas fa-arrow-down"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">$${thisMonth.toFixed(2)}</h3>
          <p class="stat-label">This Month</p>
        </div>
      </div>
    </div>
    <div class="col-6 col-md-4">
      <div class="stat-card">
        <div class="stat-icon bg-warning">
          <i class="fas fa-shopping-cart"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">$${ingredients.toFixed(2)}</h3>
          <p class="stat-label">Ingredients</p>
        </div>
      </div>
    </div>
    <div class="col-6 col-md-4">
      <div class="stat-card">
        <div class="stat-icon bg-info">
          <i class="fas fa-tools"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">$${equipment.toFixed(2)}</h3>
          <p class="stat-label">Equipment</p>
        </div>
      </div>
    </div>
  `
}

// Load Expenses
function loadExpenses() {
  const grid = document.getElementById("expensesGrid")

  grid.innerHTML = expensesData
    .map(
      (expense) => `
    <div class="expense-card fade-in">
      <div class="expense-header">
        <div class="expense-category">${capitalizeFirst(expense.category)}</div>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-action btn-edit" onclick="editExpense(${expense.id})" title="Edit Expense">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-action btn-delete" onclick="deleteExpense(${expense.id})" title="Delete Expense">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="expense-description">${expense.description}</div>
      <div class="expense-date">
        <i class="fas fa-calendar-alt"></i>
        ${formatDate(expense.date)}
      </div>
      <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
    </div>
  `,
    )
    .join("")
}

// Add Expense
function addExpense() {
  const newExpense = {
    id: expensesData.length + 1,
    description: document.getElementById("expenseDescription").value,
    category: document.getElementById("expenseCategory").value,
    amount: Number.parseFloat(document.getElementById("expenseAmount").value),
    date: document.getElementById("expenseDate").value,
  }

  expensesData.push(newExpense)
  loadExpenseSummary()
  loadExpenses()

  const modal = bootstrap.Modal.getInstance(document.getElementById("addExpenseModal"))
  modal.hide()
  document.getElementById("addExpenseForm").reset()

  showSuccessMessage("Expense added successfully!")
}

// Edit Expense
function editExpense(expenseId) {
  const expense = expensesData.find((e) => e.id === expenseId)
  if (expense) {
    alert(`Edit expense: ${expense.description}`)
  }
}

// Delete Expense
function deleteExpense(expenseId) {
  if (confirm("Are you sure you want to delete this expense?")) {
    expensesData = expensesData.filter((e) => e.id !== expenseId)
    loadExpenseSummary()
    loadExpenses()
    showSuccessMessage("Expense deleted successfully!")
  }
}

// Setup FAB
function setupFAB() {
  const mainFab = document.getElementById("mainFab")
  const fabMenu = document.getElementById("fabMenu")

  if (mainFab && fabMenu) {
    mainFab.addEventListener("click", () => {
      mainFab.classList.toggle("active")
      fabMenu.classList.toggle("active")
    })

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".fab-container")) {
        mainFab.classList.remove("active")
        fabMenu.classList.remove("active")
      }
    })
  }
}

// Setup Mobile Notification
function setupMobileNotification() {
  const btn = document.getElementById("mobileNotificationBtn")
  if (btn) {
    btn.addEventListener("click", () => {
      showSuccessMessage("You have 3 pending notifications!")
    })
  }
}

// Utility Functions
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function showSuccessMessage(message) {
  const alert = document.createElement("div")
  alert.className = "alert alert-success alert-dismissible fade show position-fixed"

  const isMobile = window.innerWidth < 992
  if (isMobile) {
    alert.style.cssText = "top: 4.5rem; left: 1rem; right: 1rem; z-index: 9999;"
  } else {
    alert.style.cssText = "top: 100px; right: 20px; z-index: 9999; min-width: 300px;"
  }

  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `

  document.body.appendChild(alert)

  setTimeout(() => {
    if (alert.parentNode) {
      alert.remove()
    }
  }, 3000)
}
