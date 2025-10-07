// Import AOS library
const AOS = window.AOS // Declare the AOS variable

document.addEventListener("DOMContentLoaded", () => {
  // Initialize AOS
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 50,
      disable: false,
    })
  }
})

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
const navbar = document.querySelector(".navbar")
let lastScroll = 0

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset

  // Add scrolled class when user scrolls down
  if (currentScroll > 100) {
    navbar.classList.add("scrolled")
  } else {
    navbar.classList.remove("scrolled")
  }

  lastScroll = currentScroll
})

// ============================================
// HERO PARALLAX EFFECT
// ============================================
const heroPhone = document.getElementById("heroPhone")
const heroBg = document.getElementById("heroBg")

window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset

  if (heroPhone && scrolled < window.innerHeight) {
    const parallaxSpeed = 0.3
    const scaleSpeed = 0.0002
    const opacitySpeed = 0.0015
    heroPhone.style.transform = `translateY(${scrolled * parallaxSpeed}px) scale(${1 - scrolled * scaleSpeed})`
    heroPhone.style.opacity = 1 - scrolled * opacitySpeed
  }

  if (heroBg && scrolled < window.innerHeight) {
    const parallaxSpeed = 0.5
    heroBg.style.transform = `translateY(${scrolled * parallaxSpeed}px)`
    heroBg.style.opacity = 1 - scrolled * 0.0015
  }
})

// ============================================
// HORIZONTAL SCROLL FOR SHOWCASE SECTION
// ============================================
const horizontalScroll = document.getElementById("horizontalScroll")
const scrollProgress = document.getElementById("scrollProgress")

if (horizontalScroll && scrollProgress) {
  // Update progress bar on scroll
  horizontalScroll.addEventListener("scroll", () => {
    const scrollWidth = horizontalScroll.scrollWidth - horizontalScroll.clientWidth
    const scrolled = horizontalScroll.scrollLeft
    const progress = (scrolled / scrollWidth) * 100
    scrollProgress.style.width = `${progress}%`
  })

  // Enable mouse wheel horizontal scrolling
  const showcaseSection = document.querySelector(".showcase-section")
  if (showcaseSection) {
    showcaseSection.addEventListener(
      "wheel",
      (e) => {
        // Only hijack vertical scroll for horizontal scrolling
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault()
          horizontalScroll.scrollLeft += e.deltaY
        }
      },
      { passive: false },
    )
  }
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      const offsetTop = target.offsetTop - 80
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      })
    }
  })
})

// ============================================
// BENTO ITEMS 3D HOVER EFFECT
// ============================================
const bentoItems = document.querySelectorAll(".bento-item")

