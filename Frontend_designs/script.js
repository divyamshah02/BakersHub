// Sample data
let orders = [
  {
    id: "001",
    customer: "Sarah Johnson",
    phone: "(555) 123-4567",
    items: "Birthday Cake (Chocolate)",
    dueDate: "2024-01-15",
    amount: 85.0,
    status: "completed",
    notes: "Happy Birthday message",
  },
  {
    id: "002",
    customer: "Mike Chen",
    phone: "(555) 234-5678",
    items: "Cupcakes (24 pieces)",
    dueDate: "2024-01-18",
    amount: 48.0,
    status: "in-progress",
    notes: "Vanilla and chocolate mix",
  },
  {
    id: "003",
    customer: "Emma Davis",
    phone: "(555) 345-6789",
    items: "Wedding Cake (3-tier)",
    dueDate: "2024-01-25",
    amount: 350.0,
    status: "pending",
    notes: "White fondant, roses decoration",
  },
  {
    id: "004",
    customer: "John Smith",
    phone: "(555) 456-7890",
    items: "Cookies (50 pieces)",
    dueDate: "2024-01-20",
    amount: 75.0,
    status: "in-progress",
    notes: "Sugar cookies with royal icing",
  },
]

let expenses = [
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
]

const inventory = [
  {
    id: 1,
    name: "All-Purpose Flour",
    category: "ingredients",
    currentStock: 2,
    unit: "lbs",
    lowStockAlert: 5,
    status: "low",
  },
  {
    id: 2,
    name: "Granulated Sugar",
    category: "ingredients",
    currentStock: 10,
    unit: "lbs",
    lowStockAlert: 3,
    status: "good",
  },
  {
    id: 3,
    name: "Vanilla Extract",
    category: "ingredients",
    currentStock: 1,
    unit: "bottles",
    lowStockAlert: 2,
    status: "critical",
  },
  {
    id: 4,
    name: "Butter",
    category: "ingredients",
    currentStock: 3,
    unit: "lbs",
    lowStockAlert: 5,
    status: "low",
  },
  {
    id: 5,
    name: "Cake Boxes",
    category: "packaging",
    currentStock: 25,
    unit: "pieces",
    lowStockAlert: 10,
    status: "good",
  },
  {
    id: 6,
    name: "Stand Mixer",
    category: "equipment",
    currentStock: 1,
    unit: "pieces",
    lowStockAlert: 1,
    status: "good",
  },
]

let shoppingLists = [
  {
    id: 1,
    name: "Dmart List",
    store: "Dmart",
    color: "primary",
    notes: "Weekly grocery shopping for baking supplies",
    items: [
      {
        id: 1,
        name: "All-Purpose Flour",
        quantity: "10 lbs",
        estimatedPrice: 8.99,
        status: "pending",
        dateBought: null,
        actualPrice: null,
        store: null,
      },
      {
        id: 2,
        name: "Granulated Sugar",
        quantity: "5 lbs",
        estimatedPrice: 4.99,
        status: "bought",
        dateBought: "2024-01-10",
        actualPrice: 4.5,
        store: "Dmart",
      },
      {
        id: 3,
        name: "Vanilla Extract",
        quantity: "2 bottles",
        estimatedPrice: 15.99,
        status: "pending",
        dateBought: null,
        actualPrice: null,
        store: null,
      },
    ],
  },
  {
    id: 2,
    name: "Walmart List",
    store: "Walmart",
    color: "success",
    notes: "Equipment and packaging supplies",
    items: [
      {
        id: 4,
        name: "Cake Decorating Tips",
        quantity: "1 set",
        estimatedPrice: 12.5,
        status: "bought",
        dateBought: "2024-01-08",
        actualPrice: 11.99,
        store: "Walmart",
      },
      {
        id: 5,
        name: "Cupcake Liners",
        quantity: "200 pieces",
        estimatedPrice: 8.5,
        status: "pending",
        dateBought: null,
        actualPrice: null,
        store: null,
      },
    ],
  },
  {
    id: 3,
    name: "Specialty Store",
    store: "Baking Supply Co",
    color: "warning",
    notes: "Professional baking ingredients",
    items: [
      {
        id: 6,
        name: "Food Coloring Set",
        quantity: "1 set",
        estimatedPrice: 18.99,
        status: "pending",
        dateBought: null,
        actualPrice: null,
        store: null,
      },
    ],
  },
]

let currentShoppingListId = null
let currentShoppingItemId = null

// Import Bootstrap
const bootstrap = window.bootstrap

// Tutorial System Variables
const tutorialState = {
  dashboard_first_time: localStorage.getItem("tutorial_dashboard_completed") !== "true",
  orders_first_time: localStorage.getItem("tutorial_orders_completed") !== "true",
  expenses_first_time: localStorage.getItem("tutorial_expenses_completed") !== "true",
  shopping_first_time: localStorage.getItem("tutorial_shopping_completed") !== "true",
  currentTutorial: null,
  currentStep: 0,
  isActive: false,
}

