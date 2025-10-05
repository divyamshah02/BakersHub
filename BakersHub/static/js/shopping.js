// Shopping Lists Data
let shoppingListsData = []
let allShoppingItems = []

let shoppinglist_url = null
let shoppinglistitem_url = null
let csrf_token = null

let displayedListsCount = 0
const LISTS_PER_PAGE = 6

let currentShoppingListId = null
let currentShoppingListPk = null
let displayedItemsCount = 0
const ITEMS_PER_PAGE = 5

// Import Bootstrap
const bootstrap = window.bootstrap

// Initialize Shopping Page
async function initShopping(
  shoppinglist_url_param,
  shoppinglistitem_url_param,
  csrf_token_param
) {
  shoppinglist_url = shoppinglist_url_param
  shoppinglistitem_url = shoppinglistitem_url_param
  csrf_token = csrf_token_param

  await loadShoppingLists()
  setupFilters()
  setupFAB()
  setupMobileNotification()
}

// Load Shopping Lists
async function loadShoppingLists() {
  const [success, response] = await callApi("GET", `${shoppinglist_url}`, null, csrf_token)

  if (success && response.success) {
    shoppingListsData = response.data
    const grid = document.getElementById("shoppingListsGrid")
    grid.innerHTML = ""

    if (displayedListsCount > LISTS_PER_PAGE) {
      renderShoppingLists(shoppingListsData.slice(0, displayedListsCount))
    } else {
      renderShoppingLists(shoppingListsData.slice(0, LISTS_PER_PAGE))
      displayedListsCount = Math.min(LISTS_PER_PAGE, shoppingListsData.length)
    }

    updateLoadMoreButton()
    updateTotalListsCount(shoppingListsData.length)
  } else {
    showErrorMessage(response.error || "Failed to load shopping lists")
  }
}

