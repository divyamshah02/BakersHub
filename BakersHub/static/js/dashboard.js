// Dashboard Data
let dashboardData = null
let dashboard_url = null
let csrf_token = null
const currentFilters = {
  filter_type: "this_month",
  start_date: null,
  end_date: null,
}

let notifications = []
const currentCalendarDate = new Date()
let selectedDate = null
let tasks = []
const pickerDate = new Date()

// Initialize Dashboard
async function initDashboard(dashboard_url_param, csrf_token_param) {
  dashboard_url = dashboard_url_param
  csrf_token = csrf_token_param

  await loadDashboardData()
  setupFAB()
  initializeNotifications()
  initializeNotificationBell()
  initializeCalendar()
  initializeTasks()
  checkFirstLogin()
}

function checkFirstLogin() {
  const urlParams = new URLSearchParams(window.location.search)
  const isFirstLogin = urlParams.get("is_first_login")

  if (isFirstLogin === "TRUE") {
    setTimeout(() => {
      const duration = 3000
      const end = Date.now() + duration

      const colors = ["#A57C55", "#8B6F47", "#ffd700", "#ff6b6b", "#4ecdc4"]
      ;(function frame() {
        window.confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        })
        window.confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      })()
    }, 500)

    addNotification({
      title: "Welcome to Bakers Hub!",
      message: "Your journey to better bookkeeping starts here. Explore the dashboard to track your baking business.",
      type: "success",
      time: "Just now",
      unread: true,
    })
  }
}

function initializeNotificationBell() {
  const notificationBell = document.getElementById("notificationBell")
  const notificationDropdown = document.getElementById("notificationDropdown")

  notificationBell.style.display = "block"
  notificationBell.style.position = "fixed"
  notificationBell.style.top = "20px"
  notificationBell.style.right = "20px"
  notificationBell.style.zIndex = "1000"

  notificationBell.addEventListener("click", (e) => {
    e.stopPropagation()
    notificationDropdown.classList.toggle("show")
  })

  document.addEventListener("click", (e) => {
    if (!notificationBell.contains(e.target)) {
      notificationDropdown.classList.remove("show")
    }
  })
}

function initializeNotifications() {
  notifications = [
    {
      id: 1,
      title: "New Order Received",
      message: "Snehi Shah placed an order for Strawberry cake worth ₹2800",
      type: "success",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      title: "Payment Reminder",
      message: "Order #1234 payment is pending from Rahul Kumar",
      type: "warning",
      time: "5 hours ago",
      unread: true,
    },
    {
      id: 3,
      title: "Low Stock Alert",
      message: "Butter stock is running low. Only 500g remaining.",
      type: "warning",
      time: "1 day ago",
      unread: false,
    },
    {
      id: 4,
      title: "Order Completed",
      message: "Order #1230 has been successfully delivered to Priya Sharma",
      type: "info",
      time: "2 days ago",
      unread: false,
    },
  ]

  renderNotifications()
}

function renderNotifications() {
  const container = document.getElementById("notificationDropdownBody")
  const badge = document.getElementById("notificationBellBadge")
  const unreadCount = notifications.filter((n) => n.unread).length

  badge.textContent = unreadCount
  badge.style.display = unreadCount > 0 ? "block" : "none"

  if (notifications.length === 0) {
    container.innerHTML = `
      <div class="notification-empty">
        <i class="fas fa-bell-slash"></i>
        <p>No notifications yet</p>
      </div>
    `
    return
  }

  container.innerHTML = notifications
    .map(
      (notification) => `
    <div class="notification-item ${notification.unread ? "unread" : ""} ${notification.type}">
      <div class="notification-item-header">
        <div class="notification-item-title">${notification.title}</div>
        <span class="notification-item-time">${notification.time}</span>
      </div>
      <div class="notification-item-message">${notification.message}</div>
    </div>
  `,
    )
    .join("")
}

function addNotification(notification) {
  notifications.unshift({
    id: Date.now(),
    ...notification,
  })
  renderNotifications()
}

function markAllAsRead() {
  notifications = notifications.map((n) => ({ ...n, unread: false }))
  renderNotifications()
  showSuccessMessage("All notifications marked as read")
}

// Load Dashboard Data
async function loadDashboardData() {
  let queryParams = `?filter_type=${currentFilters.filter_type}`

  if (currentFilters.filter_type === "custom_range" && currentFilters.start_date && currentFilters.end_date) {
    queryParams += `&start_date=${currentFilters.start_date}&end_date=${currentFilters.end_date}`
  }
  const [success, response] = await window.callApi("GET", `${dashboard_url}${queryParams}`, null, csrf_token)

  if (success && response.success) {
    dashboardData = response.data
    document.getElementById("month-content").innerText = dashboardData.period_label
    updateKPIs() // Assuming updateKPIs is a function that needs to be defined
    updateMotivationCard()
    loadRecentOrders()
    loadRecentExpenses()
  } else {
    showErrorMessage(response.error || "Failed to load dashboard data")
  }
}