// Tutorial configurations for each section
const tutorialConfigs = {
  dashboard: {
    steps: [
      {
        target: ".dashboard-welcome",
        title: "Welcome to Your Dashboard!",
        text: "This is your business overview. Here you can see your monthly earnings, active orders, and important alerts at a glance.",
        position: "bottom",
      },
      {
        target: ".stat-card:first-child",
        title: "Monthly Revenue",
        text: "Track your monthly earnings here. This shows your total income for the current month.",
        position: "bottom",
      },
      {
        target: ".stat-card:nth-child(2)",
        title: "Active Orders",
        text: "See how many orders you currently have in progress. Click to view all orders.",
        position: "bottom",
      },
      {
        target: ".order-cards-container",
        title: "Recent Orders",
        text: 'Your most recent orders appear here. Click "View All" to manage all your orders.',
        position: "top",
      },
      {
        target: '.bottom-nav-item:nth-child(3), .nav-link[data-page="orders"]',
        title: "Navigation",
        text: "Use the navigation to switch between different sections of your app. Try clicking on Orders to manage your baking orders!",
        position: "top",
      },
    ],
  },
  orders: {
    steps: [
      {
        target: ".page-header",
        title: "Orders Management",
        text: "This is where you manage all your baking orders. You can view, edit, and track the status of each order.",
        position: "bottom",
      },
      {
        target: ".filters-card",
        title: "Filter Your Orders",
        text: "Use these filters to find specific orders by status, date, or search for customer names.",
        position: "bottom",
      },
      {
        target: ".fab, .btn-primary",
        title: "Add New Order",
        text: 'Click the + button (mobile) or "New Order" button (desktop) to add a new baking order from a customer.',
        position: "left",
      },
      {
        target: ".orders-grid",
        title: "Your Orders",
        text: "All your orders appear here as cards. Each card shows customer info, items, due date, and amount. Click the edit or delete buttons to manage orders.",
        position: "top",
      },
    ],
  },
  expenses: {
    steps: [
      {
        target: ".page-header",
        title: "Expense Tracking",
        text: "Keep track of all your business expenses here. Monitor ingredients, equipment, and other costs.",
        position: "bottom",
      },
      {
        target: ".stat-card:first-child",
        title: "Monthly Expenses",
        text: "See your total expenses for the current month. Keep an eye on your spending!",
        position: "bottom",
      },
      {
        target: ".fab, .btn-primary",
        title: "Add New Expense",
        text: "Click here to add a new expense. You can categorize it as ingredients, equipment, packaging, or other.",
        position: "left",
      },
      {
        target: ".expenses-grid",
        title: "Expense History",
        text: "All your expenses are displayed here. You can edit or delete any expense by clicking the action buttons.",
        position: "top",
      },
    ],
  },
  shopping: {
    steps: [
      {
        target: ".page-header",
        title: "Shopping Lists",
        text: "Organize your shopping by store! Create different lists for different stores like Dmart, Walmart, etc.",
        position: "bottom",
      },
      {
        target: ".fab, .btn-primary",
        title: "Create New List",
        text: "Click here to create a new shopping list. You can name it after a store and choose a color theme.",
        position: "left",
      },
      {
        target: ".shopping-lists-grid",
        title: "Your Shopping Lists",
        text: "Each list shows total items, bought items, and estimated cost. Click on any list to open it and manage items.",
        position: "top",
      },
      {
        target: ".shopping-list-card:first-child",
        title: "List Details",
        text: "Click on any shopping list card to open it, add items, and mark them as bought. You can also add the expense directly when marking items as bought!",
        position: "top",
      },
    ],
  },
}

// Navigation functionality
document.addEventListener("DOMContentLoaded", () => {
  // Initialize the app
  showPage("dashboard")
  loadOrders()
  loadExpenses()
  loadInventory()
  loadShoppingLists()

  initializeTutorialSystem()

  // Check if dashboard tutorial should be shown
  if (tutorialState.dashboard_first_time) {
    setTimeout(() => {
      startTutorial("dashboard")
    }, 1000)
  }

  // Navigation event listeners for both desktop and mobile
  document.querySelectorAll("[data-page]").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      const page = this.getAttribute("data-page")
      showPage(page)

      // Update active nav link for both desktop and mobile
      document.querySelectorAll(".nav-link, .bottom-nav-item").forEach((nav) => nav.classList.remove("active"))

      // Find and activate corresponding nav items
      document.querySelectorAll(`[data-page="${page}"]`).forEach((nav) => {
        nav.classList.add("active")
      })
    })
  })

  // Mobile FAB functionality
  const mainFab = document.getElementById("mainFab")
  const fabMenu = document.getElementById("fabMenu")

  if (mainFab && fabMenu) {
    mainFab.addEventListener("click", () => {
      mainFab.classList.toggle("active")
      fabMenu.classList.toggle("active")
    })

    // Close FAB menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".fab-container")) {
        mainFab.classList.remove("active")
        fabMenu.classList.remove("active")
      }
    })

    // Close FAB menu when modal opens
    document.querySelectorAll(".fab-option").forEach((option) => {
      option.addEventListener("click", () => {
        mainFab.classList.remove("active")
        fabMenu.classList.remove("active")
      })
    })
  }

  // Mobile notification functionality
  const mobileNotificationBtn = document.getElementById("mobileNotificationBtn")
  if (mobileNotificationBtn) {
    mobileNotificationBtn.addEventListener("click", () => {
      // Show notifications - could expand to show notification panel
      showSuccessMessage("You have 3 pending notifications!")
    })
  }

  // Form submissions
  document.getElementById("profileForm").addEventListener("submit", (e) => {
    e.preventDefault()
    showSuccessMessage("Profile updated successfully!")
  })

  const shoppingStatusFilter = document.getElementById("shoppingStatusFilter")
  if (shoppingStatusFilter) {
    shoppingStatusFilter.addEventListener("change", filterShoppingLists)
  }

  const shoppingCategoryFilter = document.getElementById("shoppingCategoryFilter")
  if (shoppingCategoryFilter) {
    shoppingCategoryFilter.addEventListener("change", filterShoppingLists)
  }

  const searchShoppingItems = document.getElementById("searchShoppingItems")
  if (searchShoppingItems) {
    searchShoppingItems.addEventListener("input", filterShoppingLists)
  }
})

