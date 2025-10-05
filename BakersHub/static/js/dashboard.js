// Dashboard Data
let dashboardData = null
let dashboard_url = null
let csrf_token = null
const currentFilters = {
  filter_type: "this_month",
  start_date: null,
  end_date: null,
}

// Initialize Dashboard
async function initDashboard(dashboard_url_param, csrf_token_param) {
  dashboard_url = dashboard_url_param
  csrf_token = csrf_token_param

  await loadDashboardData()
}

// Load Dashboard Data
async function loadDashboardData() {
  // Build query parameters based on current filters
  let queryParams = `?filter_type=${currentFilters.filter_type}`

  if (currentFilters.filter_type === "custom_range" && currentFilters.start_date && currentFilters.end_date) {
    queryParams += `&start_date=${currentFilters.start_date}&end_date=${currentFilters.end_date}`
  }
  const [success, response] = await callApi("GET", `${dashboard_url}${queryParams}`, null, csrf_token)

  if (success && response.success) {
    dashboardData = response.data
    console.log(dashboardData)
    updateKPIs()
    loadRecentOrders()
    loadRecentExpenses()
  } else {
    showErrorMessage(response.error || "Failed to load dashboard data")
  }
}

// Update KPI Cards
function updateKPIs() {
  if (!dashboardData) return

  const totalProfit = dashboardData.total_profit || 0
  const completedSalesCount = dashboardData.total_completed_sales || 0
  const totalSales = dashboardData.total_sales || 0
  const totalExpenses = dashboardData.total_expenses || 0

  // Update profit with color based on positive/negative
  const profitElement = document.getElementById("totalProfit")
  profitElement.textContent = `₹${totalProfit.toFixed(2)}`

  // Change color based on profit/loss
  const profitCard = profitElement.closest(".stat-card")
  const profitIcon = profitCard.querySelector(".stat-icon")
  if (totalProfit < 0) {
    profitIcon.classList.remove("bg-success")
    profitIcon.classList.add("bg-danger")
    profitElement.style.color = "#dc3545"
  } else {
    profitIcon.classList.remove("bg-danger")
    profitIcon.classList.add("bg-success")
    profitElement.style.color = ""
  }

  document.getElementById("completedSalesCount").textContent = completedSalesCount
  document.getElementById("totalSales").textContent = `₹${totalSales.toFixed(2)}`
  document.getElementById("totalExpenses").textContent = `₹${totalExpenses.toFixed(2)}`
}

// Load Recent Orders
function loadRecentOrders() {
  const container = document.getElementById("recentOrdersContainer")

  if (!dashboardData || !dashboardData.order_data || dashboardData.order_data.length === 0) {
    container.innerHTML = `
      <div class="text-center py-4">
        <i class="fas fa-inbox fa-2x text-muted mb-2"></i>
        <p class="text-muted mb-0">No recent orders</p>
      </div>
    `
    return
  }

  const orders = dashboardData.order_data

    const orderCards = orders
    .map((order, index) => {
      // Calculate total amount
      const totalAmount = order.items.reduce((sum, item) => sum + Number.parseFloat(item.price || 0), 0)

      // Items list
      const itemsList = order.items
        .map(
          (item) => `
        <div class="order-grid-item">
          <div class="order-item-info">
            <span class="order-item-name">
              <b>${item.product}</b> 
              <small class="text-muted">(${item.quantity} ${item.unit})</small>
            </span>
          </div>
          <div class="order-item-price">₹${Number.parseFloat(item.price || 0).toFixed(2)}</div>
        </div><hr class="my-1">
      `,
        )
        .join("")

      const orderIndex = dashboardData.order_data.findIndex((o) => o.id === order.id)
      return `
      <div class="order-grid-card mb-2">
        <div class="order-grid-header">
          <div class="order-grid-number">
            ${dashboardData.order_data.length - orderIndex}) ${order.customer_name}
            <div class="order-total">
              Total - <span class="order-grid-amount">₹${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div class="order-grid-items">
          ${itemsList || "<em>No items</em>"}
        </div>

        <div class="order-grid-details">
          ${
            order.customer_number
              ? `<div class="order-grid-customer">
                  <i class="fas fa-phone"></i>
                  <a style="color: var(--golden-brown);" href="tel:${order.customer_number}">
                    ${order.customer_number}
                  </a>
                </div>`
              : ""
          }

          <div class="order-grid-due">
            <i class="fas fa-calendar-alt"></i>
            ${formatDate(order.delivery)}
          </div>

          ${
            order.extra_note
              ? `<div class="order-grid-note">
                  <i class="fas fa-sticky-note"></i>
                  ${order.extra_note}
                </div>`
              : ""
          }
        </div>

        <div class="order-grid-footer">
          <span class="badge bg-${getStatusColor(order.status)}" id="status-badge-${order.id}">
            ${capitalizeFirst(order.status)}
          </span>
          <div class="order-actions">
        ${
          order.status === "pending"
            ? `<button class="btn-action btn-status" onclick="toggleOrderStatus(${order.id})" title="Toggle Status">
       <i class="fas fa-check-circle"></i>
     </button>`
            : ""
        }
            <button class="btn-action btn-edit" onclick="editOrder(${order.id})" title="Edit Order">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-action btn-delete" onclick="deleteOrder(${order.id})" title="Delete Order">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `
    })
    .join("")

  container.innerHTML += orderCards

}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace("-", " ")
}

