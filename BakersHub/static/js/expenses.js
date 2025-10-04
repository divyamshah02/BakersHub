// Expenses Data
let expensesData = []
let displayedExpensesCount = 0 // Declare displayedExpensesCount variable

let expense_url = null
let user_profile_url = null
let csrf_token = null
let userId = null
let userData = null // Declare userData variable

const EXPENSES_PER_PAGE = 6 // Number of expenses to load per page

// Import Bootstrap
const bootstrap = window.bootstrap

// Initialize Expenses Page
async function initExpenses(expense_url_param, user_profile_url_param, csrf_token_param, user_id_param = null) {
  expense_url = expense_url_param
  user_profile_url = user_profile_url_param
  csrf_token = csrf_token_param

  if (user_id_param == null) {
    await getUserInfo()
  } else {
    userId = user_id_param
  }

  await loadExpenses()
  setupFilters()
  setupFAB()
  setupMobileNotification()
}

// Get User Info
async function getUserInfo() {
  const [success, response] = await callApi("GET", `${user_profile_url}`, null, csrf_token)
  if (success && response.success) {
    userData = response.data
    userId = userData.user.user_id
  } else {
    showErrorMessage(response.error || "Failed to get user info")
  }
}

// Load Expenses
async function loadExpenses() {
  if (!userId) {
    showErrorMessage("User not logged in. Please log in.")
    return
  }

  const [success, response] = await callApi("GET", `${expense_url}?user_id=${userId}`, null, csrf_token)

  if (success && response.success) {
    expensesData = response.data
    const expensesGrid = document.getElementById("expensesGrid")
    expensesGrid.innerHTML = ""

    if (displayedExpensesCount > EXPENSES_PER_PAGE) {
      renderExpenses(expensesData.slice(0, displayedExpensesCount))
    } else {
      renderExpenses(expensesData.slice(0, EXPENSES_PER_PAGE))
      displayedExpensesCount = Math.min(EXPENSES_PER_PAGE, expensesData.length)
    }

    updateLoadMoreButton()
    updateTotalExpensesCount(expensesData.length)
    loadExpenseSummary()
  } else {
    showErrorMessage(response.error || "Failed to load expenses")
  }
}

// Load Expense Summary
function loadExpenseSummary() {
  const container = document.getElementById("expenseSummary")

  // Calculate totals
  const thisMonth = expensesData.reduce((sum, exp) => sum + Number.parseFloat(exp.expense_amount || 0), 0)
  const rawMaterial = expensesData
    .filter((exp) => exp.expense_category === "raw_material")
    .reduce((sum, exp) => sum + Number.parseFloat(exp.expense_amount || 0), 0)
  const packaging = expensesData
    .filter((exp) => exp.expense_category === "packaging")
    .reduce((sum, exp) => sum + Number.parseFloat(exp.expense_amount || 0), 0)

  container.innerHTML = `
    <div class="col-12 col-md-4">
      <div class="stat-card">
        <div class="stat-icon bg-danger">
          <i class="fas fa-arrow-down"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">₹${thisMonth.toFixed(2)}</h3>
          <p class="stat-label">Total Expenses</p>
        </div>
      </div>
    </div>
    <div class="col-6 col-md-4">
      <div class="stat-card">
        <div class="stat-icon bg-warning">
          <i class="fas fa-shopping-cart"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">₹${rawMaterial.toFixed(2)}</h3>
          <p class="stat-label">Raw Material</p>
        </div>
      </div>
    </div>
    <div class="col-6 col-md-4">
      <div class="stat-card">
        <div class="stat-icon bg-info">
          <i class="fas fa-box"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">₹${packaging.toFixed(2)}</h3>
          <p class="stat-label">Packaging</p>
        </div>
      </div>
    </div>
  `
}