// Page navigation
function showPage(pageId) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active")
  })
  document.getElementById(pageId).classList.add("active")

  checkAndShowTutorial(pageId)
}

// Orders functionality
function loadOrders() {
  const ordersGrid = document.getElementById("ordersGrid")
  if (!ordersGrid) return

  ordersGrid.innerHTML = ""

  orders.forEach((order) => {
    const orderCard = document.createElement("div")
    orderCard.className = "order-grid-card fade-in"
    orderCard.innerHTML = `
      <div class="order-grid-header">
        <div class="order-grid-number">#${order.id}</div>
        <span class="badge bg-${getStatusColor(order.status)}">${capitalizeFirst(order.status)}</span>
      </div>
      <div class="order-grid-content">
        <h5>${order.items}</h5>
        <div class="order-grid-customer">
          <i class="fas fa-user"></i>
          ${order.customer}
        </div>
        <div class="order-grid-due">
          <i class="fas fa-calendar-alt"></i>
          Due: ${formatDate(order.dueDate)}
        </div>
      </div>
      <div class="order-grid-footer">
        <div class="order-grid-amount">$${order.amount.toFixed(2)}</div>
        <div class="order-actions">
          <button class="btn btn-action btn-edit" onclick="editOrder('${order.id}')" title="Edit Order">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-action btn-delete" onclick="deleteOrder('${order.id}')" title="Delete Order">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `
    ordersGrid.appendChild(orderCard)
  })
}

function addOrder() {
  const form = document.getElementById("addOrderForm")
  const formData = new FormData(form)

  const newOrder = {
    id: String(orders.length + 1).padStart(3, "0"),
    customer: formData.get("customer") || form.querySelector('input[type="text"]').value,
    phone: formData.get("phone") || form.querySelectorAll("input")[1].value,
    items: formData.get("items") || form.querySelector("textarea").value,
    dueDate: formData.get("dueDate") || form.querySelector('input[type="date"]').value,
    amount: Number.parseFloat(formData.get("amount") || form.querySelector('input[type="number"]').value),
    status: "pending",
    notes: formData.get("notes") || form.querySelectorAll("textarea")[1].value,
  }

  orders.push(newOrder)
  loadOrders()

  // Close modal and reset form
  const modal = bootstrap.Modal.getInstance(document.getElementById("addOrderModal"))
  modal.hide()
  form.reset()

  showSuccessMessage("Order added successfully!")
}

function editOrder(orderId) {
  const order = orders.find((o) => o.id === orderId)
  if (order) {
    // In a real app, you'd populate a modal with the order data
    alert(`Edit order #${order.id} for ${order.customer}`)
  }
}

function deleteOrder(orderId) {
  if (confirm("Are you sure you want to delete this order?")) {
    orders = orders.filter((o) => o.id !== orderId)
    loadOrders()
    showSuccessMessage("Order deleted successfully!")
  }
}

// Expenses functionality
function loadExpenses() {
  const expensesGrid = document.getElementById("expensesGrid")
  if (!expensesGrid) return

  expensesGrid.innerHTML = ""

  expenses.forEach((expense) => {
    const expenseCard = document.createElement("div")
    expenseCard.className = "expense-card fade-in"
    expenseCard.innerHTML = `
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
    `
    expensesGrid.appendChild(expenseCard)
  })
}

function addExpense() {
  const form = document.getElementById("addExpenseForm")
  const inputs = form.querySelectorAll("input, select")

  const newExpense = {
    id: expenses.length + 1,
    description: inputs[0].value,
    category: inputs[1].value,
    amount: Number.parseFloat(inputs[2].value),
    date: inputs[3].value,
  }

  expenses.push(newExpense)
  loadExpenses()

  // Close modal and reset form
  const modal = bootstrap.Modal.getInstance(document.getElementById("addExpenseModal"))
  modal.hide()
  form.reset()

  showSuccessMessage("Expense added successfully!")
}

function editExpense(expenseId) {
  const expense = expenses.find((e) => e.id === expenseId)
  if (expense) {
    alert(`Edit expense: ${expense.description}`)
  }
}

function deleteExpense(expenseId) {
  if (confirm("Are you sure you want to delete this expense?")) {
    expenses = expenses.filter((e) => e.id !== expenseId)
    loadExpenses()
    showSuccessMessage("Expense deleted successfully!")
  }
}