bentoItems.forEach((item) => {
  item.addEventListener("mousemove", (e) => {
    const rect = item.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * 10
    const rotateY = ((centerX - x) / centerX) * 10

    item.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`
  })

  item.addEventListener("mouseleave", () => {
    item.style.transform = ""
  })
})

// ============================================
// ZOOM EFFECT ON SCROLL FOR SHOWCASE IMAGES
// ============================================
const showcasePhones = document.querySelectorAll(".showcase-phone")

const zoomObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.transform = "scale(1)"
        entry.target.style.opacity = "1"
      } else {
        entry.target.style.transform = "scale(0.95)"
        entry.target.style.opacity = "0.7"
      }
    })
  },
  { threshold: 0.2, rootMargin: "0px 0px -50px 0px" },
)

showcasePhones.forEach((phone) => {
  phone.style.transform = "scale(0.95)"
  phone.style.opacity = "0.7"
  phone.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
  zoomObserver.observe(phone)
})

const showcaseSection = document.querySelector(".showcase-section")
if (showcaseSection) {
  window.addEventListener("scroll", () => {
    const rect = showcaseSection.getBoundingClientRect()
    const scrollPercent = (window.innerHeight - rect.top) / (window.innerHeight + rect.height)

    if (scrollPercent > 0 && scrollPercent < 1) {
      showcasePhones.forEach((phone, index) => {
        const delay = index * 0.1
        const translateY = (scrollPercent - 0.5) * 50 * (1 - delay)
        phone.style.transform = `translateY(${translateY}px) scale(${scrollPercent > 0.3 ? 1 : 0.95})`
      })
    }
  })
}

// ============================================
// WAITLIST FORM SUBMISSION
// ============================================
const waitlistForm = document.getElementById("waitlistForm")

if (waitlistForm) {
  waitlistForm.addEventListener("submit", (e) => {
    e.preventDefault()

    // Get form data
    const formData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      business: document.getElementById("business").value,
    }

    // Log form data (for testing)
    console.log("[v0] Waitlist submission:", formData)

    // Show success message
    alert("🎉 Thank you for joining the waitlist! We'll be in touch soon.")

    // Reset form
    waitlistForm.reset()

    // ============================================
    // DJANGO INTEGRATION (Uncomment when ready)
    // ============================================
    /*
        fetch('/api/waitlist/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            alert('🎉 Thank you for joining the waitlist!');
            waitlistForm.reset();
        })
        .catch(error => {
            console.error('[v0] Error:', error);
            alert('Something went wrong. Please try again.');
        });
        */
  })
}

// ============================================
// UTILITY FUNCTION FOR DJANGO CSRF TOKEN
// ============================================
function getCookie(name) {
  let cookieValue = null
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";")
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
        break
      }
    }
  }
  return cookieValue
}

// ============================================
// PAGE LOAD ANIMATION
// ============================================
window.addEventListener("load", () => {
  document.body.classList.add("loaded")
})

// ============================================
// MOBILE MENU CLOSE ON LINK CLICK
// ============================================
const navLinks = document.querySelectorAll(".nav-link")
const navbarToggler = document.querySelector(".navbar-toggler")
const navbarCollapse = document.querySelector(".navbar-collapse")

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (navbarCollapse.classList.contains("show")) {
      navbarToggler.click()
    }
  })
})

// ============================================
// HERO STATS REVEAL ANIMATION
// ============================================
const statNumbers = document.querySelectorAll(".stat-number")

const animateCounter = (element) => {
  const target = element.getAttribute("data-target")

  if (target) {
    const targetNumber = Number.parseInt(target)
    const duration = 2000
    const steps = 60
    const increment = targetNumber / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= targetNumber) {
        element.textContent = targetNumber.toLocaleString() + "+"
        clearInterval(timer)
      } else {
        element.textContent = Math.floor(current).toLocaleString()
      }
    }, duration / steps)
  }
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target)
        statsObserver.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.5 },
)

statNumbers.forEach((stat) => {
  if (stat.getAttribute("data-target")) {
    statsObserver.observe(stat)
  }
})

// ============================================
// INTERACTIVE DASHBOARD METRICS ANIMATION
// ============================================
const metricValues = document.querySelectorAll(".metric-value")

const animateMetric = (element) => {
  const target = element.getAttribute("data-count")

  if (target) {
    const targetNumber = Number.parseInt(target)
    const duration = 2000
    const steps = 60
    const increment = targetNumber / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= targetNumber) {
        if (targetNumber >= 1000) {
          element.textContent = "₹" + targetNumber.toLocaleString()
        } else {
          element.textContent = targetNumber
        }
        clearInterval(timer)
      } else {
        if (targetNumber >= 1000) {
          element.textContent = "₹" + Math.floor(current).toLocaleString()
        } else {
          element.textContent = Math.floor(current)
        }
      }
    }, duration / steps)
  }
}

const metricsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateMetric(entry.target)
        metricsObserver.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.5 },
)

metricValues.forEach((metric) => {
  if (metric.getAttribute("data-count")) {
    metricsObserver.observe(metric)
  }
})

// ============================================
// INTERACTIVE DEMO - Live Order Preview
// ============================================
const demoForm = document.getElementById("demoOrderForm")
const demoCustomer = document.getElementById("demoCustomer")
const demoProduct = document.getElementById("demoProduct")
const demoAmount = document.getElementById("demoAmount")
const previewCustomer = document.getElementById("previewCustomer")
const previewProduct = document.getElementById("previewProduct")
const previewAmount = document.getElementById("previewAmount")
const previewOrder = document.getElementById("previewOrder")

// Update preview in real-time
if (demoCustomer && previewCustomer) {
  demoCustomer.addEventListener("input", (e) => {
    previewCustomer.textContent = e.target.value || "Customer Name"
  })
}

if (demoProduct && previewProduct) {
  demoProduct.addEventListener("input", (e) => {
    previewProduct.textContent = e.target.value || "Product Name"
  })
}

if (demoAmount && previewAmount) {
  demoAmount.addEventListener("input", (e) => {
    const amount = e.target.value || "0"
    previewAmount.textContent = "₹" + Number.parseInt(amount).toLocaleString() + ".00"
  })
}

// Form submission animation
if (demoForm && previewOrder) {
  demoForm.addEventListener("submit", (e) => {
    e.preventDefault()

    // Animate the preview card
    previewOrder.style.transform = "scale(1.05)"
    previewOrder.style.borderColor = "var(--primary)"
    previewOrder.style.boxShadow = "var(--shadow-xl)"

    setTimeout(() => {
      previewOrder.style.transform = "scale(1)"
      alert("🎉 Order added successfully! This is how easy it is with Bakers Hub.")
    }, 300)
  })
}

// ============================================
// INTERACTIVE ORDER BUTTONS
// ============================================
const orderButtons = document.querySelectorAll(".mini-order-btn.pending")

orderButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault()
    const button = e.target

    // Animate to completed
    button.classList.remove("pending")
    button.classList.add("completed")
    button.textContent = "✓ COMPLETED"

    // Add celebration effect
    button.style.transform = "scale(1.1)"
    setTimeout(() => {
      button.style.transform = "scale(1)"
    }, 300)
  })
})

// ============================================
// INTERACTIVE SHOPPING LIST
// ============================================
const shoppingCheckboxes = document.querySelectorAll(".shopping-checkbox")

shoppingCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", (e) => {
    const item = e.target.closest(".shopping-item")
    if (e.target.checked) {
      item.setAttribute("data-checked", "true")
      item.style.transform = "translateX(8px)"
      setTimeout(() => {
        item.style.transform = "translateX(0)"
      }, 300)
    } else {
      item.setAttribute("data-checked", "false")
    }
  })
})

// ============================================
// INTERACTIVE CALENDAR DATES
// ============================================
const calendarDates = document.querySelectorAll(".calendar-date.has-event")

calendarDates.forEach((date) => {
  date.addEventListener("click", (e) => {
    const event = e.target.getAttribute("data-event")
    if (event) {
      alert(`📅 ${event}`)
    }
  })
})

// ============================================
// PARALLAX EFFECT FOR COMPARISON SECTION
// ============================================
const comparisonSection = document.querySelector(".comparison-section")

if (comparisonSection) {
  window.addEventListener("scroll", () => {
    const rect = comparisonSection.getBoundingClientRect()
    const scrollPercent = (window.innerHeight - rect.top) / (window.innerHeight + rect.height)

    if (scrollPercent > 0 && scrollPercent < 1) {
      const beforeSide = comparisonSection.querySelector(".comparison-side.before")
      const afterSide = comparisonSection.querySelector(".comparison-side.after")

      if (beforeSide && afterSide) {
        const translateX = (scrollPercent - 0.5) * 30
        beforeSide.style.transform = `translateX(${-translateX}px)`
        afterSide.style.transform = `translateX(${translateX}px)`
      }
    }
  })
}

// ============================================
// FORM SUBMISSIONS - Orders and Expenses
// ============================================
const addOrderForm = document.getElementById("addOrderForm")
const addExpenseForm = document.getElementById("addExpenseForm")

if (addOrderForm) {
  addOrderForm.addEventListener("submit", (e) => {
    e.preventDefault()
    console.log("[v0] Order form submitted")
    alert("🎉 Order added successfully! This is a demo - in the real app, this would save to your database.")
    addOrderForm.reset()
  })
}

if (addExpenseForm) {
  addExpenseForm.addEventListener("submit", (e) => {
    e.preventDefault()
    console.log("[v0] Expense form submitted")
    alert("💰 Expense added successfully! This is a demo - in the real app, this would save to your database.")
    addExpenseForm.reset()
  })
}

// ============================================
// FILE INPUT - Show selected file name
// ============================================
const billUpload = document.getElementById("billUpload")
if (billUpload) {
  billUpload.addEventListener("change", (e) => {
    const fileName = e.target.files[0]?.name || "No file chosen"
    const placeholder = e.target.parentElement.querySelector(".file-input-placeholder")
    if (placeholder) {
      placeholder.textContent = fileName
    }
  })
}

// ============================================
// ADD ITEM BUTTON - Clone order item group
// ============================================
const addItemBtns = document.querySelectorAll(".add-item-btn")
addItemBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const orderItemGroup = btn.previousElementSibling
    if (orderItemGroup && orderItemGroup.classList.contains("order-item-group")) {
      const clone = orderItemGroup.cloneNode(true)
      // Clear input values
      clone.querySelectorAll("input").forEach((input) => (input.value = ""))
      // Update product number
      const label = clone.querySelector("label")
      if (label) {
        const currentNum = Number.parseInt(label.textContent.match(/\d+/)[0])
        label.textContent = label.textContent.replace(/\d+/, currentNum + 1)
      }
      // Insert before add button
      btn.parentElement.insertBefore(clone, btn)
      // Add delete functionality to new clone
      const deleteBtn = clone.querySelector(".delete-item-btn")
      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          clone.remove()
        })
      }
    }
  })
})

// ============================================
// DELETE ITEM BUTTONS
// ============================================
const deleteItemBtns = document.querySelectorAll(".delete-item-btn")
deleteItemBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const itemGroup = btn.closest(".order-item-group")
    if (itemGroup) {
      itemGroup.style.transform = "scale(0.9)"
      itemGroup.style.opacity = "0"
      setTimeout(() => {
        itemGroup.remove()
      }, 300)
    }
  })
})

// ============================================
// ENHANCED PARALLAX FOR HERO PHONE
// ============================================
const heroPhoneWrapper = document.getElementById("heroPhone")

window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset

  if (heroPhoneWrapper && scrolled < window.innerHeight) {
    const parallaxSpeed = 0.4
    const scaleSpeed = 0.0003
    const opacitySpeed = 0.002
    const rotateSpeed = 0.02

    heroPhoneWrapper.style.transform = `
      translateY(${scrolled * parallaxSpeed}px) 
      scale(${1 - scrolled * scaleSpeed})
      rotateX(${scrolled * rotateSpeed}deg)
    `
    heroPhoneWrapper.style.opacity = 1 - scrolled * opacitySpeed
  }

  if (heroBg && scrolled < window.innerHeight) {
    const parallaxSpeed = 0.6
    heroBg.style.transform = `translateY(${scrolled * parallaxSpeed}px) scale(${1 + scrolled * 0.0002})`
    heroBg.style.opacity = 1 - scrolled * 0.002
  }
})

// ============================================
// ENHANCED ZOOM EFFECT FOR APP SCREENS
// ============================================
const appScreens = document.querySelectorAll(".app-screen-mockup")

const screenZoomObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.transform = "scale(1) translateY(0)"
        entry.target.style.opacity = "1"
      } else {
        entry.target.style.transform = "scale(0.92) translateY(20px)"
        entry.target.style.opacity = "0.6"
      }
    })
  },
  { threshold: 0.2, rootMargin: "0px 0px -100px 0px" },
)

appScreens.forEach((screen) => {
  screen.style.transform = "scale(0.92) translateY(20px)"
  screen.style.opacity = "0.6"
  screen.style.transition = "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
  screenZoomObserver.observe(screen)
})

// ============================================
// ENHANCED ZOOM EFFECT FOR FORM CARDS
// ============================================
const formCards = document.querySelectorAll(".feature-form-card")

const formZoomObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.transform = "scale(1) translateY(0)"
        entry.target.style.opacity = "1"
      } else {
        entry.target.style.transform = "scale(0.92) translateY(20px)"
        entry.target.style.opacity = "0.6"
      }
    })
  },
  { threshold: 0.2, rootMargin: "0px 0px -100px 0px" },
)

formCards.forEach((card) => {
  card.style.transform = "scale(0.92) translateY(20px)"
  card.style.opacity = "0.6"
  card.style.transition = "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
  formZoomObserver.observe(card)
})

// ============================================
// ENHANCED ZOOM EFFECT FOR ORDERS & EXPENSES SECTIONS
// ============================================
const ordersContainer = document.querySelector(".orders-list-container")
const expensesContainer = document.querySelector(".expenses-list-container")
const formPreviewContainers = document.querySelectorAll(".form-preview-container")

const containerZoomObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.transform = "scale(1) translateY(0)"
        entry.target.style.opacity = "1"
      } else {
        entry.target.style.transform = "scale(0.95) translateY(30px)"
        entry.target.style.opacity = "0.7"
      }
    })
  },
  { threshold: 0.15, rootMargin: "0px 0px -80px 0px" },
)

if (ordersContainer) {
  ordersContainer.style.transform = "scale(0.95) translateY(30px)"
  ordersContainer.style.opacity = "0.7"
  ordersContainer.style.transition = "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
  containerZoomObserver.observe(ordersContainer)
}

if (expensesContainer) {
  expensesContainer.style.transform = "scale(0.95) translateY(30px)"
  expensesContainer.style.opacity = "0.7"
  expensesContainer.style.transition = "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
  containerZoomObserver.observe(expensesContainer)
}

formPreviewContainers.forEach((container) => {
  container.style.transform = "scale(0.95) translateY(30px)"
  container.style.opacity = "0.7"
  container.style.transition = "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
  containerZoomObserver.observe(container)
})

// ============================================
// ENHANCED PARALLAX FOR APP MOCKUP IN HERO
// ============================================
const appMockup = document.querySelector(".app-mockup")

if (appMockup) {
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset
    const heroSection = document.querySelector(".hero-section")

    if (heroSection && scrolled < window.innerHeight) {
      const scrollPercent = scrolled / window.innerHeight
      const rotateX = scrollPercent * 15
      const translateY = scrolled * 0.3
      const scale = 1 - scrollPercent * 0.1

      appMockup.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        translateY(${translateY}px)
        scale(${scale})
      `
      appMockup.style.opacity = 1 - scrollPercent * 0.5
    }
  })
}

