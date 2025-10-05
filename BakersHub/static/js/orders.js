// Orders Data
let ordersData = []
let categoriesData = []

let order_url = null
let category_url = null
let user_profile_url = null
let csrf_token = null

let displayedOrdersCount = 0
const ORDERS_PER_PAGE = 3 // Change this value to load different number of orders (e.g., 5, 10, 50)

// Import Bootstrap
const bootstrap = window.bootstrap

// Initialize Orders Page
async function initOrders(
  order_url_param,
  category_url_param,
  user_profile_url_param,
  csrf_token_param
) {
  order_url = order_url_param
  category_url = category_url_param
  user_profile_url = user_profile_url_param
  csrf_token = csrf_token_param
  
  await loadCategories()
  await loadOrders()
  setupFilters()
  setupFAB()
  setupMobileNotification()
}

async function getUserInfo() {
  const [success, response] = await callApi("GET", `${user_profile_url}`, null, csrf_token)
  if (success && response.success) {
    userData = response.data
  } else {
    showErrorMessage(response.error || "Failed to user info")
  }
}

// Load Orders
async function loadOrders() {
  const [success, response] = await callApi("GET", `${order_url}`, null, csrf_token)

  if (success && response.success) {
    ordersData = response.data
    const ordersGrid = document.getElementById("ordersGrid")
    ordersGrid.innerHTML = ""
    if (displayedOrdersCount > ORDERS_PER_PAGE) {
      renderOrders(ordersData.slice(0, displayedOrdersCount))
    } else {
      renderOrders(ordersData.slice(0, ORDERS_PER_PAGE))
      displayedOrdersCount = Math.min(ORDERS_PER_PAGE, ordersData.length)
    }
    updateLoadMoreButton()
    updateTotalOrdersCount(ordersData.length)
    loadOrdersSummary()
  } else {
    showErrorMessage(response.error || "Failed to load orders")
  }
}

// Load Categories
async function loadCategories() {
  const [success, response] = await callApi("GET", `${category_url}`, null, csrf_token)

  if (success && response.success) {
    categoriesData = response.data
  }
}