// Inventory functionality
function loadInventory() {
  const grid = document.getElementById("inventoryGrid")
  grid.innerHTML = ""

  inventory.forEach((item) => {
    const col = document.createElement("div")
    col.className = "col-md-6 col-lg-4 mb-3"

    const statusColor = item.status === "critical" ? "danger" : item.status === "low" ? "warning" : "success"

    col.innerHTML = `
            <div class="inventory-item">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="mb-0">${item.name}</h6>
                    <span class="badge bg-${statusColor}">${capitalizeFirst(item.status)}</span>
                </div>
                <p class="text-muted mb-2">${capitalizeFirst(item.category)}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="stock-level">
                        ${item.currentStock} ${item.unit}
                    </div>
                    <small class="text-muted">Alert: ${item.lowStockAlert} ${item.unit}</small>
                </div>
                <div class="mt-3">
                    <div class="btn-group btn-group-sm w-100">
                        <button class="btn btn-outline-primary" onclick="editInventoryItem(${item.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-outline-success" onclick="restockItem(${item.id})">
                            <i class="fas fa-plus"></i> Restock
                        </button>
                    </div>
                </div>
            </div>
        `

    grid.appendChild(col)
  })
}

function addInventoryItem() {
  const form = document.getElementById("addInventoryForm")
  const inputs = form.querySelectorAll("input, select")

  const currentStock = Number.parseFloat(inputs[2].value)
  const lowStockAlert = Number.parseFloat(inputs[3].value)

  const newItem = {
    id: inventory.length + 1,
    name: inputs[0].value,
    category: inputs[1].value,
    unit: inputs[2].previousElementSibling.value,
    currentStock: currentStock,
    lowStockAlert: lowStockAlert,
    status: currentStock <= lowStockAlert ? (currentStock === 0 ? "critical" : "low") : "good",
  }

  inventory.push(newItem)
  loadInventory()

  // Close modal and reset form
  const modal = bootstrap.Modal.getInstance(document.getElementById("addInventoryModal"))
  modal.hide()
  form.reset()

  showSuccessMessage("Inventory item added successfully!")
}

function editInventoryItem(itemId) {
  const item = inventory.find((i) => i.id === itemId)
  if (item) {
    alert(`Edit inventory item: ${item.name}`)
  }
}

function restockItem(itemId) {
  const item = inventory.find((i) => i.id === itemId)
  if (item) {
    const amount = prompt(`How much ${item.name} would you like to add? (Current: ${item.currentStock} ${item.unit})`)
    if (amount && !isNaN(amount)) {
      item.currentStock += Number.parseFloat(amount)
      item.status = item.currentStock <= item.lowStockAlert ? (item.currentStock === 0 ? "critical" : "low") : "good"
      loadInventory()
      showSuccessMessage(`${item.name} restocked successfully!`)
    }
  }
}

// Shopping Lists functionality
function loadShoppingLists() {
  const shoppingListsGrid = document.getElementById("shoppingListsGrid")
  if (!shoppingListsGrid) return

  shoppingListsGrid.innerHTML = ""

  shoppingLists.forEach((list) => {
    const totalItems = list.items.length
    const boughtItems = list.items.filter((item) => item.status === "bought").length
    const pendingItems = list.items.filter((item) => item.status === "pending")
    const estimatedTotal = pendingItems.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0)
    const progress = totalItems > 0 ? (boughtItems / totalItems) * 100 : 0

    const listCard = document.createElement("div")
    listCard.className = `shopping-list-card color-${list.color} fade-in`
    listCard.onclick = () => openShoppingListModal(list.id)

    listCard.innerHTML = `
      <div class="shopping-list-header">
        <div>
          <div class="shopping-list-name">${list.name}</div>
          ${list.store ? `<div class="shopping-list-store"><i class="fas fa-store"></i> ${list.store}</div>` : ""}
        </div>
        <div class="shopping-list-actions" onclick="event.stopPropagation()">
          <button class="btn btn-list-action btn-edit-list" onclick="editShoppingList(${list.id})" title="Edit List">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-list-action btn-delete-list" onclick="deleteShoppingList(${list.id})" title="Delete List">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div class="shopping-list-stats">
        <div class="shopping-list-stat">
          <div class="shopping-list-stat-value">${totalItems}</div>
          <div class="shopping-list-stat-label">Total Items</div>
        </div>
        <div class="shopping-list-stat">
          <div class="shopping-list-stat-value">${boughtItems}</div>
          <div class="shopping-list-stat-label">Bought</div>
        </div>
      </div>

      ${list.notes ? `<div class="shopping-list-notes">${list.notes}</div>` : ""}

      <div class="shopping-list-footer">
        <div class="shopping-list-progress">
          <div class="shopping-list-progress-label">Progress: ${Math.round(progress)}%</div>
          <div class="progress">
            <div class="progress-bar" style="width: ${progress}%"></div>
          </div>
        </div>
        <div class="shopping-list-estimated">
          <strong>$${estimatedTotal.toFixed(2)}</strong>
          <small class="text-muted d-block">Estimated</small>
        </div>
      </div>
    `
    shoppingListsGrid.appendChild(listCard)
  })
}