// Render Shopping Lists
function renderShoppingLists(lists) {
  const grid = document.getElementById("shoppingListsGrid")

  updateTotalListsCount(shoppingListsData.length)

  if (!lists || lists.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
        <p class="text-muted">No shopping lists found</p>
      </div>
    `
    return
  }

  const listCards = lists
    .map((list, index) => {
      const totalItems = list.items ? list.items.length : 0
      const boughtItems = list.items ? list.items.filter((item) => item.is_bought).length : 0
      const progress = totalItems > 0 ? (boughtItems / totalItems) * 100 : 0

      const listIndex = shoppingListsData.findIndex((l) => l.id === list.id)

      return `
      <div class="shopping-list-card color-primary fade-in" onclick="openShoppingListModal('${list.list_id}', ${list.id})">
        <div class="shopping-list-header">
          <div class="shopping-list-header-left">
            <div class="shopping-list-name">
              ${shoppingListsData.length - listIndex}) ${list.name}
            </div>
            <div class="shopping-list-store">
              <i class="fas fa-calendar"></i> ${formatDate(list.created_at)}
            </div>
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

        <div class="shopping-list-footer">
          <div class="shopping-list-progress">
            <div class="shopping-list-progress-label">Progress: ${Math.round(progress)}%</div>
            <div class="progress">
              <div class="progress-bar" style="width: ${progress}%"></div>
            </div>
          </div>
        </div>
      </div>
    `
    })
    .join("")

  grid.innerHTML += listCards
}

// Add Shopping List
async function addShoppingList() {
  const name = document.getElementById("shoppingListName").value.trim()

  if (!name) {
    showErrorMessage("Please enter a list name")
    return
  }

  const listData = {
    name: name,
  }

  const [success, response] = await callApi("POST", shoppinglist_url, listData, csrf_token)

  if (success && response.success) {
    await loadShoppingLists()

    const modal = bootstrap.Modal.getInstance(document.getElementById("addShoppingListModal"))
    modal.hide()
    document.getElementById("addShoppingListForm").reset()

    showSuccessMessage("Shopping list created successfully!")
  } else {
    showErrorMessage(response.error || "Failed to create shopping list")
  }
}

// Edit Shopping List
async function editShoppingList(listId) {
  const list = shoppingListsData.find((l) => l.id === listId)
  if (!list) {
    showErrorMessage("Shopping list not found")
    return
  }

  document.getElementById("editShoppingListName").value = list.name
  document.getElementById("editListId").value = list.id

  const editModal = new bootstrap.Modal(document.getElementById("editShoppingListModal"))
  editModal.show()
}

// Save Shopping List Edit
async function saveShoppingListEdit() {
  const listId = document.getElementById("editListId").value
  const name = document.getElementById("editShoppingListName").value.trim()

  if (!name) {
    showErrorMessage("Please enter a list name")
    return
  }

  const listData = {
    name: name,
  }

  const [success, response] = await callApi("PUT", `${shoppinglist_url}${listId}/`, listData, csrf_token)

  if (success && response.success) {
    await loadShoppingLists()

    const modal = bootstrap.Modal.getInstance(document.getElementById("editShoppingListModal"))
    modal.hide()

    showSuccessMessage("Shopping list updated successfully!")
  } else {
    showErrorMessage(response.error || "Failed to update shopping list")
  }
}

// Delete Shopping List
async function deleteShoppingList(listId) {
  if (!confirm("Are you sure you want to delete this shopping list and all its items?")) {
    return
  }

  const [success, response] = await callApi("DELETE", `${shoppinglist_url}${listId}/`, null, csrf_token)

  if (success && response.success) {
    await loadShoppingLists()
    showSuccessMessage("Shopping list deleted successfully!")
  } else {
    showErrorMessage(response.error || "Failed to delete shopping list")
  }
}

// Open Shopping List Modal
async function openShoppingListModal(listId, listPk) {
  currentShoppingListId = listId
  currentShoppingListPk = listPk
  const list = shoppingListsData.find((l) => l.list_id === listId)

  if (list) {
    document.getElementById("shoppingListModalTitle").textContent = list.name

    // Load items for this list
    await loadShoppingListItems(listId)

    const modal = new bootstrap.Modal(document.getElementById("shoppingListItemsModal"))
    modal.show()
  }
}

// Load Shopping List Items
async function loadShoppingListItems(listId) {
  const [success, response] = await callApi("GET", `${shoppinglistitem_url}?list_id=${listId}`, null, csrf_token)

  if (success && response.success) {
    allShoppingItems = response.data
    const container = document.getElementById("shoppingItemsContainer")
    container.innerHTML = ""

    displayedItemsCount = Math.min(ITEMS_PER_PAGE, allShoppingItems.length)
    renderShoppingListItems(allShoppingItems.slice(0, displayedItemsCount))

    updateItemLoadMoreButton()
    updateModalStats()

    const formContainer = document.getElementById("addItemFormContainer")
    const toggleIcon = document.getElementById("addItemToggleIcon")
    if (allShoppingItems.length === 0) {
      formContainer.classList.add("show")
      toggleIcon.classList.remove("fa-chevron-down")
      toggleIcon.classList.add("fa-chevron-up")
    } else {
      formContainer.classList.remove("show")
      toggleIcon.classList.remove("fa-chevron-up")
      toggleIcon.classList.add("fa-chevron-down")
    }
  } else {
    showErrorMessage(response.error || "Failed to load shopping items")
  }
}

// Render Shopping List Items
function renderShoppingListItems(items) {
  const container = document.getElementById("shoppingItemsContainer")

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="text-center py-3">
        <p class="text-muted">No items in this list yet</p>
      </div>
    `
    return
  }

  const itemsHtml = items
    .map((item, index) => {
      const itemIndex = allShoppingItems.findIndex((i) => i.id === item.id)
      return `
    <div class="shopping-item-modal ${item.is_bought ? "bought" : ""}">
      <div class="shopping-item-modal-header">
        <div>
          <div class="shopping-item-modal-name">${itemIndex+1}) ${item.item_name}</div>
          <div class="shopping-item-modal-quantity">${item.quantity} ${item.unit}</div>
        </div>
        <div class="shopping-item-modal-price">
          ${
            item.is_bought && item.bought_amount
              ? `₹${Number.parseFloat(item.bought_amount).toFixed(2)} (paid)`
              : `Not bought`
          }
        </div>
      </div>
      ${
        item.is_bought
          ? `<div class="bought-info">
            <i class="fas fa-check-circle"></i>
            Bought on ${formatDate(item.created_at)}
          </div>`
          : ""
      }
      
      <div class="shopping-item-modal-actions">
        ${
          !item.is_bought
            ? `<button class="btn btn-item-action btn-mark-bought" onclick="markItemBought(${item.id})">
              <i class="fas fa-shopping-cart"></i> Bought
            </button>`
            : ""
        }
        <button class="btn btn-item-action btn-icon-only btn-edit-item" onclick="editShoppingItem(${item.id})" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-item-action btn-icon-only btn-delete-item" onclick="deleteShoppingItem(${item.id})" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `
    })
    .join("")

  container.innerHTML += itemsHtml
}