function updateKPIs() {
  // Placeholder for updateKPIs function
  console.log("Updating KPIs")
}

function updateMotivationCard() {
  if (!dashboardData) return

  const motivationContainer = document.getElementById("motivationCard")
  const totalProfit = dashboardData.total_profit || 0
  const completedSales = dashboardData.total_completed_sales || 0
  const periodLabel = dashboardData.period_label || "this period"

  let message = ""
  let emoji = ""

  if (totalProfit > 10000) {
    message = `Amazing! You made <span class="highlight">₹${totalProfit.toFixed(0)}</span> profit ${periodLabel.toLowerCase()}!`
    emoji = "🎉"
  } else if (totalProfit > 5000) {
    message = `Great work! You earned <span class="highlight">₹${totalProfit.toFixed(0)}</span> profit ${periodLabel.toLowerCase()}.`
    emoji = "👏"
  } else if (totalProfit > 0) {
    message = `Keep going! You made <span class="highlight">₹${totalProfit.toFixed(0)}</span> profit ${periodLabel.toLowerCase()}.`
    emoji = "💪"
  } else if (totalProfit < 0) {
    message = `Don't worry! Focus on reducing expenses. You're learning and growing.`
    emoji = "📈"
  } else {
    message = `Start strong! Add your first order to track your progress.`
    emoji = "🚀"
  }

  if (completedSales > 0 || totalProfit !== 0) {
    motivationContainer.style.display = "block"
    motivationContainer.innerHTML = `
      <div class="motivation-card">
        <h4>${emoji} ${completedSales > 0 ? `${completedSales} orders completed!` : "Your Progress"}</h4>
        <p>${message}</p>
      </div>
    `
  } else {
    motivationContainer.style.display = "none"
  }
}

function loadRecentOrders() {
  const container = document.getElementById("recentOrdersContainer")
  container.innerHTML = ""
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
      const totalAmount = order.items.reduce((sum, item) => sum + Number.parseFloat(item.price || 0), 0)

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

function loadRecentExpenses() {
  const container = document.getElementById("recentExpensesContainer")
  container.innerHTML = ""
  if (!dashboardData || !dashboardData.expenses_data || dashboardData.expenses_data.length === 0) {
    container.innerHTML = `
      <div class="text-center py-4">
        <i class="fas fa-inbox fa-2x text-muted mb-2"></i>
        <p class="text-muted mb-0">No recent expenses</p>
      </div>
    `
    return
  }

  const expenses = dashboardData.expenses_data

  container.innerHTML = expenses
    .map((expense) => {
      const expenseIndex = expenses.findIndex((e) => e.id === expense.id)
      return `
      <div class="expense-card fade-in">
          <div class="expense-header">
            <div class="row align-items-center">
              <div class="col-12 d-flex align-items-center">
                <span class="expense-category">
                  ${expenses.length - expenseIndex}) ${getCategoryLabel(expense.expense_category)}
                </span>
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
              ? `<a onclick="openDoc('${expense.expense_bill}', 'Bill')" class="view-bill-btn">View Bill</a>`
              : ""
          }

          <div class="expense-amount">₹${Number.parseFloat(expense.expense_amount).toFixed(2)}</div>    
        </div>
    `
    })
    .join("")
}

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

  window.toggle_loader()
  await loadDashboardData()
  window.toggle_loader()
}

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

function initializeCalendar() {
  renderCalendar()
}

function renderCalendar() {
  const grid = document.getElementById("calendarGrid")
  const monthYear = document.getElementById("calendarMonthYear")

  const year = currentCalendarDate.getFullYear()
  const month = currentCalendarDate.getMonth()

  monthYear.textContent = currentCalendarDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  let html = ""

  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  dayHeaders.forEach((day) => {
    html += `<div class="calendar-day-header">${day}</div>`
  })

  for (let i = 0; i < firstDay; i++) {
    html += `<div class="calendar-date other-month"></div>`
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateString = formatDateString(date)
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    const isSelected = selectedDate && dateString === formatDateString(selectedDate)
    const hasTask = tasks.some((task) => task.date === dateString)

    let classes = "calendar-date"
    if (isToday) classes += " today"
    if (isSelected) classes += " selected"
    if (hasTask) classes += " has-task"

    html += `<div class="${classes}" onclick="selectDate('${dateString}')">${day}</div>`
  }

  grid.innerHTML = html
}

function formatDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function previousMonth() {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1)
  renderCalendar()
}

function nextMonth() {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1)
  renderCalendar()
}

function selectDate(dateString) {
  selectedDate = new Date(dateString + "T00:00:00")
  renderCalendar()
  displayTasksForDate(dateString)
}