function addShoppingList() {
  const form = document.getElementById("addShoppingListForm")

  const newList = {
    id: Math.max(...shoppingLists.map((list) => list.id), 0) + 1,
    name: document.getElementById("shoppingListName").value,
    store: document.getElementById("shoppingListStore").value,
    color: document.getElementById("shoppingListColor").value,
    notes: document.getElementById("shoppingListNotes").value,
    items: [],
  }

  shoppingLists.push(newList)
  loadShoppingLists()

  // Close modal and reset form
  const modal = bootstrap.Modal.getInstance(document.getElementById("addShoppingListModal"))
  modal.hide()
  form.reset()

  showSuccessMessage("Shopping list created successfully!")
}

function openShoppingListModal(listId) {
  console.log("[v0] Opening shopping list modal for ID:", listId) // Debug log

  currentShoppingListId = listId
  const list = shoppingLists.find((l) => l.id === listId)

  if (list) {
    console.log("[v0] Found shopping list:", list.name) // Debug log

    document.getElementById("shoppingListModalTitle").textContent = list.name
    loadShoppingListItems(list)
    updateModalStats(list)

    try {
      const modalElement = document.getElementById("shoppingListItemsModal")
      if (modalElement && bootstrap && bootstrap.Modal) {
        const modal = new bootstrap.Modal(modalElement)
        modal.show()
        console.log("[v0] Modal opened successfully") // Debug log
      } else {
        console.error("[v0] Bootstrap Modal not available or modal element not found")
      }
    } catch (error) {
      console.error("[v0] Error opening modal:", error)
    }
  } else {
    console.error("[v0] Shopping list not found for ID:", listId)
  }
}

function loadShoppingListItems(list) {
  const container = document.getElementById("shoppingItemsContainer")
  container.innerHTML = ""

  list.items.forEach((item) => {
    const itemDiv = document.createElement("div")
    itemDiv.className = `shopping-item-modal ${item.status === "bought" ? "bought" : ""}`

    itemDiv.innerHTML = `
      <div class="shopping-item-modal-header">
        <div>
          <div class="shopping-item-modal-name">${item.name}</div>
          <div class="shopping-item-modal-quantity">${item.quantity}</div>
        </div>
        <div class="shopping-item-modal-price">
          ${
            item.status === "bought" && item.actualPrice
              ? `$${item.actualPrice.toFixed(2)} (paid)`
              : `$${item.estimatedPrice ? item.estimatedPrice.toFixed(2) : "0.00"} (est.)`
          }
        </div>
      </div>
      
      ${
        item.status === "bought" && item.store
          ? `<div class="bought-info">
          <i class="fas fa-check-circle"></i>
          Bought on ${formatDate(item.dateBought)} at ${item.store}
        </div>`
          : ""
      }
      
      <div class="shopping-item-modal-actions">
        ${
          item.status === "pending"
            ? `<button class="btn btn-item-action btn-mark-bought" onclick="openMarkBoughtModal(${item.id})">
            <i class="fas fa-shopping-cart"></i> Mark Bought
          </button>`
            : ""
        }
        <button class="btn btn-item-action btn-edit-item" onclick="editShoppingItem(${item.id})">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn btn-item-action btn-delete-item" onclick="deleteShoppingItem(${item.id})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `
    container.appendChild(itemDiv)
  })
}

function addItemToCurrentList() {
  if (!currentShoppingListId) return

  const list = shoppingLists.find((l) => l.id === currentShoppingListId)
  if (!list) return

  const name = document.getElementById("newItemName").value.trim()
  const quantity = document.getElementById("newItemQuantity").value.trim()
  const estimatedPrice = Number.parseFloat(document.getElementById("newItemEstPrice").value) || 0

  if (!name) {
    alert("Please enter an item name")
    return
  }

  const newItem = {
    id: Math.max(...shoppingLists.flatMap((l) => l.items.map((i) => i.id)), 0) + 1,
    name: name,
    quantity: quantity || "1",
    estimatedPrice: estimatedPrice,
    status: "pending",
    dateBought: null,
    actualPrice: null,
    store: null,
  }

  list.items.push(newItem)
  loadShoppingListItems(list)
  updateModalStats(list)
  loadShoppingLists() // Refresh the main grid

  // Clear the form
  document.getElementById("newItemName").value = ""
  document.getElementById("newItemQuantity").value = ""
  document.getElementById("newItemEstPrice").value = ""

  showSuccessMessage("Item added to shopping list!")
}

function updateModalStats(list) {
  const totalItems = list.items.length
  const boughtItems = list.items.filter((item) => item.status === "bought").length
  const pendingItems = list.items.filter((item) => item.status === "pending")
  const estimatedTotal = pendingItems.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0)

  document.getElementById("modalTotalItems").textContent = totalItems
  document.getElementById("modalBoughtItems").textContent = boughtItems
  document.getElementById("modalEstimatedTotal").textContent = estimatedTotal.toFixed(2)
}