function getStatusColor(status) {
  const colors = {
    pending: "info",
    "in-progress": "warning",
    completed: "success",
    cancelled: "danger",
  }
  return colors[status] || "secondary"
}

// Load Recent Expenses
function loadRecentExpenses() {
  const container = document.getElementById("recentExpensesContainer")

  if (!dashboardData || !dashboardData.expenses_data || dashboardData.expenses_data.length === 0) {
    container.innerHTML = `
      <div class="text-center py-4">
        <i class="fas fa-inbox fa-2x text-muted mb-2"></i>
        <p class="text-muted mb-0">No recent expenses</p>
      </div>
    `
    return
  }

  const expenses = dashboardData.expenses_data.slice(0, 5)

  container.innerHTML = expenses
    .map((expense) => {
      return `
      <div class="expense-card mb-3">
        <div class="expense-header">
          <span class="expense-category">${getCategoryLabel(expense.expense_category)}</span>
        </div>
        <div class="expense-description">${expense.expense_name}</div>
        <div class="expense-meta">
          <span><i class="fas fa-box"></i> ${expense.expense_quantity} ${expense.expense_unit}</span>
          <span><i class="fas fa-calendar-alt"></i> ${formatDate(expense.created_at)}</span>
        </div>
        ${expense.extra_note ? `<div class="expense-date"><i class="fas fa-sticky-note"></i> ${expense.extra_note}</div>` : ""}
        <div class="expense-amount">₹${Number.parseFloat(expense.expense_amount).toFixed(2)}</div>
      </div>
    `
    })
    .join("")
}

// Handle Period Change
function handlePeriodChange() {
  const periodFilter = document.getElementById("periodFilter").value
  const startDateContainer = document.getElementById("startDateContainer")
  const endDateContainer = document.getElementById("endDateContainer")

  if (periodFilter === "custom_range") {
    startDateContainer.style.display = "block"
    endDateContainer.style.display = "block"
  } else {
    startDateContainer.style.display = "none"
    endDateContainer.style.display = "none"
  }
}

// Apply Filters
async function applyFilters() {
  const periodFilter = document.getElementById("periodFilter").value

  currentFilters.filter_type = periodFilter

  if (periodFilter === "custom_range") {
    const startDate = document.getElementById("startDateFilter").value
    const endDate = document.getElementById("endDateFilter").value

    if (!startDate || !endDate) {
      showErrorMessage("Please select both start and end dates")
      return
    }

    currentFilters.start_date = startDate
    currentFilters.end_date = endDate
  } else {
    currentFilters.start_date = null
    currentFilters.end_date = null
  }

  toggle_loader()
  await loadDashboardData()
  toggle_loader()
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

// Utility Functions
function capitalizeFirst(str) {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function formatDate(dateString) {
  if (!dateString) return "N/A"
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