// ============================================
// INTERACTIVE ORDER STATUS BUTTONS
// ============================================
const orderStatusButtons = document.querySelectorAll(".order-status-btn")

orderStatusButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault()
    const button = e.target

    if (button.classList.contains("pending")) {
      // Change to completed
      button.classList.remove("pending")
      button.classList.add("completed")
      button.textContent = "✓ COMPLETED"

      // Celebration animation
      button.style.transform = "scale(1.1)"
      setTimeout(() => {
        button.style.transform = "scale(1)"
      }, 300)

      // Show success message
      const orderItem = button.closest(".order-item")
      if (orderItem) {
        const customerName = orderItem.querySelector(".order-customer-name")?.textContent || "Order"
        console.log(`[v0] ${customerName} marked as completed`)
      }
    } else if (button.classList.contains("completed")) {
      // Change back to pending
      button.classList.remove("completed")
      button.classList.add("pending")
      button.textContent = "PENDING"

      button.style.transform = "scale(0.95)"
      setTimeout(() => {
        button.style.transform = "scale(1)"
      }, 300)
    }
  })
})

// ============================================
// SMOOTH SCROLL REVEAL FOR ORDER/EXPENSE ITEMS
// ============================================
const orderItems = document.querySelectorAll(".order-item")
const expenseItems = document.querySelectorAll(".expense-item")

const itemRevealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.transform = "translateX(0)"
          entry.target.style.opacity = "1"
        }, index * 100)
        itemRevealObserver.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.1 },
)

orderItems.forEach((item) => {
  item.style.transform = "translateX(-30px)"
  item.style.opacity = "0"
  item.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
  itemRevealObserver.observe(item)
})

expenseItems.forEach((item) => {
  item.style.transform = "translateX(-30px)"
  item.style.opacity = "0"
  item.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
  itemRevealObserver.observe(item)
})

// ============================================
// ANIMATED EXPENSE CHART BARS
// ============================================
const chartFills = document.querySelectorAll(".chart-fill")

const chartObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const fill = entry.target
        const targetWidth = fill.style.width
        fill.style.width = "0%"

        setTimeout(() => {
          fill.style.width = targetWidth
        }, 300)

        chartObserver.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.5 },
)

chartFills.forEach((fill) => {
  chartObserver.observe(fill)
})

// ============================================
// MOBILE TOUCH GESTURES FOR HORIZONTAL SCROLL
// ============================================
if (horizontalScroll) {
  let isDown = false
  let startX
  let scrollLeft

  horizontalScroll.addEventListener("mousedown", (e) => {
    isDown = true
    horizontalScroll.style.cursor = "grabbing"
    startX = e.pageX - horizontalScroll.offsetLeft
    scrollLeft = horizontalScroll.scrollLeft
  })

  document.addEventListener("mousemove", (e) => {
    if (isDown) {
      e.preventDefault()
      const x = e.pageX - horizontalScroll.offsetLeft
      const walk = (x - startX) * 2
      horizontalScroll.scrollLeft = scrollLeft - walk
    }
  })

  document.addEventListener("mouseup", () => {
    isDown = false
    horizontalScroll.style.cursor = "grab"
  })

  horizontalScroll.addEventListener("touchstart", (e) => {
    isDown = true
    startX = e.touches[0].pageX - horizontalScroll.offsetLeft
    scrollLeft = horizontalScroll.scrollLeft
  })

  document.addEventListener("touchmove", (e) => {
    if (isDown && e.touches[0]) {
      e.preventDefault()
      const x = e.touches[0].pageX - horizontalScroll.offsetLeft
      const walk = (x - startX) * 2
      horizontalScroll.scrollLeft = scrollLeft - walk
    }
  })

  document.addEventListener("touchend", () => {
    isDown = false
  })
}