function openMarkBoughtModal(itemId) {
  currentShoppingItemId = itemId

  // Find the item across all lists
  let item = null
  for (const list of shoppingLists) {
    item = list.items.find((i) => i.id === itemId)
    if (item) break
  }

  if (item) {
    document.getElementById("boughtItemName").textContent = item.name
    document.getElementById("boughtItemQuantity").textContent = item.quantity
    document.getElementById("actualPrice").value = item.estimatedPrice || ""
    document.getElementById("purchaseDate").value = new Date().toISOString().split("T")[0]

    const modal = new bootstrap.Modal(document.getElementById("markBoughtModal"))
    modal.show()
  }
}

function markAsBought() {
  if (!currentShoppingItemId) return

  // Find the item and its list
  let item = null
  let parentList = null
  for (const list of shoppingLists) {
    item = list.items.find((i) => i.id === currentShoppingItemId)
    if (item) {
      parentList = list
      break
    }
  }

  const actualPrice = Number.parseFloat(document.getElementById("actualPrice").value)
  const store = document.getElementById("storeName").value
  const purchaseDate = document.getElementById("purchaseDate").value
  const addToExpenses = document.getElementById("addToExpenses").checked

  if (item && actualPrice && purchaseDate) {
    // Update shopping item
    item.status = "bought"
    item.actualPrice = actualPrice
    item.store = store || parentList.store
    item.dateBought = purchaseDate

    // Add to expenses if checkbox is checked
    if (addToExpenses) {
      const newExpense = {
        id: Math.max(...expenses.map((e) => e.id), 0) + 1,
        date: purchaseDate,
        description: `${item.name} (${item.quantity})${item.store ? ` - ${item.store}` : ""}`,
        category: "ingredients", // Default category
        amount: actualPrice,
      }
      expenses.push(newExpense)
      loadExpenses()
    }

    // Refresh displays
    loadShoppingListItems(parentList)
    updateModalStats(parentList)
    loadShoppingLists()

    // Close modal and reset
    const modal = bootstrap.Modal.getInstance(document.getElementById("markBoughtModal"))
    modal.hide()
    document.getElementById("markBoughtForm").reset()
    currentShoppingItemId = null

    showSuccessMessage(`${item.name} marked as bought${addToExpenses ? " and added to expenses" : ""}!`)
  }
}

function editShoppingList(listId) {
  const list = shoppingLists.find((l) => l.id === listId)
  if (list) {
    // In a real app, you'd populate a modal with the list data
    alert(`Edit shopping list: ${list.name}`)
  }
}

function deleteShoppingList(listId) {
  if (confirm("Are you sure you want to delete this shopping list and all its items?")) {
    shoppingLists = shoppingLists.filter((l) => l.id !== listId)
    loadShoppingLists()
    showSuccessMessage("Shopping list deleted successfully!")
  }
}

function editShoppingItem(itemId) {
  // Find the item across all lists
  let item = null
  for (const list of shoppingLists) {
    item = list.items.find((i) => i.id === itemId)
    if (item) break
  }

  if (item) {
    // In a real app, you'd populate a modal with the item data
    alert(`Edit shopping item: ${item.name}`)
  }
}

function deleteShoppingItem(itemId) {
  if (confirm("Are you sure you want to delete this shopping item?")) {
    // Find and remove the item from its list
    for (const list of shoppingLists) {
      const itemIndex = list.items.findIndex((i) => i.id === itemId)
      if (itemIndex !== -1) {
        list.items.splice(itemIndex, 1)
        loadShoppingListItems(list)
        updateModalStats(list)
        loadShoppingLists()
        showSuccessMessage("Shopping item deleted successfully!")
        break
      }
    }
  }
}

// Utility functions
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
  // Create and show a temporary success message
  const alert = document.createElement("div")
  alert.className = "alert alert-success alert-dismissible fade show position-fixed"

  // Adjust positioning for mobile
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

  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (alert.parentNode) {
      alert.remove()
    }
  }, 3000)
}

function clearFilters() {
  document.getElementById("statusFilter").value = ""
  document.getElementById("dateFilter").value = ""
  document.getElementById("searchOrders").value = ""
  loadOrders()
}

// Search and filter functionality
document.addEventListener("DOMContentLoaded", () => {
  // Add search functionality
  const searchInput = document.getElementById("searchOrders")
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      filterOrders()
    })
  }

  const statusFilter = document.getElementById("statusFilter")
  if (statusFilter) {
    statusFilter.addEventListener("change", () => {
      filterOrders()
    })
  }

  const dateFilter = document.getElementById("dateFilter")
  if (dateFilter) {
    dateFilter.addEventListener("change", () => {
      filterOrders()
    })
  }
})

