// Dashboard Data
const dashboardData = {
  stats: {
    monthlyRevenue: 1245,
    activeOrders: 23,
    lowStock: 5,
    dueToday: 3,
  },
  recentOrders: [
    {
      id: "001",
      customer: "Sarah Johnson",
      items: "Chocolate Birthday Cake",
      amount: 85.0,
      date: "Dec 15",
      status: "completed",
    },
    {
      id: "002",
      customer: "Mike Chen",
      items: "Vanilla Cupcakes (24)",
      amount: 48.0,
      date: "Dec 16",
      status: "baking",
    },
    {
      id: "003",
      customer: "Emma Davis",
      items: "Wedding Cake (3-tier)",
      amount: 350.0,
      date: "Dec 20",
      status: "ordered",
    },
  ],
  pantryAlerts: [
    {
      name: "All-Purpose Flour",
      remaining: "2 lbs remaining",
      status: "low",
    },
    {
      name: "Pure Vanilla Extract",
      remaining: "1 bottle remaining",
      status: "critical",
    },
    {
      name: "Unsalted Butter",
      remaining: "3 lbs remaining",
      status: "low",
    },
  ],
}

// Initialize Dashboard
function initDashboard() {
  loadStats()
  loadRecentOrders()
  loadPantryAlerts()
  setupMobileNotification()
}

// Load Stats Cards
function loadStats() {
  const statsContainer = document.getElementById("statsContainer")
  const stats = [
    {
      icon: "fa-dollar-sign",
      color: "success",
      value: `$${dashboardData.stats.monthlyRevenue}`,
      label: "This Month",
    },
    {
      icon: "fa-cubes",
      color: "info",
      value: dashboardData.stats.activeOrders,
      label: "Active Orders",
    },
    {
      icon: "fa-exclamation-triangle",
      color: "warning",
      value: dashboardData.stats.lowStock,
      label: "Low Stock",
    },
    {
      icon: "fa-clock",
      color: "danger",
      value: dashboardData.stats.dueToday,
      label: "Due Today",
    },
  ]

  statsContainer.innerHTML = stats
    .map(
      (stat) => `
    <div class="col-6 col-lg-3">
      <div class="stat-card">
        <div class="stat-icon bg-${stat.color}">
          <i class="fas ${stat.icon}"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">${stat.value}</h3>
          <p class="stat-label">${stat.label}</p>
        </div>
      </div>
    </div>
  `,
    )
    .join("")
}

// Load Recent Orders
function loadRecentOrders() {
  const container = document.getElementById("recentOrdersContainer")

  container.innerHTML = dashboardData.recentOrders
    .map((order) => {
      const statusColors = {
        completed: "success",
        baking: "warning",
        ordered: "info",
      }

      return `
      <div class="order-card">
        <div class="order-card-header">
          <div class="order-number">#${order.id}</div>
          <span class="badge bg-${statusColors[order.status]}">${capitalizeFirst(order.status)}</span>
        </div>
        <div class="order-details">
          <h6 class="order-title">${order.items}</h6>
          <p class="customer-name"><i class="fas fa-user"></i> ${order.customer}</p>
          <div class="order-footer">
            <span class="order-amount">$${order.amount.toFixed(2)}</span>
            <span class="order-date">${order.date}</span>
          </div>
        </div>
      </div>
    `
    })
    .join("")
}

// Load Pantry Alerts
function loadPantryAlerts() {
  const container = document.getElementById("pantryAlertsContainer")

  container.innerHTML = dashboardData.pantryAlerts
    .map((alert) => {
      const badgeColor = alert.status === "critical" ? "danger" : "warning"

      return `
      <div class="alert-item">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <div class="fw-semibold">${alert.name}</div>
            <small class="text-muted">${alert.remaining}</small>
          </div>
          <span class="badge bg-${badgeColor}">${capitalizeFirst(alert.status)}</span>
        </div>
      </div>
    `
    })
    .join("")
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