// Render Orders
function renderOrders(orders) {
  const ordersGrid = document.getElementById("ordersGrid")

  updateTotalOrdersCount(ordersData.length)

  if (!orders || orders.length === 0) {
    ordersGrid.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
        <p class="text-muted">No orders found</p>
      </div>
    `
    return
  }

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

      const orderIndex = ordersData.findIndex((o) => o.id === order.id)
      return `
      <div class="order-grid-card">
        <div class="order-grid-header">
          <div class="order-grid-number">
            ${ordersData.length - orderIndex}) ${order.customer_name}
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

  ordersGrid.innerHTML += orderCards
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

  const [success, response] = await callApi("POST", order_url, orderData, csrf_token)

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

  // Format datetime for datetime-local input
  const deliveryDate = new Date(order.delivery)
  const formattedDate = deliveryDate.toISOString().slice(0, 16)
  document.getElementById("editDueDate").value = formattedDate

  document.getElementById("editOrderNotes").value = order.extra_note || ""
  document.getElementById("editOrderStatus").value = order.status
  document.getElementById("editOrderId").value = order.id

  const itemsContainer = document.getElementById("editOrderItemsContainer")
  itemsContainer.innerHTML = ""

  if (order.items && order.items.length > 0) {
    order.items.forEach((item, index) => {
      const itemRow = createEditOrderItemRow(item, index)
      itemsContainer.appendChild(itemRow)
    })
  } else {
    // Add one empty row if no items
    const itemRow = createEditOrderItemRow()
    itemsContainer.appendChild(itemRow)
  }

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

  // Get order items from edit form
  const items = []
  const itemRows = document.querySelectorAll("#editOrderItemsContainer .order-item-row")

  itemRows.forEach((row) => {
    const product = row.querySelector(".item-product").value
    const item_id = row.querySelector(".item-id").value
    const is_active = row.querySelector(".item-is_active").value
    const category = row.querySelector(".item-category").value
    const quantity = row.querySelector(".item-quantity").value
    const unit = row.querySelector(".item-unit").value
    const price = row.querySelector(".item-price").value

    if (product && quantity && price) {
      items.push({
        item_id,
        is_active,
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
    status: status,
    items: items,
  }

  const [success, response] = await callApi("PUT", `${order_url}${orderId}/`, orderData, csrf_token)

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

  const [success, response] = await callApi("DELETE", `${order_url}${orderId}/`, null, csrf_token)

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

  const [success, response] = await callApi("PATCH", `${order_url}${orderId}/`, { status: newStatus }, csrf_token)

  if (success && response.success) {
    // await loadOrders()
    const status_badge = document.getElementById(`status-badge-${orderId}`)
    status_badge.className = `badge bg-${getStatusColor(newStatus)}`
    status_badge.innerHTML = `${capitalizeFirst(newStatus)}`
    ordersData.find((o) => o.id == orderId).status = newStatus
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

    const orderDate = new Date(order.delivery).toLocaleDateString("en-CA")
    const matchesDate = !dateFilter || orderDate === dateFilter

    return matchesSearch && matchesStatus && matchesDate
  })

  displayedOrdersCount = 0
  const ordersGrid = document.getElementById("ordersGrid")
  ordersGrid.innerHTML = ""
  renderOrders(filtered.slice(0, ORDERS_PER_PAGE))
  displayedOrdersCount = Math.min(ORDERS_PER_PAGE, filtered.length)

  // Update ordersData temporarily for pagination
  const originalData = ordersData
  ordersData = filtered
  updateLoadMoreButton()
  loadOrdersSummary()
  ordersData = originalData
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
  const total_rows = document.querySelectorAll(".order-item-row").length
  newRow.innerHTML = `
    <div class="row g-2">
      <div class="col-12 col-md-3">
          <label class="form-label" style="font-size: 12px;">${total_rows + 1}) Product Name</label>
          <input type="text" class="form-control item-product" placeholder="Product" required>
      </div>
      <div class="col-6 col-md-2">
          <label class="form-label" style="font-size: 12px;">Category</label>
          <input type="text" class="form-control item-category" placeholder="Category">
      </div>
      <div class="col-6 col-md-2">
          <label class="form-label" style="font-size: 12px;">Quantity</label>                                            
          <input type="number" class="form-control item-quantity" placeholder="Qty" required>
      </div>
      <div class="col-6 col-md-2">
          <label class="form-label" style="font-size: 12px;">Unit</label>
          <select class="form-control item-unit">
              <option value="pcs" selected>Pcs</option>
              <option value="Kg">Kg</option>
              <option value="Gram">Gram</option>
              <option value="MG">MG</option>
              <option value="Piece">Piece</option>                                                
              <option value="Pound">Pound</option>
              <option value="Ounce">Ounce</option>
              <option value="Litre">Litre</option>
              <option value="ML">ML</option>
              <option value="Dozen">Dozen</option>
              <option value="Pack">Pack</option>
              <option value="Box">Box</option>
          </select>
      </div>
      <div class="col-6 col-md-2">
          <label class="form-label" style="font-size: 12px;">Price</label>
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

function createEditOrderItemRow(item = null, index = null) {
  const newRow = document.createElement("div")
  newRow.className = "order-item-row mb-2 p-3 border rounded"
  if (index == null) {
    index = document.querySelectorAll(".order-item-row").length - 1
  }
  newRow.innerHTML = `
    <div class="row g-2">
      <div class="col-12 col-md-3">
        <label class="form-label" style="font-size: 12px;">${index + 1}) Product Name</label>
        <input type="text" class="form-control item-product" placeholder="Product" value="${item?.product || ""}" required>
        <input type="hidden" class="item-id" value="${item?.id || ""}" required>
        <input type="hidden" class="item-is_active" value="${item?.is_active == null ? "true" : item.is_active}" required>
      </div>
      <div class="col-6 col-md-2">
        <label class="form-label" style="font-size: 12px;">Category</label>
        <input type="text" class="form-control item-category" placeholder="Category" value="${item?.category || ""}">
      </div>
      <div class="col-6 col-md-2">
        <label class="form-label" style="font-size: 12px;">Quantity</label>                                            
        <input type="number" class="form-control item-quantity" placeholder="Qty" value="${item?.quantity || ""}" required>
      </div>
      <div class="col-6 col-md-2">
        <label class="form-label" style="font-size: 12px;">Unit</label>
        <select class="form-control item-unit">
          <option value="pcs" ${item?.unit === "pcs" ? "selected" : ""}>Pcs</option>
          <option value="Kg" ${item?.unit === "Kg" ? "selected" : ""}>Kg</option>
          <option value="Gram" ${item?.unit === "Gram" ? "selected" : ""}>Gram</option>
          <option value="MG" ${item?.unit === "MG" ? "selected" : ""}>MG</option>
          <option value="Piece" ${item?.unit === "Piece" ? "selected" : ""}>Piece</option>
          <option value="Pound" ${item?.unit === "Pound" ? "selected" : ""}>Pound</option>
          <option value="Ounce" ${item?.unit === "Ounce" ? "selected" : ""}>Ounce</option>
          <option value="Litre" ${item?.unit === "Litre" ? "selected" : ""}>Litre</option>
          <option value="ML" ${item?.unit === "ML" ? "selected" : ""}>ML</option>
          <option value="Dozen" ${item?.unit === "Dozen" ? "selected" : ""}>Dozen</option>
          <option value="Pack" ${item?.unit === "Pack" ? "selected" : ""}>Pack</option>
          <option value="Box" ${item?.unit === "Box" ? "selected" : ""}>Box</option>
        </select>
      </div>
      <div class="col-6 col-md-2">
        <label class="form-label" style="font-size: 12px;">Price</label>
        <input type="number" class="form-control item-price" placeholder="Price" step="0.01" value="${item?.price || ""}" required>
      </div>
      <div class="col-12 col-md-1">
        <button type="button" class="btn btn-danger btn-sm w-100" onclick="removeEditOrderItem(this)">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `
  return newRow
}

function addEditOrderItem() {
  const container = document.getElementById("editOrderItemsContainer")
  const newRow = createEditOrderItemRow()
  container.appendChild(newRow)
}

function removeEditOrderItem(button) {
  const container = document.getElementById("editOrderItemsContainer")
  if (container.children.length > 1) {
    // button.closest(".order-item-row").remove()

    const row = button.closest(".order-item-row") // Find the row of the clicked delete button
    const isActiveInput = row.querySelector(".item-is_active") // Get the is_active input for this row

    // Set is_active to false
    isActiveInput.value = "false"

    // Hide the row instead of removing it
    row.style.display = "none"
  } else {
    showErrorMessage("At least one item is required")
  }
}

function loadMoreOrders() {
  const nextBatch = ordersData.slice(displayedOrdersCount, displayedOrdersCount + ORDERS_PER_PAGE)
  renderOrders(nextBatch)
  displayedOrdersCount += ORDERS_PER_PAGE
  updateLoadMoreButton()
}

function updateLoadMoreButton() {
  const loadMoreContainer = document.getElementById("loadMoreContainer")
  if (displayedOrdersCount < ordersData.length) {
    loadMoreContainer.style.display = "block"
  } else {
    loadMoreContainer.style.display = "none"
  }
}

// Helper Functions
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

function updateTotalOrdersCount(count) {
  const totalOrdersCount = document.getElementById("totalOrdersCount")
  if (totalOrdersCount) {
    totalOrdersCount.textContent = count
  }
}

function loadOrdersSummary() {
  let totalAmount = 0
  let pendingCount = 0
  let completedCount = 0

  ordersData.forEach((order) => {
    // Calculate total amount for this order
    const orderTotal = order.items.reduce((sum, item) => {
      console.log(item)
      return order.status === 'completed' 
        ? sum + Number.parseFloat(item.price || 0)
        : sum
    }, 0)

    totalAmount += orderTotal

    // Count by status
    if (order.status === "pending") {
      pendingCount++
    } else if (order.status === "completed") {
      completedCount++
    }
  })

  // Update summary cards
  document.getElementById("totalOrdersAmount").textContent = `₹${totalAmount.toFixed(2)}`
  document.getElementById("pendingOrdersCount").textContent = pendingCount
  document.getElementById("completedOrdersCount").textContent = completedCount
}
