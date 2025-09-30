// Profile Data
const profileData = {
  businessName: "Bakers Hub",
  ownerName: "Jane Baker",
  email: "jane@bakershub.com",
  phone: "(555) 123-4567",
  address: "123 Baker Street, Sweet City, SC 12345",
  stats: {
    totalOrders: 156,
    totalRevenue: 12450,
    activeSince: "Jan 2024",
  },
}

// Initialize Profile Page
function initProfile() {
  loadProfileData()
  loadQuickStats()
  setupProfileForm()
  setupMobileNotification()
}

// Load Profile Data
function loadProfileData() {
  document.getElementById("businessName").value = profileData.businessName
  document.getElementById("ownerName").value = profileData.ownerName
  document.getElementById("email").value = profileData.email
  document.getElementById("phone").value = profileData.phone
  document.getElementById("address").value = profileData.address
}

// Load Quick Stats
function loadQuickStats() {
  const container = document.getElementById("quickStats")

  container.innerHTML = `
    <div class="stat-item">
      <div class="d-flex justify-content-between">
        <span>Total Orders</span>
        <strong>${profileData.stats.totalOrders}</strong>
      </div>
    </div>
    <div class="stat-item">
      <div class="d-flex justify-content-between">
        <span>Total Revenue</span>
        <strong>$${profileData.stats.totalRevenue.toLocaleString()}</strong>
      </div>
    </div>
    <div class="stat-item">
      <div class="d-flex justify-content-between">
        <span>Active Since</span>
        <strong>${profileData.stats.activeSince}</strong>
      </div>
    </div>
  `
}

// Setup Profile Form
function setupProfileForm() {
  document.getElementById("profileForm").addEventListener("submit", (e) => {
    e.preventDefault()

    profileData.businessName = document.getElementById("businessName").value
    profileData.ownerName = document.getElementById("ownerName").value
    profileData.email = document.getElementById("email").value
    profileData.phone = document.getElementById("phone").value
    profileData.address = document.getElementById("address").value

    showSuccessMessage("Profile updated successfully!")
  })
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