// Add Item to Current List
async function addItemToCurrentList() {
  if (!currentShoppingListPk) {
    showErrorMessage("No shopping list selected")
    return
  }

  const name = document.getElementById("newItemName").value.trim()
  const quantity = document.getElementById("newItemQuantity").value.trim()
  const unit = document.getElementById("newItemUnit").value

  if (!name || !quantity || !unit) {
    showErrorMessage("Please fill in all item fields")
    return
  }

  const itemData = {
    shopping_list: currentShoppingListPk,
    item_name: name,
    quantity: Number.parseFloat(quantity),
    unit: unit,
    is_bought: false,
  }

  const [success, response] = await callApi("POST", shoppinglistitem_url, itemData, csrf_token)

  if (success && response.success) {
    await loadShoppingListItems(currentShoppingListId)
    await loadShoppingLists()

    document.getElementById("newItemName").value = ""
    document.getElementById("newItemQuantity").value = ""
    document.getElementById("newItemUnit").value = ""

    showSuccessMessage("Item added to shopping list!")
  } else {
    showErrorMessage(response.error || "Failed to add item")
  }
}

// Edit Shopping Item
async function editShoppingItem(itemId) {
  const item = allShoppingItems.find((i) => i.id === itemId)
  if (!item) {
    showErrorMessage("Item not found")
    return
  }

  document.getElementById("editItemId").value = item.id
  document.getElementById("editItemName").value = item.item_name
  document.getElementById("editItemQuantity").value = item.quantity
  document.getElementById("editItemUnit").value = item.unit
  document.getElementById("editItemBoughtAmount").value = item.bought_amount || ""
  document.getElementById("editItemIsBought").checked = item.is_bought

  const editModal = new bootstrap.Modal(document.getElementById("editShoppingItemModal"))
  editModal.show()
}

// Save Shopping Item Edit
async function saveShoppingItemEdit() {
  const itemId = document.getElementById("editItemId").value
  const name = document.getElementById("editItemName").value.trim()
  const quantity = document.getElementById("editItemQuantity").value.trim()
  const unit = document.getElementById("editItemUnit").value.trim()
  const boughtAmount = document.getElementById("editItemBoughtAmount").value.trim()
  const isBought = document.getElementById("editItemIsBought").checked

  if (!name || !quantity || !unit) {
    showErrorMessage("Please fill in all required fields")
    return
  }

  const itemData = {
    item_name: name,
    quantity: Number.parseFloat(quantity),
    unit: unit,
    is_bought: isBought,
    bought_amount: boughtAmount ? Number.parseFloat(boughtAmount) : null,
  }

  const [success, response] = await callApi("PATCH", `${shoppinglistitem_url}${itemId}/`, itemData, csrf_token)

  if (success && response.success) {
    await loadShoppingListItems(currentShoppingListId)
    await loadShoppingLists()

    const modal = bootstrap.Modal.getInstance(document.getElementById("editShoppingItemModal"))
    modal.hide()

    showSuccessMessage("Item updated successfully!")
  } else {
    showErrorMessage(response.error || "Failed to update item")
  }
}

// Delete Shopping Item
async function deleteShoppingItem(itemId) {
  if (!confirm("Are you sure you want to delete this shopping item?")) {
    return
  }

  const [success, response] = await callApi("DELETE", `${shoppinglistitem_url}${itemId}/`, null, csrf_token)

  if (success && response.success) {
    await loadShoppingListItems(currentShoppingListId)
    await loadShoppingLists()
    showSuccessMessage("Shopping item deleted successfully!")
  } else {
    showErrorMessage(response.error || "Failed to delete item")
  }
}

// Mark Item as Bought
async function markItemBought(itemId) {
  const item = allShoppingItems.find((i) => i.id === itemId)
  if (!item) return

  const actualAmount = prompt(`Enter actual amount paid for ${item.item_name}:`, "0")
  if (actualAmount !== null) {
    const itemData = {
      is_bought: true,
      bought_amount: Number.parseFloat(actualAmount),
    }

    const [success, response] = await callApi("PATCH", `${shoppinglistitem_url}${itemId}/`, itemData, csrf_token)

    if (success && response.success) {
      await loadShoppingListItems(currentShoppingListId)
      await loadShoppingLists()
      showSuccessMessage(`${item.item_name} marked as bought!`)
    } else {
      showErrorMessage(response.error || "Failed to mark item as bought")
    }
  }
}