// ============================================
// FORM MOCKUP HOVER EFFECTS
// ============================================
const formMockups = document.querySelectorAll(".form-mockup")

formMockups.forEach((mockup) => {
  mockup.addEventListener("mouseenter", () => {
    mockup.style.transform = "scale(1.02)"
    mockup.style.boxShadow = "var(--shadow-xl)"
  })

  mockup.addEventListener("mouseleave", () => {
    mockup.style.transform = "scale(1)"
    mockup.style.boxShadow = ""
  })
})

// ============================================
// ROI CALCULATOR - INTERACTIVE CALCULATIONS
// ============================================
const ordersPerMonth = document.getElementById("ordersPerMonth")
const avgOrderValue = document.getElementById("avgOrderValue")
const timePerOrder = document.getElementById("timePerOrder")
const monthlyRevenue = document.getElementById("monthlyRevenue")
const timeSaved = document.getElementById("timeSaved")
const extraOrders = document.getElementById("extraOrders")
const yearlyGrowth = document.getElementById("yearlyGrowth")
const roiMultiplier = document.getElementById("roiMultiplier")

function calculateBakerROI() {
  if (!ordersPerMonth || !avgOrderValue || !timePerOrder) return

  const orders = Number.parseInt(ordersPerMonth.value) || 30
  const orderValue = Number.parseInt(avgOrderValue.value) || 2000
  const timePerOrderMin = Number.parseInt(timePerOrder.value) || 15

  // Calculate metrics
  const revenue = orders * orderValue
  const timeSavedHours = Math.round((orders * timePerOrderMin * 0.7) / 60) // 70% time saved
  const extraOrdersCount = Math.round(timeSavedHours / (timePerOrderMin / 60))
  const yearlyRevenueGrowth = (revenue + extraOrdersCount * orderValue) * 12
  const growthPercent = Math.round((extraOrdersCount / orders) * 100)

  // Update UI
  if (monthlyRevenue) monthlyRevenue.textContent = `₹${revenue.toLocaleString()}`
  if (timeSaved) timeSaved.textContent = `${timeSavedHours} hours`
  if (extraOrders) extraOrders.textContent = `+${extraOrdersCount} orders`
  if (yearlyGrowth) yearlyGrowth.textContent = `₹${(yearlyRevenueGrowth / 100000).toFixed(1)}L`
  if (roiMultiplier) roiMultiplier.textContent = `${growthPercent}%`
}

// Add event listeners for baker ROI calculator
if (ordersPerMonth) ordersPerMonth.addEventListener("input", calculateBakerROI)
if (avgOrderValue) avgOrderValue.addEventListener("input", calculateBakerROI)
if (timePerOrder) timePerOrder.addEventListener("input", calculateBakerROI)

// Initial calculation
calculateBakerROI()

// ============================================
// ============================================
const beforeAfterSlider = document.getElementById("beforeAfterSlider")
const beforeSide = document.getElementById("beforeSide")
const beforeAfterWrapper = document.getElementById("beforeAfterWrapper")

if (beforeAfterSlider && beforeSide && beforeAfterWrapper) {
  let isDragging = false

  function updateSlider(clientX, clientY) {
    const rect = beforeAfterWrapper.getBoundingClientRect()
    const isMobile = window.innerWidth <= 767

    if (isMobile) {
      // Vertical slider for mobile
      const y = clientY - rect.top
      const percent = (y / rect.height) * 100
      const clampedPercent = Math.max(0, Math.min(100, percent))

      beforeAfterSlider.style.top = `${clampedPercent}%`
      beforeSide.style.clipPath = `inset(0 0 ${100 - clampedPercent}% 0)`
    } else {
      // Horizontal slider for desktop
      const x = clientX - rect.left
      const percent = (x / rect.width) * 100
      const clampedPercent = Math.max(0, Math.min(100, percent))

      beforeAfterSlider.style.left = `${clampedPercent}%`
      beforeSide.style.clipPath = `inset(0 ${100 - clampedPercent}% 0 0)`
    }
  }

  // Mouse events
  beforeAfterSlider.addEventListener("mousedown", (e) => {
    isDragging = true
    e.preventDefault()
  })

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      updateSlider(e.clientX, e.clientY)
    }
  })

  document.addEventListener("mouseup", () => {
    isDragging = false
  })

  // Touch events for mobile
  beforeAfterSlider.addEventListener("touchstart", (e) => {
    isDragging = true
    e.preventDefault()
  })

  document.addEventListener("touchmove", (e) => {
    if (isDragging && e.touches[0]) {
      updateSlider(e.touches[0].clientX, e.touches[0].clientY)
    }
  })

  document.addEventListener("touchend", () => {
    isDragging = false
  })
}

