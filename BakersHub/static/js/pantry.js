// Pantry Data
const inventoryData = [
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

let currentCategoryFilter = "all"

// Declare bootstrap variable
const bootstrap = window.bootstrap

// Initialize Pantry Page
function initPantry() {
  loadInventory()
  setupFAB()
  setupMobileNotification()
}

// Load Inventory
function loadInventory() {
  const grid = document.getElementById("inventoryGrid")

  const filtered =
    currentCategoryFilter === "all"
      ? inventoryData
      : inventoryData.filter((item) => item.category === currentCategoryFilter)

  grid.innerHTML = filtered
    .map((item) => {
      const statusColor = item.status === "critical" ? "danger" : item.status === "low" ? "warning" : "success"

      return `
      <div class="col-md-6 col-lg-4 mb-3">
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
      </div>
    `
    })
    .join("")
}

// Filter by Category
function filterByCategory(category) {
  currentCategoryFilter = category
  loadInventory()
}

// Add Inventory Item
function addInventoryItem() {
  const currentStock = Number.parseFloat(document.getElementById("currentStock").value)
  const lowStockAlert = Number.parseFloat(document.getElementById("lowStockAlert").value)

  const newItem = {
    id: inventoryData.length + 1,
    name: document.getElementById("itemName").value,
    category: document.getElementById("itemCategory").value,
    unit: document.getElementById("itemUnit").value,
    currentStock: currentStock,
    lowStockAlert: lowStockAlert,
    status: currentStock <= lowStockAlert ? (currentStock === 0 ? "critical" : "low") : "good",
  }

  inventoryData.push(newItem)
  loadInventory()

  const modal = bootstrap.Modal.getInstance(document.getElementById("addInventoryModal"))
  modal.hide()
  document.getElementById("addInventoryForm").reset()

  showSuccessMessage("Inventory item added successfully!")
}

// Edit Inventory Item
function editInventoryItem(itemId) {
  const item = inventoryData.find((i) => i.id === itemId)
  if (item) {
    alert(`Edit inventory item: ${item.name}`)
  }
}

// Restock Item
function restockItem(itemId) {
  const item = inventoryData.find((i) => i.id === itemId)
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