// Render Expenses
function renderExpenses(expenses) {
  const grid = document.getElementById("expensesGrid")

  updateTotalExpensesCount(expensesData.length)

  if (!expenses || expenses.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
        <p class="text-muted">No expenses found</p>
      </div>
    `
    return
  }

  const expenseCards = expenses
    .map((expense) => {
      const expenseIndex = expensesData.findIndex((e) => e.id === expense.id)
      return `
        <div class="expense-card fade-in">
          <div class="expense-header">
            <div class="row align-items-center">
              <div class="col-8 d-flex align-items-center">
                <span class="expense-category">
                  ${expensesData.length - expenseIndex}) ${getCategoryLabel(expense.expense_category)}
                </span>
              </div>
              <div class="col-4 d-flex justify-content-end align-items-center">
                <div class="btn-group btn-group-xs">
                  <button class="btn btn-action-sm btn-edit btn-sm" onclick="editExpense(${expense.id})" title="Edit Expense">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-action-sm btn-delete" onclick="deleteExpense(${expense.id})" title="Delete Expense">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>                      
          </div>
          <!-- Expense Name -->
          <div class="expense-description">${expense.expense_name}</div>

          <!-- ✅ Date + Qty in one line -->
          <div class="expense-meta">
            <span><i class="fas fa-box"></i> ${expense.expense_quantity} ${expense.expense_unit}</span>
            <span><i class="fas fa-calendar-alt"></i> ${formatDate(expense.created_at)}</span>
          </div>

          <!-- Extra Note -->
          ${expense.extra_note ? `<div class="expense-date"><i class="fas fa-sticky-note"></i> ${expense.extra_note}</div>` : ""}

          <!-- ✅ View Bill as full-width outline button -->
          ${
            expense.expense_bill
              ? `<a href="${expense.expense_bill}" target="_blank" class="view-bill-btn">View Bill</a>`
              : ""
          }

          <div class="expense-amount">₹${Number.parseFloat(expense.expense_amount).toFixed(2)}</div>    
        </div>
      `
    })
    .join("")

  grid.innerHTML += expenseCards
}

// Add Expense
async function addExpense() {
  const expenseName = document.getElementById("expenseName").value
  const expenseCategory = document.getElementById("expenseCategory").value
  const expenseAmount = document.getElementById("expenseAmount").value
  const expenseQuantity = document.getElementById("expenseQuantity").value
  const expenseUnit = document.getElementById("expenseUnit").value
  const expenseNote = document.getElementById("expenseNote").value
  const expenseBill = document.getElementById("expenseBill").files[0]

  if (!expenseName || !expenseCategory || !expenseAmount || !expenseQuantity || !expenseUnit) {
    showErrorMessage("Please fill in all required fields")
    return
  }

  const formData = new FormData()
  formData.append("user_id", userId)
  formData.append("expense_name", expenseName)
  formData.append("expense_category", expenseCategory)
  formData.append("expense_amount", expenseAmount)
  formData.append("expense_quantity", expenseQuantity)
  formData.append("expense_unit", expenseUnit)
  if (expenseNote) formData.append("extra_note", expenseNote)
  if (expenseBill) formData.append("expense_bill", expenseBill)

  const [success, response] = await callApi("POST", expense_url, formData, csrf_token, true)

  if (success && response.success) {
    await loadExpenses()

    const modal = bootstrap.Modal.getInstance(document.getElementById("addExpenseModal"))
    modal.hide()
    document.getElementById("addExpenseForm").reset()

    showSuccessMessage("Expense added successfully!")
  } else {
    showErrorMessage(response.error || "Failed to add expense")
  }
}

// Edit Expense
async function editExpense(expenseId) {
  const expense = expensesData.find((e) => e.id === expenseId)
  if (!expense) {
    showErrorMessage("Expense not found")
    return
  }

  // Populate edit modal
  document.getElementById("editExpenseId").value = expense.id
  document.getElementById("editExpenseName").value = expense.expense_name
  document.getElementById("editExpenseCategory").value = expense.expense_category
  document.getElementById("editExpenseAmount").value = expense.expense_amount
  document.getElementById("editExpenseQuantity").value = expense.expense_quantity
  document.getElementById("editExpenseUnit").value = expense.expense_unit
  document.getElementById("editExpenseNote").value = expense.extra_note || ""

  // Show current bill info
  const billInfo = document.getElementById("currentBillInfo")
  if (expense.expense_bill) {
    billInfo.innerHTML = `Current: <a href="${expense.expense_bill}" target="_blank">View Bill</a>`
  } else {
    billInfo.innerHTML = ""
  }

  // Show edit modal
  const editModal = new bootstrap.Modal(document.getElementById("editExpenseModal"))
  editModal.show()
}

// Save Expense Edit
async function saveExpenseEdit() {
  const expenseId = document.getElementById("editExpenseId").value
  const expenseName = document.getElementById("editExpenseName").value
  const expenseCategory = document.getElementById("editExpenseCategory").value
  const expenseAmount = document.getElementById("editExpenseAmount").value
  const expenseQuantity = document.getElementById("editExpenseQuantity").value
  const expenseUnit = document.getElementById("editExpenseUnit").value
  const expenseNote = document.getElementById("editExpenseNote").value
  const expenseBill = document.getElementById("editExpenseBill").files[0]

  if (!expenseName || !expenseCategory || !expenseAmount || !expenseQuantity || !expenseUnit) {
    showErrorMessage("Please fill in all required fields")
    return
  }

  const formData = new FormData()
  formData.append("user_id", userId)
  formData.append("expense_name", expenseName)
  formData.append("expense_category", expenseCategory)
  formData.append("expense_amount", expenseAmount)
  formData.append("expense_quantity", expenseQuantity)
  formData.append("expense_unit", expenseUnit)
  if (expenseNote) formData.append("extra_note", expenseNote)
  if (expenseBill) formData.append("expense_bill", expenseBill)

  const [success, response] = await callApi("PUT", `${expense_url}${expenseId}/`, formData, csrf_token, true)

  if (success && response.success) {
    await loadExpenses()

    const modal = bootstrap.Modal.getInstance(document.getElementById("editExpenseModal"))
    modal.hide()

    showSuccessMessage("Expense updated successfully!")
  } else {
    showErrorMessage(response.error || "Failed to update expense")
  }
}

// Delete Expense
async function deleteExpense(expenseId) {
  if (!confirm("Are you sure you want to delete this expense?")) {
    return
  }

  const [success, response] = await callApi("DELETE", `${expense_url}${expenseId}/`, null, csrf_token)

  if (success && response.success) {
    await loadExpenses()
    showSuccessMessage("Expense deleted successfully!")
  } else {
    showErrorMessage(response.error || "Failed to delete expense")
  }
}

// Setup Filters
function setupFilters() {
  document.getElementById("categoryFilter").addEventListener("change", filterExpenses)
  document.getElementById("startDateFilter").addEventListener("change", filterExpenses)
  document.getElementById("endDateFilter").addEventListener("change", filterExpenses)
  document.getElementById("searchExpenses").addEventListener("input", filterExpenses)
}

// Filter Expenses
function filterExpenses() {
  const searchTerm = document.getElementById("searchExpenses").value.toLowerCase()
  const categoryFilter = document.getElementById("categoryFilter").value
  const startDate = document.getElementById("startDateFilter").value
  const endDate = document.getElementById("endDateFilter").value

  const filtered = expensesData.filter((expense) => {
    const matchesSearch =
      !searchTerm ||
      expense.expense_name.toLowerCase().includes(searchTerm) ||
      expense.expense_id.toLowerCase().includes(searchTerm) ||
      (expense.extra_note && expense.extra_note.toLowerCase().includes(searchTerm))

    const matchesCategory = !categoryFilter || expense.expense_category === categoryFilter

    const expenseDate = new Date(expense.created_at).toLocaleDateString("en-CA")
    const matchesStartDate = !startDate || expenseDate >= startDate
    const matchesEndDate = !endDate || expenseDate <= endDate

    return matchesSearch && matchesCategory && matchesStartDate && matchesEndDate
  })

  displayedExpensesCount = 0
  const expensesGrid = document.getElementById("expensesGrid")
  expensesGrid.innerHTML = ""
  renderExpenses(filtered.slice(0, EXPENSES_PER_PAGE))
  displayedExpensesCount = Math.min(EXPENSES_PER_PAGE, filtered.length)

  // Update expensesData temporarily for pagination
  const originalData = expensesData
  expensesData = filtered
  updateLoadMoreButton()
  loadExpenseSummary()
  expensesData = originalData
}

// Clear Filters
function clearFilters() {
  document.getElementById("categoryFilter").value = ""
  document.getElementById("startDateFilter").value = ""
  document.getElementById("endDateFilter").value = ""
  document.getElementById("searchExpenses").value = ""
  loadExpenses()
}

// Load More Expenses
function loadMoreExpenses() {
  const nextBatch = expensesData.slice(displayedExpensesCount, displayedExpensesCount + EXPENSES_PER_PAGE)
  renderExpenses(nextBatch)
  displayedExpensesCount += EXPENSES_PER_PAGE
  updateLoadMoreButton()
}

// Update Load More Button
function updateLoadMoreButton() {
  const loadMoreContainer = document.getElementById("loadMoreContainer")
  if (displayedExpensesCount < expensesData.length) {
    loadMoreContainer.style.display = "block"
  } else {
    loadMoreContainer.style.display = "none"
  }
}

// Toggle Filters
function toggleFilters() {
  const filtersCard = document.getElementById("filtersCard")
  const toggleBtn = document.getElementById("toggleFiltersBtn")

  if (filtersCard.style.display === "none") {
    filtersCard.style.display = "block"
    toggleBtn.innerHTML = '<i class="fas fa-times"></i>'
  } else {
    filtersCard.style.display = "none"
    toggleBtn.innerHTML = '<i class="fas fa-filter"></i>'
  }
}

// Update Total Expenses Count
function updateTotalExpensesCount(count) {
  const totalExpensesCount = document.getElementById("totalExpensesCount")
  if (totalExpensesCount) {
    totalExpensesCount.textContent = count
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

function getCategoryLabel(category) {
  const labels = {
    raw_material: "Raw Material",
    packaging: "Packaging",
    transport: "Transport",
    misc: "Miscellaneous",
  }
  return labels[category] || category
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

function showErrorMessage(message) {
  const alert = document.createElement("div")
  alert.className = "alert alert-danger alert-dismissible fade show position-fixed"

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