// ============================================
// ============================================
const startBakerSimulation = document.getElementById("startBakerSimulation")
const resetBakerSimulation = document.getElementById("resetBakerSimulation")
const bakerTotalOrders = document.getElementById("bakerTotalOrders")
const bakerRevenue = document.getElementById("bakerRevenue")
const bakerProfit = document.getElementById("bakerProfit")

let bakerSimInterval
let bakerOrderCount = 0
let bakerTotalRev = 0
let bakerTotalExp = 0

const sampleBakerOrders = [
  { customer: "Ronak Patel", phone: "+91 98765 43210", product: "Chocolate Cake (1 Kg)", amount: 2500 },
  { customer: "Ananya Desai", phone: "+91 98765 12345", product: "Vanilla Cupcakes (12 pcs)", amount: 800 },
  { customer: "Divyam Shah", phone: "+91 98765 67890", product: "Red Velvet Cake (2 Kg)", amount: 4500 },
]

const sampleBakerExpenses = [
  { name: "Flour", category: "Raw Material", amount: 450, quantity: 5 },
  { name: "Butter", category: "Raw Material", amount: 380, quantity: 2 },
  { name: "Cake Boxes", category: "Packaging", amount: 120, quantity: 10 },
]

let currentOrderIndex = 0
let currentExpenseIndex = 0

function fillOrderForm(order) {
  const fields = [
    { id: "autoCustomerName", value: order.customer, delay: 0 },
    { id: "autoPhone", value: order.phone, delay: 500 },
    { id: "autoProduct", value: order.product, delay: 1000 },
    { id: "autoAmount", value: `₹${order.amount.toLocaleString()}`, delay: 1500 },
  ]

  fields.forEach((field) => {
    setTimeout(() => {
      const input = document.getElementById(field.id)
      if (input) {
        input.value = field.value
        input.style.background = "#e8f5e9"
      }
    }, field.delay)
  })

  // Activate submit button
  setTimeout(() => {
    const btn = document.getElementById("autoAddOrder")
    if (btn) {
      btn.classList.add("active")
      btn.textContent = "Order Added!"
      btn.style.background = "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)"
    }

    // Update stats
    bakerOrderCount++
    bakerTotalRev += order.amount

    if (bakerTotalOrders) bakerTotalOrders.textContent = bakerOrderCount
    if (bakerRevenue) bakerRevenue.textContent = `₹${bakerTotalRev.toLocaleString()}`
    if (bakerProfit) bakerProfit.textContent = `₹${(bakerTotalRev - bakerTotalExp).toLocaleString()}`

    // Reset form after 2 seconds
    setTimeout(() => {
      fields.forEach((field) => {
        const input = document.getElementById(field.id)
        if (input) {
          input.value = ""
          input.style.background = ""
        }
      })
      if (btn) {
        btn.classList.remove("active")
        btn.textContent = "Adding Order..."
        btn.style.background = ""
      }
    }, 2000)
  }, 2000)
}

function fillExpenseForm(expense) {
  const fields = [
    { id: "autoExpenseName", value: expense.name, delay: 0 },
    { id: "autoCategory", value: expense.category, delay: 500 },
    { id: "autoExpenseAmount", value: `₹${expense.amount}`, delay: 1000 },
    { id: "autoQuantity", value: expense.quantity, delay: 1500 },
  ]

  fields.forEach((field) => {
    setTimeout(() => {
      const input = document.getElementById(field.id)
      if (input) {
        input.value = field.value
        input.style.background = "#ffebee"
      }
    }, field.delay)
  })

  // Activate submit button
  setTimeout(() => {
    const btn = document.getElementById("autoAddExpense")
    if (btn) {
      btn.classList.add("active")
      btn.textContent = "Expense Added!"
      btn.style.background = "linear-gradient(135deg, #f44336 0%, #c62828 100%)"
    }

    // Update stats
    bakerTotalExp += expense.amount * expense.quantity

    if (bakerProfit) bakerProfit.textContent = `₹${(bakerTotalRev - bakerTotalExp).toLocaleString()}`

    // Reset form after 2 seconds
    setTimeout(() => {
      fields.forEach((field) => {
        const input = document.getElementById(field.id)
        if (input) {
          input.value = ""
          input.style.background = ""
        }
      })
      if (btn) {
        btn.classList.remove("active")
        btn.textContent = "Adding Expense..."
        btn.style.background = ""
      }
    }, 2000)
  }, 2000)
}

function runBakerSimulation() {
  if (currentOrderIndex < sampleBakerOrders.length) {
    fillOrderForm(sampleBakerOrders[currentOrderIndex])
    currentOrderIndex++
  }

  setTimeout(() => {
    if (currentExpenseIndex < sampleBakerExpenses.length) {
      fillExpenseForm(sampleBakerExpenses[currentExpenseIndex])
      currentExpenseIndex++
    }
  }, 2500)
}

function startBakerSim() {
  if (bakerSimInterval) return

  startBakerSimulation.disabled = true
  startBakerSimulation.textContent = "Simulation Running..."

  // Run first cycle immediately
  runBakerSimulation()

  // Run every 6 seconds
  bakerSimInterval = setInterval(() => {
    if (currentOrderIndex >= sampleBakerOrders.length && currentExpenseIndex >= sampleBakerExpenses.length) {
      stopBakerSim()
      return
    }
    runBakerSimulation()
  }, 6000)
}