// Update Modal Stats
function updateModalStats() {
  const totalItems = allShoppingItems.length
  const boughtItems = allShoppingItems.filter((item) => item.is_bought).length

  document.getElementById("modalTotalItems").textContent = totalItems
  document.getElementById("modalBoughtItems").textContent = boughtItems
}

// Filter Items in Modal
function filterItemsInModal() {
  const statusFilter = document.getElementById("itemStatusFilter").value
  const searchTerm = document.getElementById("searchItems").value.toLowerCase()

  const filtered = allShoppingItems.filter((item) => {
    const matchesStatus = !statusFilter || (statusFilter === "bought" ? item.is_bought : !item.is_bought)
    const matchesSearch = !searchTerm || item.item_name.toLowerCase().includes(searchTerm)
    return matchesStatus && matchesSearch
  })

  const container = document.getElementById("shoppingItemsContainer")
  container.innerHTML = ""

  displayedItemsCount = Math.min(ITEMS_PER_PAGE, filtered.length)
  renderShoppingListItems(filtered.slice(0, displayedItemsCount))

  // Update for filtered items
  const originalItems = allShoppingItems
  allShoppingItems = filtered
  updateItemLoadMoreButton()
  allShoppingItems = originalItems
}

// Load More Items
function loadMoreItems() {
  const nextBatch = allShoppingItems.slice(displayedItemsCount, displayedItemsCount + ITEMS_PER_PAGE)
  renderShoppingListItems(nextBatch)
  displayedItemsCount += ITEMS_PER_PAGE
  updateItemLoadMoreButton()
}

// Update Item Load More Button
function updateItemLoadMoreButton() {
  const loadMoreContainer = document.getElementById("loadMoreItemsContainer")
  if (displayedItemsCount < allShoppingItems.length) {
    loadMoreContainer.style.display = "block"
  } else {
    loadMoreContainer.style.display = "none"
  }
}

// Load More Lists
function loadMoreLists() {
  const nextBatch = shoppingListsData.slice(displayedListsCount, displayedListsCount + LISTS_PER_PAGE)
  renderShoppingLists(nextBatch)
  displayedListsCount += LISTS_PER_PAGE
  updateLoadMoreButton()
}

// Update Load More Button
function updateLoadMoreButton() {
  const loadMoreContainer = document.getElementById("loadMoreContainer")
  if (displayedListsCount < shoppingListsData.length) {
    loadMoreContainer.style.display = "block"
  } else {
    loadMoreContainer.style.display = "none"
  }
}

// Setup Filters
function setupFilters() {
  document.getElementById("dateFilter").addEventListener("change", filterLists)
  document.getElementById("searchLists").addEventListener("input", filterLists)
}

// Filter Lists
function filterLists() {
  const searchTerm = document.getElementById("searchLists").value.toLowerCase()
  const dateFilter = document.getElementById("dateFilter").value

  const filtered = shoppingListsData.filter((list) => {
    const matchesSearch = !searchTerm || list.name.toLowerCase().includes(searchTerm)

    const listDate = new Date(list.created_at).toLocaleDateString("en-CA")
    const matchesDate = !dateFilter || listDate === dateFilter

    return matchesSearch && matchesDate
  })

  displayedListsCount = 0
  const grid = document.getElementById("shoppingListsGrid")
  grid.innerHTML = ""
  renderShoppingLists(filtered.slice(0, LISTS_PER_PAGE))
  displayedListsCount = Math.min(LISTS_PER_PAGE, filtered.length)

  // Update shoppingListsData temporarily for pagination
  const originalData = shoppingListsData
  shoppingListsData = filtered
  updateLoadMoreButton()
  shoppingListsData = originalData
}

// Clear Filters
function clearFilters() {
  document.getElementById("dateFilter").value = ""
  document.getElementById("searchLists").value = ""
  loadShoppingLists()
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

// Update Total Lists Count
function updateTotalListsCount(count) {
  const totalListsCount = document.getElementById("totalListsCount")
  if (totalListsCount) {
    totalListsCount.textContent = count
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

// Toggle Add Item Form
function toggleAddItemForm() {
  const formContainer = document.getElementById("addItemFormContainer")
  const toggleIcon = document.getElementById("addItemToggleIcon")

  if (formContainer.classList.contains("show")) {
    formContainer.classList.remove("show")
    toggleIcon.classList.remove("fa-chevron-up")
    toggleIcon.classList.add("fa-chevron-down")
  } else {
    formContainer.classList.add("show")
    toggleIcon.classList.remove("fa-chevron-down")
    toggleIcon.classList.add("fa-chevron-up")
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