function displayTasksForDate(dateString) {
  const tasksDisplay = document.getElementById("tasksDisplay")
  const tasksDisplayTitle = document.getElementById("tasksDisplayTitle")
  const tasksDisplayContent = document.getElementById("tasksDisplayContent")

  const dateTasks = tasks.filter((task) => task.date === dateString)
  const formattedDate = new Date(dateString + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  tasksDisplayTitle.textContent = `Tasks for ${formattedDate}`
  tasksDisplay.style.display = "block"

  if (dateTasks.length === 0) {
    tasksDisplayContent.innerHTML = `
      <div class="no-tasks">
        <p>No tasks for this date</p>
        <button class="add-task-btn" onclick="openTaskModal('${dateString}')">
          <i class="fas fa-plus"></i> Add Task
        </button>
      </div>
    `
  } else {
    tasksDisplayContent.innerHTML = dateTasks
      .map(
        (task) => `
      <div class="task-item">
        <div class="task-item-content">
          <div class="task-item-title">${task.title}</div>
          ${task.description ? `<div class="task-item-date">${task.description}</div>` : ""}
        </div>
        <div class="task-item-actions">
          <button onclick="deleteTask(${task.id})" title="Delete task">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `,
      )
      .join("")
  }
}

function initializeTasks() {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  tasks = [
    {
      id: 1,
      title: "Deliver cake to Snehi Shah",
      description: "Strawberry cake - 1kg",
      date: formatDateString(today),
    },
    {
      id: 2,
      title: "Buy raw materials",
      description: "Butter, flour, sugar",
      date: formatDateString(tomorrow),
    },
    {
      id: 3,
      title: "Prepare order for Priya",
      description: "Chocolate cookies - 2 dozen",
      date: formatDateString(nextWeek),
    },
  ]

  selectedDate = today
  renderCalendar()
  displayTasksForDate(formatDateString(today))
}

function openTaskModal(preSelectedDate = null) {
  const modal = document.getElementById("taskModal")
  const taskForm = document.getElementById("taskForm")

  taskForm.reset()

  if (preSelectedDate) {
    const date = new Date(preSelectedDate + "T00:00:00")
    document.getElementById("taskDate").value = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    document.getElementById("taskDate").dataset.dateValue = preSelectedDate
  }

  modal.classList.add("show")
}

function closeTaskModal() {
  const modal = document.getElementById("taskModal")
  modal.classList.remove("show")

  const datePickerDropdown = document.getElementById("datePickerDropdown")
  datePickerDropdown.classList.remove("show")
}

function saveTask(event) {
  event.preventDefault()

  const title = document.getElementById("taskTitle").value
  const dateInput = document.getElementById("taskDate")
  const dateValue = dateInput.dataset.dateValue
  const description = document.getElementById("taskDescription").value

  if (!title || !dateValue) {
    showErrorMessage("Please fill in all required fields")
    return
  }

  const newTask = {
    id: Date.now(),
    title: title,
    description: description,
    date: dateValue,
  }

  tasks.push(newTask)
  renderCalendar()

  if (selectedDate && formatDateString(selectedDate) === dateValue) {
    displayTasksForDate(dateValue)
  }

  closeTaskModal()
  showSuccessMessage("Task added successfully!")
}

function deleteTask(taskId) {
  if (confirm("Are you sure you want to delete this task?")) {
    tasks = tasks.filter((task) => task.id !== taskId)
    renderCalendar()

    if (selectedDate) {
      displayTasksForDate(formatDateString(selectedDate))
    }

    showSuccessMessage("Task deleted successfully!")
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const taskDateInput = document.getElementById("taskDate")
  const datePickerDropdown = document.getElementById("datePickerDropdown")

  if (taskDateInput) {
    taskDateInput.addEventListener("click", (e) => {
      e.stopPropagation()
      datePickerDropdown.classList.toggle("show")
      if (datePickerDropdown.classList.contains("show")) {
        renderDatePicker()
      }
    })
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".custom-date-picker")) {
      datePickerDropdown.classList.remove("show")
    }
  })
})

function renderDatePicker() {
  const grid = document.getElementById("pickerCalendarGrid")
  const monthYear = document.getElementById("pickerMonthYear")

  const year = pickerDate.getFullYear()
  const month = pickerDate.getMonth()

  monthYear.textContent = pickerDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  let html = ""

  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  dayHeaders.forEach((day) => {
    html += `<div class="calendar-day-header">${day}</div>`
  })

  for (let i = 0; i < firstDay; i++) {
    html += `<div class="calendar-date other-month"></div>`
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateString = formatDateString(date)
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()

    let classes = "calendar-date"
    if (isToday) classes += " today"

    html += `<div class="${classes}" onclick="selectDateInPicker('${dateString}')">${day}</div>`
  }

  grid.innerHTML = html
}

function selectDateInPicker(dateString) {
  const date = new Date(dateString + "T00:00:00")
  const taskDateInput = document.getElementById("taskDate")

  taskDateInput.value = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  taskDateInput.dataset.dateValue = dateString

  const datePickerDropdown = document.getElementById("datePickerDropdown")
  datePickerDropdown.classList.remove("show")
}

function previousMonthPicker() {
  pickerDate.setMonth(pickerDate.getMonth() - 1)
  renderDatePicker()
}

function nextMonthPicker() {
  pickerDate.setMonth(pickerDate.getMonth() + 1)
  renderDatePicker()
}
