// Orders Data
let ordersData = []
let categoriesData = []
let userId = null
let csrf_token = null

// Utility Functions
function getUserId() {
  // Placeholder implementation
  return localStorage.getItem("userId")
}

// Import Bootstrap
const bootstrap = window.bootstrap

// Initialize Orders Page
async function initOrders(user_id_param, csrf_token_param) {
  userId = user_id_param
  csrf_token = csrf_token_param
  await loadCategories()
  await loadOrders()
  setupFilters()
  setupFAB()
  setupMobileNotification()
}

// Load Orders
async function loadOrders() {
  
  if (!userId) {
    showErrorMessage("User not logged in. Please log in.")
    return
  }

  const [success, response] = await callApi("GET", `/order-api/order-api/?user_id=${userId}`, null, csrf_token)

  if (success && response.success) {
    ordersData = response.data
    renderOrders(ordersData)
  } else {
    showErrorMessage(response.error || "Failed to load orders")
  }
}

// Load Categories
async function loadCategories() {
  
  if (!userId) return

  const [success, response] = await callApi("GET", `/order-api/category-api/?user_id=${userId}`, null, csrf_token)

  if (success && response.success) {
    categoriesData = response.data
  }
}

// Render Orders
function renderOrders(orders) {
  const ordersGrid = document.getElementById("ordersGrid")

  if (!orders || orders.length === 0) {
    ordersGrid.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
        <p class="text-muted">No orders found</p>
      </div>
    `
    return
  }

  ordersGrid.innerHTML = orders
    .map((order) => {
      // Calculate total amount from items
      const totalAmount = order.items.reduce((sum, item) => sum + Number.parseFloat(item.price || 0), 0)

      // Get items summary
      const itemsSummary = order.items.map((item) => `${item.product} (${item.quantity} ${item.unit})`).join(", ")

      return `
        <div class="order-grid-card fade-in">
          <div class="order-grid-header">
            <div class="order-grid-number">#${order.order_id}</div>
            <span class="badge bg-${getStatusColor(order.status)}">${capitalizeFirst(order.status)}</span>
          </div>
          <div class="order-grid-content">
            <h5>${itemsSummary || "No items"}</h5>
            <div class="order-grid-customer">
              <i class="fas fa-user"></i>
              ${order.customer_name}
            </div>
            ${
              order.customer_number
                ? `
              <div class="order-grid-phone">
                <i class="fas fa-phone"></i>
                ${order.customer_number}
              </div>
            `
                : ""
            }
            <div class="order-grid-due">
              <i class="fas fa-calendar-alt"></i>
              Due: ${formatDate(order.delivery)}
            </div>
            ${
              order.extra_note
                ? `
              <div class="order-grid-notes">
                <i class="fas fa-sticky-note"></i>
                ${order.extra_note}
              </div>
            `
                : ""
            }
          </div>
          <div class="order-grid-footer">
            <div class="order-grid-amount">$${totalAmount.toFixed(2)}</div>
            <div class="order-actions">
              <button class="btn btn-action btn-status" onclick="toggleOrderStatus(${order.id})" title="Toggle Status">
                <i class="fas fa-check-circle"></i>
              </button>
              <button class="btn btn-action btn-edit" onclick="editOrder(${order.id})" title="Edit Order">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-action btn-delete" onclick="deleteOrder(${order.id})" title="Delete Order">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `
    })
    .join("")
}

// Add Order
async function addOrder() {
  const customerName = document.getElementById("customerName").value
  const customerPhone = document.getElementById("customerPhone").value
  const dueDate = document.getElementById("dueDate").value
  const orderNotes = document.getElementById("orderNotes").value

  // Get order items from form
  const items = []
  const itemRows = document.querySelectorAll(".order-item-row")

  itemRows.forEach((row) => {
    const product = row.querySelector(".item-product").value
    const category = row.querySelector(".item-category").value
    const quantity = row.querySelector(".item-quantity").value
    const unit = row.querySelector(".item-unit").value
    const price = row.querySelector(".item-price").value

    if (product && quantity && price) {
      items.push({
        product,
        category,
        quantity: Number.parseInt(quantity),
        unit,
        price,
      })
    }
  })

  if (!customerName || !dueDate || items.length === 0) {
    showErrorMessage("Please fill in all required fields and add at least one item")
    return
  }

  const orderData = {
    customer_name: customerName,
    customer_number: customerPhone,
    delivery: dueDate,
    extra_note: orderNotes,
    status: "pending",
    items: items,
  }

  const [success, response] = await callApi("POST", "/order-api/order-api/", orderData, csrf_token)

  if (success && response.success) {
    await loadOrders()

    const modal = bootstrap.Modal.getInstance(document.getElementById("addOrderModal"))
    modal.hide()
    document.getElementById("addOrderForm").reset()

    // Reset order items container to single row
    const container = document.getElementById("orderItemsContainer")
    container.innerHTML = `
      <div class="order-item-row mb-2 p-3 border rounded">
        <div class="row g-2">
          <div class="col-12 col-md-3">
            <input type="text" class="form-control item-product" placeholder="Product" required>
          </div>
          <div class="col-6 col-md-2">
            <input type="text" class="form-control item-category" placeholder="Category">
          </div>
          <div class="col-6 col-md-2">
            <input type="number" class="form-control item-quantity" placeholder="Qty" required>
          </div>
          <div class="col-6 col-md-2">
            <input type="text" class="form-control item-unit" placeholder="Unit" value="pcs">
          </div>
          <div class="col-6 col-md-2">
            <input type="number" class="form-control item-price" placeholder="Price" step="0.01" required>
          </div>
          <div class="col-12 col-md-1">
            <button type="button" class="btn btn-danger btn-sm w-100" onclick="removeOrderItem(this)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `

    showSuccessMessage("Order added successfully!")
  } else {
    showErrorMessage(response.error || "Failed to add order")
  }
}