function filterOrders() {
  const searchTerm = document.getElementById("searchOrders").value.toLowerCase()
  const statusFilter = document.getElementById("statusFilter").value
  const dateFilter = document.getElementById("dateFilter").value

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchTerm ||
      order.customer.toLowerCase().includes(searchTerm) ||
      order.items.toLowerCase().includes(searchTerm) ||
      order.id.includes(searchTerm)

    const matchesStatus = !statusFilter || order.status === statusFilter
    const matchesDate = !dateFilter || order.dueDate === dateFilter

    return matchesSearch && matchesStatus && matchesDate
  })

  // Update the grid with filtered results
  const ordersGrid = document.getElementById("ordersGrid")
  if (!ordersGrid) return

  ordersGrid.innerHTML = ""

  filteredOrders.forEach((order) => {
    const orderCard = document.createElement("div")
    orderCard.className = "order-grid-card fade-in"
    orderCard.innerHTML = `
      <div class="order-grid-header">
        <div class="order-grid-number">#${order.id}</div>
        <span class="badge bg-${getStatusColor(order.status)}">${capitalizeFirst(order.status)}</span>
      </div>
      <div class="order-grid-content">
        <h5>${order.items}</h5>
        <div class="order-grid-customer">
          <i class="fas fa-user"></i>
          ${order.customer}
        </div>
        <div class="order-grid-due">
          <i class="fas fa-calendar-alt"></i>
          Due: ${formatDate(order.dueDate)}
        </div>
      </div>
      <div class="order-grid-footer">
        <div class="order-grid-amount">$${order.amount.toFixed(2)}</div>
        <div class="order-actions">
          <button class="btn btn-action btn-edit" onclick="editOrder('${order.id}')" title="Edit Order">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-action btn-delete" onclick="deleteOrder('${order.id}')" title="Delete Order">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `
    ordersGrid.appendChild(orderCard)
  })
}

function filterShoppingLists() {
  const statusFilter = document.getElementById("shoppingStatusFilter").value
  const categoryFilter = document.getElementById("shoppingCategoryFilter").value
  const searchTerm = document.getElementById("searchShoppingItems").value.toLowerCase()

  const filteredLists = shoppingLists.filter((list) => {
    const matchesStatus = !statusFilter || list.items.some((item) => item.status === statusFilter)
    const matchesCategory = !categoryFilter || list.items.some((item) => item.category === categoryFilter)
    const matchesSearch = !searchTerm || list.items.some((item) => item.name.toLowerCase().includes(searchTerm))

    return matchesStatus && matchesCategory && matchesSearch
  })

  const shoppingListsGrid = document.getElementById("shoppingListsGrid")
  if (!shoppingListsGrid) return

  shoppingListsGrid.innerHTML = ""

  filteredLists.forEach((list) => {
    const totalItems = list.items.length
    const boughtItems = list.items.filter((item) => item.status === "bought").length
    const pendingItems = list.items.filter((item) => item.status === "pending")
    const estimatedTotal = pendingItems.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0)
    const progress = totalItems > 0 ? (boughtItems / totalItems) * 100 : 0

    const listCard = document.createElement("div")
    listCard.className = `shopping-list-card color-${list.color} fade-in`
    listCard.onclick = () => openShoppingListModal(list.id)

    listCard.innerHTML = `
      <div class="shopping-list-header">
        <div>
          <div class="shopping-list-name">${list.name}</div>
          ${list.store ? `<div class="shopping-list-store"><i class="fas fa-store"></i> ${list.store}</div>` : ""}
        </div>
        <div class="shopping-list-actions" onclick="event.stopPropagation()">
          <button class="btn btn-list-action btn-edit-list" onclick="editShoppingList(${list.id})" title="Edit List">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-list-action btn-delete-list" onclick="deleteShoppingList(${list.id})" title="Delete List">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div class="shopping-list-stats">
        <div class="shopping-list-stat">
          <div class="shopping-list-stat-value">${totalItems}</div>
          <div class="shopping-list-stat-label">Total Items</div>
        </div>
        <div class="shopping-list-stat">
          <div class="shopping-list-stat-value">${boughtItems}</div>
          <div class="shopping-list-stat-label">Bought</div>
        </div>
      </div>

      ${list.notes ? `<div class="shopping-list-notes">${list.notes}</div>` : ""}

      <div class="shopping-list-footer">
        <div class="shopping-list-progress">
          <div class="shopping-list-progress-label">Progress: ${Math.round(progress)}%</div>
          <div class="progress">
            <div class="progress-bar" style="width: ${progress}%"></div>
          </div>
        </div>
        <div class="shopping-list-estimated">
          <strong>$${estimatedTotal.toFixed(2)}</strong>
          <small class="text-muted d-block">Estimated</small>
        </div>
      </div>
    `
    shoppingListsGrid.appendChild(listCard)
  })
}

// Tutorial system functions
function initializeTutorialSystem() {
  const overlay = document.getElementById("tutorialOverlay")
  const skipBtn = document.getElementById("skipTutorial")
  const nextBtn = document.getElementById("nextTutorial")

  if (!overlay) return

  skipBtn.addEventListener("click", skipTutorial)
  nextBtn.addEventListener("click", nextTutorialStep)

  // Close tutorial when clicking backdrop
  overlay.querySelector(".tutorial-backdrop").addEventListener("click", skipTutorial)
}

function checkAndShowTutorial(pageId) {
  // Don't show tutorial if one is already active
  if (tutorialState.isActive) return

  const tutorialKey = `${pageId}_first_time`
  if (tutorialState[tutorialKey] && tutorialConfigs[pageId]) {
    setTimeout(() => {
      startTutorial(pageId)
    }, 500)
  }
}

function startTutorial(section) {
  if (!tutorialConfigs[section] || tutorialState.isActive) return

  tutorialState.currentTutorial = section
  tutorialState.currentStep = 0
  tutorialState.isActive = true

  const overlay = document.getElementById("tutorialOverlay")
  overlay.classList.add("active")

  showTutorialStep()
}

