// Shopping Lists Data
let shoppingListsData = [
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

// Import Bootstrap
const bootstrap = window.bootstrap

// Initialize Shopping Page
function initShopping() {
  loadShoppingLists()
  setupFAB()
  setupMobileNotification()
}

// Load Shopping Lists
function loadShoppingLists() {
  const grid = document.getElementById("shoppingListsGrid")

  grid.innerHTML = shoppingListsData
    .map((list) => {
      const totalItems = list.items.length
      const boughtItems = list.items.filter((item) => item.status === "bought").length
      const pendingItems = list.items.filter((item) => item.status === "pending")
      const estimatedTotal = pendingItems.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0)
      const progress = totalItems > 0 ? (boughtItems / totalItems) * 100 : 0

      return `
      <div class="shopping-list-card color-${list.color} fade-in" onclick="openShoppingListModal(${list.id})">
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
      </div>
    `
    })
    .join("")
}

// Add Shopping List
function addShoppingList() {
  const newList = {
    id: Math.max(...shoppingListsData.map((list) => list.id), 0) + 1,
    name: document.getElementById("shoppingListName").value,
    store: document.getElementById("shoppingListStore").value,
    color: document.getElementById("shoppingListColor").value,
    notes: document.getElementById("shoppingListNotes").value,
    items: [],
  }

  shoppingListsData.push(newList)
  loadShoppingLists()

  const modal = bootstrap.Modal.getInstance(document.getElementById("addShoppingListModal"))
  modal.hide()
  document.getElementById("addShoppingListForm").reset()

  showSuccessMessage("Shopping list created successfully!")
}

// Open Shopping List Modal
function openShoppingListModal(listId) {
  currentShoppingListId = listId
  const list = shoppingListsData.find((l) => l.id === listId)

  if (list) {
    document.getElementById("shoppingListModalTitle").textContent = list.name
    loadShoppingListItems(list)
    updateModalStats(list)

    const modal = new bootstrap.Modal(document.getElementById("shoppingListItemsModal"))
    modal.show()
  }
}

// Load Shopping List Items
function loadShoppingListItems(list) {
  const container = document.getElementById("shoppingItemsContainer")

  container.innerHTML = list.items
    .map(
      (item) => `
    <div class="shopping-item-modal ${item.status === "bought" ? "bought" : ""}">
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
            ? `<button class="btn btn-item-action btn-mark-bought" onclick="markItemBought(${item.id})">
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
    </div>
  `,
    )
    .join("")
}

// Add Item to Current List
function addItemToCurrentList() {
  if (!currentShoppingListId) return

  const list = shoppingListsData.find((l) => l.id === currentShoppingListId)
  if (!list) return

  const name = document.getElementById("newItemName").value.trim()
  const quantity = document.getElementById("newItemQuantity").value.trim()
  const estimatedPrice = Number.parseFloat(document.getElementById("newItemEstPrice").value) || 0

  if (!name) {
    alert("Please enter an item name")
    return
  }

  const newItem = {
    id: Math.max(...shoppingListsData.flatMap((l) => l.items.map((i) => i.id)), 0) + 1,
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
  loadShoppingLists()

  document.getElementById("newItemName").value = ""
  document.getElementById("newItemQuantity").value = ""
  document.getElementById("newItemEstPrice").value = ""

  showSuccessMessage("Item added to shopping list!")
}

// Update Modal Stats
function updateModalStats(list) {
  const totalItems = list.items.length
  const boughtItems = list.items.filter((item) => item.status === "bought").length
  const pendingItems = list.items.filter((item) => item.status === "pending")
  const estimatedTotal = pendingItems.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0)

  document.getElementById("modalTotalItems").textContent = totalItems
  document.getElementById("modalBoughtItems").textContent = boughtItems
  document.getElementById("modalEstimatedTotal").textContent = estimatedTotal.toFixed(2)
}

// Mark Item as Bought
function markItemBought(itemId) {
  let item = null
  let parentList = null

  for (const list of shoppingListsData) {
    item = list.items.find((i) => i.id === itemId)
    if (item) {
      parentList = list
      break
    }
  }

  if (item) {
    const actualPrice = prompt(`Enter actual price for ${item.name}:`, item.estimatedPrice || "0")
    if (actualPrice !== null) {
      item.status = "bought"
      item.actualPrice = Number.parseFloat(actualPrice)
      item.dateBought = new Date().toISOString().split("T")[0]
      item.store = parentList.store

      loadShoppingListItems(parentList)
      updateModalStats(parentList)
      loadShoppingLists()

      showSuccessMessage(`${item.name} marked as bought!`)
    }
  }
}

// Edit Shopping List
function editShoppingList(listId) {
  const list = shoppingListsData.find((l) => l.id === listId)
  if (list) {
    alert(`Edit shopping list: ${list.name}`)
  }
}

// Delete Shopping List
function deleteShoppingList(listId) {
  if (confirm("Are you sure you want to delete this shopping list and all its items?")) {
    shoppingListsData = shoppingListsData.filter((l) => l.id !== listId)
    loadShoppingLists()
    showSuccessMessage("Shopping list deleted successfully!")
  }
}

// Edit Shopping Item
function editShoppingItem(itemId) {
  let item = null
  for (const list of shoppingListsData) {
    item = list.items.find((i) => i.id === itemId)
    if (item) break
  }

  if (item) {
    alert(`Edit shopping item: ${item.name}`)
  }
}

// Delete Shopping Item
function deleteShoppingItem(itemId) {
  if (confirm("Are you sure you want to delete this shopping item?")) {
    for (const list of shoppingListsData) {
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