// Edit Order
async function editOrder(orderId) {
  const order = ordersData.find((o) => o.id === orderId)
  if (!order) {
    showErrorMessage("Order not found")
    return
  }

  // Populate edit modal with order data
  document.getElementById("editCustomerName").value = order.customer_name
  document.getElementById("editCustomerPhone").value = order.customer_number || ""
  document.getElementById("editDueDate").value = order.delivery.split(" ")[0]
  document.getElementById("editOrderNotes").value = order.extra_note || ""
  document.getElementById("editOrderStatus").value = order.status
  document.getElementById("editOrderId").value = order.id

  // Show edit modal
  const editModal = new bootstrap.Modal(document.getElementById("editOrderModal"))
  editModal.show()
}

// Save Order Edit
async function saveOrderEdit() {
  const orderId = document.getElementById("editOrderId").value
  const customerName = document.getElementById("editCustomerName").value
  const customerPhone = document.getElementById("editCustomerPhone").value
  const dueDate = document.getElementById("editDueDate").value
  const orderNotes = document.getElementById("editOrderNotes").value
  const status = document.getElementById("editOrderStatus").value

  const orderData = {
    customer_name: customerName,
    customer_number: customerPhone,
    delivery: dueDate,
    extra_note: orderNotes,
    status: status,
  }

  const [success, response] = await callApi("PUT", `/order-api/order-api/${orderId}/`, orderData, csrf_token)

  if (success && response.success) {
    await loadOrders()

    const modal = bootstrap.Modal.getInstance(document.getElementById("editOrderModal"))
    modal.hide()

    showSuccessMessage("Order updated successfully!")
  } else {
    showErrorMessage(response.error || "Failed to update order")
  }
}

// Delete Order
async function deleteOrder(orderId) {
  if (!confirm("Are you sure you want to delete this order?")) {
    return
  }

  const [success, response] = await callApi("DELETE", `/order-api/order-api/${orderId}/`, null, csrf_token)

  if (success && response.success) {
    await loadOrders()
    showSuccessMessage("Order deleted successfully!")
  } else {
    showErrorMessage(response.error || "Failed to delete order")
  }
}

// Toggle Order Status
async function toggleOrderStatus(orderId) {
  const order = ordersData.find((o) => o.id === orderId)
  if (!order) return

  const newStatus = order.status === "pending" ? "completed" : "pending"

  const [success, response] = await callApi("PATCH", `/order-api/order-api/${orderId}/`, { status: newStatus }, csrf_token)

  if (success && response.success) {
    await loadOrders()
    showSuccessMessage(`Order status updated to ${newStatus}!`)
  } else {
    showErrorMessage(response.error || "Failed to update order status")
  }
}

// Clear Filters
function clearFilters() {
  document.getElementById("statusFilter").value = ""
  document.getElementById("dateFilter").value = ""
  document.getElementById("searchOrders").value = ""
  loadOrders()
}

// Setup Filters
function setupFilters() {
  document.getElementById("statusFilter").addEventListener("change", filterOrders)
  document.getElementById("dateFilter").addEventListener("change", filterOrders)
  document.getElementById("searchOrders").addEventListener("input", filterOrders)
}

// Filter Orders
function filterOrders() {
  const searchTerm = document.getElementById("searchOrders").value.toLowerCase()
  const statusFilter = document.getElementById("statusFilter").value
  const dateFilter = document.getElementById("dateFilter").value

  const filtered = ordersData.filter((order) => {
    const matchesSearch =
      !searchTerm ||
      order.customer_name.toLowerCase().includes(searchTerm) ||
      order.order_id.toLowerCase().includes(searchTerm) ||
      order.items.some((item) => item.product.toLowerCase().includes(searchTerm))

    const matchesStatus = !statusFilter || order.status === statusFilter

    const orderDate = order.delivery.split(" ")[0]
    const matchesDate = !dateFilter || orderDate === dateFilter

    return matchesSearch && matchesStatus && matchesDate
  })

  renderOrders(filtered)
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

// Add Order Item Row
function addOrderItem() {
  const container = document.getElementById("orderItemsContainer")
  const newRow = document.createElement("div")
  newRow.className = "order-item-row mb-2 p-3 border rounded"
  newRow.innerHTML = `
    <div class="row g-2">
      <div class="col-12 col-md-3">
        <input type="text" class="form-control item-product" placeholder="Product" required>
      </div>
      <div class="col-6 col-md-2">
        <input type="text" class="form-control item-category" placeholder="Category">
      </div>
      <div class="col-6 col-md-2">
        <input type="number" class="form-control item-quantity" placeholder="Qty" required>
      </div>
      <div class="col-6 col-md-2">
        <input type="text" class="form-control item-unit" placeholder="Unit" value="pcs">
      </div>
      <div class="col-6 col-md-2">
        <input type="number" class="form-control item-price" placeholder="Price" step="0.01" required>
      </div>
      <div class="col-12 col-md-1">
        <button type="button" class="btn btn-danger btn-sm w-100" onclick="removeOrderItem(this)">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `
  container.appendChild(newRow)
}

// Remove Order Item Row
function removeOrderItem(button) {
  const container = document.getElementById("orderItemsContainer")
  if (container.children.length > 1) {
    button.closest(".order-item-row").remove()
  } else {
    showErrorMessage("At least one item is required")
  }
}

// Helper Functions
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
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