function showTutorialStep() {
  const config = tutorialConfigs[tutorialState.currentTutorial]
  const step = config.steps[tutorialState.currentStep]

  if (!step) {
    completeTutorial()
    return
  }

  const overlay = document.getElementById("tutorialOverlay")
  const highlight = overlay.querySelector(".tutorial-highlight")
  const tooltip = overlay.querySelector(".tutorial-tooltip")
  const arrow = overlay.querySelector(".tutorial-arrow")

  // Update step counter
  document.getElementById("currentStep").textContent = tutorialState.currentStep + 1
  document.getElementById("totalSteps").textContent = config.steps.length

  // Update content
  document.getElementById("tutorialTitle").textContent = step.title
  document.getElementById("tutorialText").textContent = step.text

  // Update next button text
  const nextBtn = document.getElementById("nextTutorial")
  nextBtn.textContent = tutorialState.currentStep === config.steps.length - 1 ? "Finish" : "Next"

  // Find target element
  let targetElement = document.querySelector(step.target)

  // Handle multiple selectors (for responsive elements)
  if (!targetElement && step.target.includes(",")) {
    const selectors = step.target.split(",").map((s) => s.trim())
    for (const selector of selectors) {
      targetElement = document.querySelector(selector)
      if (targetElement && isElementVisible(targetElement)) break
    }
  }

  if (!targetElement) {
    console.warn(`Tutorial target not found: ${step.target}`)
    nextTutorialStep()
    return
  }

  // Position highlight around target
  positionHighlight(highlight, targetElement)

  // Position tooltip
  positionTooltip(tooltip, arrow, targetElement, step.position)

  // Add pulse animation
  highlight.classList.add("pulse")

  // Make target element accessible
  targetElement.classList.add("tutorial-target")
}

function positionHighlight(highlight, target) {
  const rect = target.getBoundingClientRect()
  const padding = 8

  highlight.style.left = rect.left - padding + "px"
  highlight.style.top = rect.top - padding + "px"
  highlight.style.width = rect.width + padding * 2 + "px"
  highlight.style.height = rect.height + padding * 2 + "px"
}

function positionTooltip(tooltip, arrow, target, position) {
  const rect = target.getBoundingClientRect()
  const tooltipRect = tooltip.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const padding = 20

  // Reset arrow classes
  arrow.className = "tutorial-arrow"

  let left, top

  switch (position) {
    case "top":
      left = rect.left + rect.width / 2 - tooltipRect.width / 2
      top = rect.top - tooltipRect.height - padding
      arrow.classList.add("bottom")
      break
    case "bottom":
      left = rect.left + rect.width / 2 - tooltipRect.width / 2
      top = rect.bottom + padding
      arrow.classList.add("top")
      break
    case "left":
      left = rect.left - tooltipRect.width - padding
      top = rect.top + rect.height / 2 - tooltipRect.height / 2
      arrow.classList.add("right")
      break
    case "right":
      left = rect.right + padding
      top = rect.top + rect.height / 2 - tooltipRect.height / 2
      arrow.classList.add("left")
      break
    default:
      left = rect.left + rect.width / 2 - tooltipRect.width / 2
      top = rect.bottom + padding
      arrow.classList.add("top")
  }

  // Adjust for viewport boundaries
  if (left < padding) {
    left = padding
  } else if (left + tooltipRect.width > viewportWidth - padding) {
    left = viewportWidth - tooltipRect.width - padding
  }

  if (top < padding) {
    top = rect.bottom + padding
    arrow.className = "tutorial-arrow top"
  } else if (top + tooltipRect.height > viewportHeight - padding) {
    top = rect.top - tooltipRect.height - padding
    arrow.className = "tutorial-arrow bottom"
  }

  tooltip.style.left = left + "px"
  tooltip.style.top = top + "px"
}

function nextTutorialStep() {
  const config = tutorialConfigs[tutorialState.currentTutorial]

  // Remove tutorial-target class from current element
  const currentTarget = document.querySelector(".tutorial-target")
  if (currentTarget) {
    currentTarget.classList.remove("tutorial-target")
  }

  tutorialState.currentStep++

  if (tutorialState.currentStep >= config.steps.length) {
    completeTutorial()
  } else {
    showTutorialStep()
  }
}

function skipTutorial() {
  completeTutorial()
}

function completeTutorial() {
  const overlay = document.getElementById("tutorialOverlay")
  const highlight = overlay.querySelector(".tutorial-highlight")

  // Remove classes
  overlay.classList.remove("active")
  highlight.classList.remove("pulse")

  // Remove tutorial-target class
  const currentTarget = document.querySelector(".tutorial-target")
  if (currentTarget) {
    currentTarget.classList.remove("tutorial-target")
  }

  // Mark tutorial as completed
  if (tutorialState.currentTutorial) {
    const tutorialKey = `tutorial_${tutorialState.currentTutorial}_completed`
    localStorage.setItem(tutorialKey, "true")
    tutorialState[`${tutorialState.currentTutorial}_first_time`] = false
  }

  // Reset state
  tutorialState.currentTutorial = null
  tutorialState.currentStep = 0
  tutorialState.isActive = false
}

function isElementVisible(element) {
  const rect = element.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}