function stopBakerSim() {
  if (bakerSimInterval) {
    clearInterval(bakerSimInterval)
    bakerSimInterval = null
  }
  startBakerSimulation.disabled = false
  startBakerSimulation.textContent = "Start Simulation"
}

function resetBakerSim() {
  stopBakerSim()

  // Reset all fields
  const orderFields = ["autoCustomerName", "autoPhone", "autoProduct", "autoAmount"]
  const expenseFields = ["autoExpenseName", "autoCategory", "autoExpenseAmount", "autoQuantity"]

  orderFields.forEach((id) => {
    const input = document.getElementById(id)
    if (input) {
      input.value = ""
      input.style.background = ""
    }
  })

  expenseFields.forEach((id) => {
    const input = document.getElementById(id)
    if (input) {
      input.value = ""
      input.style.background = ""
    }
  })

  // Reset stats
  bakerOrderCount = 0
  bakerTotalRev = 0
  bakerTotalExp = 0
  currentOrderIndex = 0
  currentExpenseIndex = 0

  if (bakerTotalOrders) bakerTotalOrders.textContent = "0"
  if (bakerRevenue) bakerRevenue.textContent = "₹0"
  if (bakerProfit) bakerProfit.textContent = "₹0"

  // Reset buttons
  const orderBtn = document.getElementById("autoAddOrder")
  const expenseBtn = document.getElementById("autoAddExpense")

  if (orderBtn) {
    orderBtn.classList.remove("active")
    orderBtn.textContent = "Adding Order..."
    orderBtn.style.background = ""
  }

  if (expenseBtn) {
    expenseBtn.classList.remove("active")
    expenseBtn.textContent = "Adding Expense..."
    expenseBtn.style.background = ""
  }
}

if (startBakerSimulation) {
  startBakerSimulation.addEventListener("click", startBakerSim)
}

if (resetBakerSimulation) {
  resetBakerSimulation.addEventListener("click", resetBakerSim)
}

const cards3d = document.querySelectorAll(".card-3d")

cards3d.forEach((card) => {
  card.addEventListener("click", () => {
    card.classList.toggle("flipped")
  })
})

const explorerHotspots = document.querySelectorAll(".explorer-hotspot")
const featureTitle = document.getElementById("featureTitle")
const featureDescription = document.getElementById("featureDescription")
const featureList = document.getElementById("featureList")

const featureData = {
  dashboard: {
    title: "Dashboard Overview",
    description: "Get a complete view of your business at a glance",
    features: [
      "Real-time profit tracking",
      "Total orders count",
      "Revenue analytics",
      "Quick insights",
      "Performance metrics",
    ],
  },
  orders: {
    title: "Order Management",
    description: "Track and manage all your orders in one place",
    features: [
      "Customer details",
      "Order status tracking",
      "Due date reminders",
      "Product information",
      "Payment tracking",
    ],
  },
  navigation: {
    title: "Easy Navigation",
    description: "Access all features with a single tap",
    features: ["Shopping lists", "Expense tracking", "Home dashboard", "Order management", "Profile settings"],
  },
}

explorerHotspots.forEach((hotspot) => {
  hotspot.addEventListener("click", () => {
    const feature = hotspot.getAttribute("data-feature")
    const data = featureData[feature]

    if (data && featureTitle && featureDescription && featureList) {
      featureTitle.textContent = data.title
      featureDescription.textContent = data.description

      featureList.innerHTML = ""
      data.features.forEach((item) => {
        const li = document.createElement("li")
        li.textContent = `✓ ${item}`
        featureList.appendChild(li)
      })

      // Highlight effect
      hotspot.style.background = "rgba(139, 111, 71, 0.2)"
      setTimeout(() => {
        hotspot.style.background = ""
      }, 1000)
    }
  })
})

console.log("[v0] Fixed Before/After Slider: ✓")
console.log("[v0] Baker Simulation with Auto-Fill: ✓")
console.log("[v0] 3D Card Flip Showcase: ✓")
console.log("[v0] Animated Infographic: ✓")
console.log("[v0] Interactive Feature Explorer: ✓")
console.log("[v0] All new innovative features loaded!")

// ============================================
// ============================================
const startSimulation = document.getElementById("startSimulation")
const resetSimulation = document.getElementById("resetSimulation")
const incomingOrders = document.getElementById("incomingOrders")
const simulationOrders = document.getElementById("simulationOrders")
const simOrderCount = document.getElementById("simOrderCount")
const simRevenue = document.getElementById("simRevenue")
const simCompleted = document.getElementById("simCompleted")

let simulationInterval
let orderCount = 0
let totalRevenue = 0
let completedCount = 0

const sampleOrders = [
  { customer: "Priya Sharma", product: "Chocolate Cake (1 Kg)", amount: 2500 },
  { customer: "Ronak Patel", product: "Vanilla Cupcakes (12 pcs)", amount: 800 },
  { customer: "Ananya Desai", product: "Red Velvet Cake (2 Kg)", amount: 4500 },
  { customer: "Divyam Shah", product: "Brownie Box (6 pcs)", amount: 600 },
  { customer: "Snehi Shah", product: "Strawberry Cake (1.5 Kg)", amount: 3200 },
  { customer: "Riya Mehta", product: "Chocolate Cookies (20 pcs)", amount: 1200 },
]

