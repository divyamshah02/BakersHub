// Profile Data
let profileData = null
let isEditMode = false

let profile_url = null
let csrf_token = null

// Initialize Profile Page
async function initProfile(profile_url_param, csrf_token_param) {
  profile_url = profile_url_param
  csrf_token = csrf_token_param
  
  await loadProfileData()
  setupEditForm()
}

// Load Profile Data from API
async function loadProfileData() {
  const [success, response] = await callApi("GET", profile_url, null, csrf_token)

  if (success && response.success) {
    profileData = response.data.user
    renderProfileCard()
  } else {
    showErrorMessage(response.error || "Failed to load profile data")
  }
}

// Render Profile Card
function renderProfileCard() {
  if (!profileData) return

  // Get initials for avatar
  const initials = getInitials(profileData.name || profileData.company_name || "U")
  document.getElementById("profileAvatar").innerHTML = initials

  // Company Name
  document.getElementById("companyName").textContent = profileData.company_name || "Company Name Not Set"

  // User ID
  document.getElementById("userId").textContent = `ID: ${profileData.user_id || "N/A"}`

  // Name
  document.getElementById("profileName").innerHTML = `
    <i class="fas fa-user"></i>
    <span>${profileData.name || "Name not set"}</span>
  `

  // Email
  document.getElementById("profileEmail").innerHTML = `
    <i class="fas fa-envelope"></i>
    <a href="mailto:${profileData.email || ""}">${profileData.email || "Email not set"}</a>
  `

  // Phone
  const phoneNumber = profileData.contact_number || "N/A"
  document.getElementById("profilePhone").innerHTML = `
    <i class="fas fa-phone"></i>
    <a href="tel:${phoneNumber}">${phoneNumber}</a>
  `

  // Address
  const fullAddress = buildFullAddress(profileData)
  document.getElementById("profileAddress").innerHTML = `
    <div class="profile-info-item mb-0">
      <i class="fas fa-map-marker-alt"></i>
      <span>${fullAddress}</span>
    </div>
  `

  // Status Badge
  // const statusBadge = profileData.active_user 
  //   ? '<span class="profile-badge badge-active"><i class="fas fa-check-circle me-1"></i>Active Account</span>'
  //   : '<span class="profile-badge badge-inactive"><i class="fas fa-times-circle me-1"></i>Inactive Account</span>'
  // document.getElementById("profileStatus").innerHTML = statusBadge

  // Member Since
  const memberSince = formatMemberSince(profileData.created_at)
  document.getElementById("memberSince").textContent = memberSince

  // User Role
  // const role = capitalizeFirst(profileData.role || "user")
  // document.getElementById("userRole").textContent = role
}

// Toggle Edit Mode
function toggleEditMode() {
  isEditMode = !isEditMode
  const editSection = document.getElementById("editSection")
  
  if (isEditMode) {
    // Populate edit form with current data
    document.getElementById("editName").value = profileData.name || ""
    document.getElementById("editEmail").value = profileData.email || ""
    document.getElementById("editPhone").value = profileData.contact_number || ""
    document.getElementById("editCompanyName").value = profileData.company_name || ""
    document.getElementById("editCompanyAddress").value = profileData.company_address || ""
    document.getElementById("editCity").value = profileData.company_city || ""
    document.getElementById("editState").value = profileData.company_state || ""
    document.getElementById("editPincode").value = profileData.company_pincode || ""
    
    editSection.style.display = "block"
    
    // Scroll to edit section
    editSection.scrollIntoView({ behavior: "smooth", block: "nearest" })
  } else {
    editSection.style.display = "none"
  }
}

// Cancel Edit
function cancelEdit() {
  isEditMode = false
  document.getElementById("editSection").style.display = "none"
  document.getElementById("editProfileForm").reset()
}

// Setup Edit Form
function setupEditForm() {
  document.getElementById("editProfileForm").addEventListener("submit", async (e) => {
    e.preventDefault()
    await saveProfileChanges()
  })
}

// Save Profile Changes
async function saveProfileChanges() {
  const updatedData = {
    name: document.getElementById("editName").value.trim(),
    email: document.getElementById("editEmail").value.trim(),
    company_name: document.getElementById("editCompanyName").value.trim(),
    company_address: document.getElementById("editCompanyAddress").value.trim(),
    company_city: document.getElementById("editCity").value.trim(),
    company_state: document.getElementById("editState").value.trim(),
    company_pincode: document.getElementById("editPincode").value.trim(),
  }

  // Validate required fields
  if (!updatedData.name || !updatedData.email) {
    showErrorMessage("Name and Email are required fields")
    return
  }

  // Validate email format
  if (!isValidEmail(updatedData.email)) {
    showErrorMessage("Please enter a valid email address")
    return
  }

  // Validate pincode if provided
  if (updatedData.company_pincode && !/^\d{6}$/.test(updatedData.company_pincode)) {
    showErrorMessage("Pincode must be 6 digits")
    return
  }

  const [success, response] = await callApi(
    "PUT", 
    `${profile_url}${profileData.id}/`, 
    updatedData, 
    csrf_token
  )

  if (success && response.success) {
    showSuccessMessage("Profile updated successfully!")
    await loadProfileData()
    cancelEdit()
  } else {
    showErrorMessage(response.error || "Failed to update profile")
  }
}

// Helper Functions
function getInitials(name) {
  if (!name) return "U"
  const words = name.trim().split(" ")
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  }
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

function buildFullAddress(data) {
  const parts = []
  
  if (data.company_address) parts.push(data.company_address)
  if (data.company_city) parts.push(data.company_city)
  if (data.company_state) parts.push(data.company_state)
  if (data.company_pincode) parts.push(data.company_pincode)
  
  return parts.length > 0 ? parts.join(", ") : "Address not set"
}

function formatMemberSince(dateString) {
  if (!dateString) return "N/A"
  
  const date = new Date(dateString)
  const options = { year: 'numeric', month: 'short' }
  return date.toLocaleDateString('en-US', options)
}

function capitalizeFirst(str) {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
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