function createOrderNotification(order) {
  const notification = document.createElement("div")
  notification.className = "incoming-order-notification"
  notification.innerHTML = `
    <div class="notification-header">
      <div class="notification-icon">🔔</div>
      <div class="notification-title">New Order!</div>
    </div>
    <div class="notification-customer">${order.customer}</div>
    <div class="notification-amount">₹${order.amount.toLocaleString()}</div>
  `
  return notification
}

function createOrderCard(order) {
  const card = document.createElement("div")
  card.className = "sim-order-card"
  card.innerHTML = `
    <div class="sim-order-header">
      <div class="sim-order-customer">${order.customer}</div>
      <div class="sim-order-amount">₹${order.amount.toLocaleString()}</div>
    </div>
    <div class="sim-order-product">${order.product}</div>
    <div class="sim-order-status">PENDING</div>
  `
  return card
}

function addOrder() {
  if (orderCount >= sampleOrders.length) {
    stopSimulation()
    return
  }

  const order = sampleOrders[orderCount]

  // Show notification
  const notification = createOrderNotification(order)
  incomingOrders.appendChild(notification)

  // Remove notification after 5 seconds
  setTimeout(() => {
    notification.remove()
  }, 5000)

  // Add to orders list
  const emptyState = simulationOrders.querySelector(".sim-empty-state")
  if (emptyState) {
    emptyState.remove()
  }

  const orderCard = createOrderCard(order)
  simulationOrders.insertBefore(orderCard, simulationOrders.firstChild)

  // Update stats
  orderCount++
  totalRevenue += order.amount

  if (simOrderCount) simOrderCount.textContent = orderCount
  if (simRevenue) simRevenue.textContent = `₹${totalRevenue.toLocaleString()}`
  if (simCompleted) simCompleted.textContent = completedCount

  // Simulate completion after 3 seconds
  setTimeout(() => {
    const status = orderCard.querySelector(".sim-order-status")
    if (status) {
      status.textContent = "COMPLETED"
      status.style.background = "linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)"
      status.style.color = "#1b5e20"
      completedCount++
      if (simCompleted) simCompleted.textContent = completedCount
    }
  }, 3000)
}

function startOrderSimulation() {
  if (simulationInterval) return

  startSimulation.disabled = true
  startSimulation.textContent = "Simulation Running..."

  // Add first order immediately
  addOrder()

  // Add new order every 4 seconds
  simulationInterval = setInterval(() => {
    addOrder()
  }, 4000)
}

function stopSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval)
    simulationInterval = null
  }
  startSimulation.disabled = false
  startSimulation.textContent = "Start Simulation"
}

function resetOrderSimulation() {
  stopSimulation()

  // Clear orders
  simulationOrders.innerHTML = `
    <div class="sim-empty-state">
      <div class="empty-icon">📦</div>
      <p>Waiting for orders...</p>
    </div>
  `

  // Clear notifications
  incomingOrders.innerHTML = ""

  // Reset stats
  orderCount = 0
  totalRevenue = 0
  completedCount = 0

  if (simOrderCount) simOrderCount.textContent = "0"
  if (simRevenue) simRevenue.textContent = "₹0"
  if (simCompleted) simCompleted.textContent = "0"
}

if (startSimulation) {
  startSimulation.addEventListener("click", startOrderSimulation)
}

if (resetSimulation) {
  resetSimulation.addEventListener("click", resetOrderSimulation)
}

// ============================================
// ============================================
const timelineItems = document.querySelectorAll(".timeline-item")

const timelineObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.transform = "translateY(0)"
        entry.target.style.opacity = "1"
      }
    })
  },
  { threshold: 0.2, rootMargin: "0px 0px -100px 0px" },
)

timelineItems.forEach((item, index) => {
  item.style.transform = "translateY(50px)"
  item.style.opacity = "0"
  item.style.transition = `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`
  timelineObserver.observe(item)
})

// ============================================
// ============================================
const timelineSection = document.querySelector(".timeline-section")

if (timelineSection) {
  window.addEventListener("scroll", () => {
    const rect = timelineSection.getBoundingClientRect()
    const scrollPercent = (window.innerHeight - rect.top) / (window.innerHeight + rect.height)

    if (scrollPercent > 0 && scrollPercent < 1) {
      timelineItems.forEach((item, index) => {
        const content = item.querySelector(".timeline-content")
        if (content) {
          const offset = (scrollPercent - 0.5) * 20 * (index % 2 === 0 ? 1 : -1)
          content.style.transform = `translateX(${offset}px)`
        }
      })
    }
  })
}

// ============================================
// ============================================
console.log("[v0] Fixed Before/After Slider: ✓")
console.log("[v0] Baker Simulation with Auto-Fill: ✓")
console.log("[v0] 3D Card Flip Showcase: ✓")
console.log("[v0] Animated Infographic: ✓")
console.log("[v0] Interactive Feature Explorer: ✓")
console.log("[v0] Scroll Timeline: ✓")
console.log("[v0] Updated ROI Calculator: ✓")
console.log("[v0] All new innovative features loaded!")

// ============================================
// CONSOLE LOG FOR DEBUGGING
// ============================================
console.log("[v0] Bakers Hub landing page loaded successfully")
console.log("[v0] All interactive features initialized")
console.log("[v0] Parallax effects: ✓")
console.log("[v0] Zoom animations: ✓")
console.log("[v0] Interactive elements: ✓")
console.log("[v0] Mobile optimizations: ✓")
