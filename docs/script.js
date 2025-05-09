document.addEventListener("DOMContentLoaded", async () => {
  // Initialize ripple effect for buttons
  initRippleEffect()

  // Prevent scrolling during initialization
  document.body.classList.add("noscroll")

  try {
    // Load data
    const [endpoints, set] = await Promise.all([
      fetch("/endpoints").then((res) => res.json()),
      fetch("/set").then((res) => res.json()),
    ])

    // Set content
    setContent("api-icon", "href", set.icon)
    setContent("api-title", "textContent", set.name)
    setContent("sidebar-title", "textContent", set.name)
    setContent("api-description", "textContent", set.description)
    setContent("api-name", "textContent", set.name)
    setContent("api-author", "textContent", `by ${set.author}`)
    setContent("api-desc", "textContent", set.description)

    // Setup components
    setupApiContent(endpoints)
    setupApiButtonHandlers(endpoints)
    setupGlobalSearch(endpoints)
    setupNavigation()
    updateStats(endpoints)
    setupNotifications(set.notification)
    setupNotificationDropdown()
    setupApiDetailPage()

    // Restore active page from localStorage
    restoreActivePage()
  } catch (error) {
    console.error("Error loading configuration:", error)
    showToast("Error loading configuration", "error")
  }

  // Hide loader after initialization
  hideLoader()

  // Toggle sidebar functionality
  document.getElementById("toggle-sidebar").addEventListener("click", toggleSidebar)

  // Close sidebar when clicking overlay
  document.getElementById("sidebar-overlay").addEventListener("click", closeSidebar)

  // Handle window resize for responsive design
  window.addEventListener("resize", handleResize)

  // Initialize responsive behavior on load
  if (window.innerWidth < 768) {
    const mainContent = document.getElementById("main-content")
    mainContent.classList.remove("ml-64")
    mainContent.classList.add("ml-0")
  }

  // Setup modal close functionality
  document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("image-modal").classList.add("hidden")
  })

  document.getElementById("image-modal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) {
      e.currentTarget.classList.add("hidden")
    }
  })
})

// Initialize ripple effect for buttons
function initRippleEffect() {
  document.addEventListener("click", (e) => {
    const target = e.target

    // Find the ripple-button parent if the click was on a child element
    const rippleButton = target.closest(".ripple-button")

    if (!rippleButton) return

    const rect = rippleButton.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ripple = document.createElement("span")
    ripple.className = "ripple"
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`

    rippleButton.appendChild(ripple)

    // Remove the ripple element after animation completes
    setTimeout(() => {
      ripple.remove()
    }, 600)
  })
}

// Toast notification system
function showToast(message, type = "success") {
  const toast = document.getElementById("toast")
  const toastIcon = document.getElementById("toast-icon")
  const toastMessage = document.getElementById("toast-message")

  // Clear existing classes
  toast.className = "toast"

  // Add appropriate class based on type
  if (type === "success") {
    toast.classList.add("toast-success")
    toastIcon.textContent = "check_circle"
  } else if (type === "error") {
    toast.classList.add("toast-error")
    toastIcon.textContent = "error"
  }

  toastMessage.textContent = message
  toast.classList.add("show")

  // Hide toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show")
  }, 3000)
}

function setContent(id, property, value) {
  const element = document.getElementById(id)
  if (element) element[property] = value
}

function setupNavigation() {
  const navLinks = document.querySelectorAll(".nav-link")
  const pageTitle = document.getElementById("page-title")

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      // Get the page to show
      const pageToShow = this.getAttribute("data-page")

      // Update active link
      navLinks.forEach((navLink) => {
        navLink.classList.remove("bg-dark-700", "text-gray-200")
        navLink.classList.add("text-gray-400")
      })
      this.classList.add("bg-dark-700", "text-gray-200")
      this.classList.remove("text-gray-400")

      // Update page title
      pageTitle.textContent = pageToShow.charAt(0).toUpperCase() + pageToShow.slice(1)

      // Hide all pages
      document.querySelectorAll(".page-content").forEach((page) => {
        page.classList.add("hidden")
      })

      // Show the selected page
      document.getElementById(`${pageToShow}-page`).classList.remove("hidden")

      // Close sidebar on mobile after navigation
      if (window.innerWidth < 768) {
        closeSidebar()
      }
    })
  })
}

function restoreActivePage() {
  // Default to home page
  const activeLink = document.querySelector(`.nav-link[data-page="home"]`)
  if (activeLink) {
    activeLink.click()
  }
}

function updateStats(endpoints) {
  let totalCategories = 0
  let totalApis = 0
  const categoriesList = document.getElementById("categories-list")
  categoriesList.innerHTML = ""

  if (endpoints && endpoints.endpoints) {
    totalCategories = endpoints.endpoints.length

    endpoints.endpoints.forEach((category) => {
      const categoryItems = Object.keys(category.items).length
      totalApis += categoryItems

      // Add category to the categories list
      const categoryItem = document.createElement("div")
      categoryItem.className = "category-card flex justify-between items-center"
      categoryItem.innerHTML = `
      <div class="flex items-center">
        <div class="category-icon">
          <span class="material-icons text-white">folder</span>
        </div>
        <span class="text-white font-medium">${category.name}</span>
      </div>
      <div class="category-count text-gray-300">
        ${categoryItems} APIs
      </div>
    `

      categoriesList.appendChild(categoryItem)
    })
  }

  // Update stats counters with animation
  animateCounter("total-categories", 0, totalCategories)
  animateCounter("total-apis", 0, totalApis)
}

// Animate counter for stats
function animateCounter(elementId, start, end) {
  const element = document.getElementById(elementId)
  if (!element) return

  const duration = 1000 // ms
  const frameDuration = 1000 / 60 // 60fps
  const totalFrames = Math.round(duration / frameDuration)
  const increment = (end - start) / totalFrames

  let currentFrame = 0
  let currentValue = start

  const animate = () => {
    currentFrame++
    currentValue += increment

    if (currentFrame === totalFrames) {
      element.textContent = end
    } else {
      element.textContent = Math.floor(currentValue)
      requestAnimationFrame(animate)
    }
  }

  animate()
}

// Fixed notification dropdown functionality
function setupNotificationDropdown() {
  const notificationButton = document.getElementById("notification-button")
  const notificationDropdown = document.getElementById("notification-dropdown")

  if (!notificationButton || !notificationDropdown) return

  // Ensure the dropdown is appended to the body for proper z-index handling
  // This prevents it from being hidden by other elements
  if (notificationDropdown.parentElement !== document.body) {
    const dropdownParent = notificationButton.closest(".relative")
    const dropdownRect = dropdownParent.getBoundingClientRect()
    const buttonRect = notificationButton.getBoundingClientRect()

    // Remove the dropdown from its current parent
    notificationDropdown.remove()

    // Append it to the body
    document.body.appendChild(notificationDropdown)

    // Position it correctly relative to the button
    notificationDropdown.style.position = "fixed"
    notificationDropdown.style.top = `${buttonRect.bottom + 8}px`
    notificationDropdown.style.right = `${window.innerWidth - buttonRect.right}px`
    notificationDropdown.style.zIndex = "9999"
  }

  // Toggle notification dropdown when notification button is clicked
  notificationButton.addEventListener("click", (e) => {
    e.stopPropagation()

    // Update position on each click to handle scrolling and resizing
    const buttonRect = notificationButton.getBoundingClientRect()
    notificationDropdown.style.top = `${buttonRect.bottom + 8}px`
    notificationDropdown.style.right = `${window.innerWidth - buttonRect.right}px`

    notificationDropdown.classList.toggle("show")
  })

  // Close notification dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!notificationButton.contains(e.target) && !notificationDropdown.contains(e.target)) {
      notificationDropdown.classList.remove("show")
    }
  })

  // Prevent dropdown from closing when clicking inside it
  notificationDropdown.addEventListener("click", (e) => {
    e.stopPropagation()
  })

  // Update dropdown position on scroll and resize
  window.addEventListener(
    "scroll",
    () => {
      if (notificationDropdown.classList.contains("show")) {
        const buttonRect = notificationButton.getBoundingClientRect()
        notificationDropdown.style.top = `${buttonRect.bottom + 8}px`
        notificationDropdown.style.right = `${window.innerWidth - buttonRect.right}px`
      }
    },
    { passive: true },
  )

  window.addEventListener("resize", () => {
    if (notificationDropdown.classList.contains("show")) {
      const buttonRect = notificationButton.getBoundingClientRect()
      notificationDropdown.style.top = `${buttonRect.bottom + 8}px`
      notificationDropdown.style.right = `${window.innerWidth - buttonRect.right}px`
    }
  })
}

function setupNotifications(notifications) {
  // Enhance notification dropdown styling
  const notificationDropdown = document.getElementById("notification-dropdown")
  const notificationList = document.getElementById("notification-list")
  const notificationBadge = document.getElementById("notification-badge")
  const markAllReadBtn = document.getElementById("mark-all-read")

  if (!notificationDropdown || !notificationList || !notificationBadge || !markAllReadBtn) return

  // Load read states from localStorage
  let readStates = {}
  try {
    const savedStates = localStorage.getItem("notification-read-states")
    if (savedStates) {
      readStates = JSON.parse(savedStates)
    }
  } catch (error) {
    console.error("Error loading notification states:", error)
  }

  // Apply read states to notifications
  notifications.forEach((notification) => {
    if (readStates[notification.id]) {
      notification.read = true
    }
  })

  // Update notification badge
  const unreadCount = notifications.filter((n) => !n.read).length
  notificationBadge.textContent = unreadCount
  notificationBadge.style.display = unreadCount > 0 ? "flex" : "none"

  // Clear notification list
  notificationList.innerHTML = ""

  // Check if there are no notifications
  if (notifications.length === 0) {
    notificationList.innerHTML = `
    <div class="notification-empty">
      <div class="notification-empty-icon">
        <svg class="w-6 h-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
      </div>
      <p class="notification-empty-text">No notifications yet</p>
    </div>
  `
    return
  }

  // Populate notification list
  notifications.forEach((notification) => {
    const notificationItem = document.createElement("div")
    notificationItem.className = `notification-item ${notification.read ? "" : "unread"}`
    notificationItem.dataset.id = notification.id

    notificationItem.innerHTML = `
    <div class="flex justify-between items-start">
      <h4 class="font-medium text-white">${notification.title}</h4>
      <span class="text-xs text-gray-400">${notification.time || ""}</span>
    </div>
    <p class="text-sm text-gray-400 mt-1">${notification.message}</p>
    ${!notification.read ? '<button class="mark-read text-xs text-accent-primary hover:text-accent-secondary mt-2 flex items-center"><span class="material-icons" style="font-size: 16px; margin-right: 4px;">check_circle</span>Mark as read</button>' : ""}
  `

    // Make the entire notification item clickable to mark as read
    notificationItem.addEventListener("click", function () {
      if (!notification.read) {
        notification.read = true
        this.classList.remove("unread")
        const markReadBtn = this.querySelector(".mark-read")
        if (markReadBtn) markReadBtn.remove()

        // Update badge
        const unreadItems = document.querySelectorAll(".notification-item.unread").length
        notificationBadge.textContent = unreadItems
        notificationBadge.style.display = unreadItems > 0 ? "flex" : "none"

        // Save to localStorage
        readStates[notification.id] = true
        localStorage.setItem("notification-read-states", JSON.stringify(readStates))

        showToast("Notification marked as read", "success")
      }
    })

    notificationList.appendChild(notificationItem)
  })

  // Mark individual notification as read using the button
  document.querySelectorAll(".mark-read").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation() // Prevent triggering the parent click event
      const notificationItem = this.closest(".notification-item")
      const notificationId = notificationItem.dataset.id
      notificationItem.classList.remove("unread")
      this.remove()

      // Update badge
      const unreadItems = document.querySelectorAll(".notification-item.unread").length
      notificationBadge.textContent = unreadItems
      notificationBadge.style.display = unreadItems > 0 ? "flex" : "none"

      // Save to localStorage
      readStates[notificationId] = true
      localStorage.setItem("notification-read-states", JSON.stringify(readStates))

      showToast("Notification marked as read", "success")
    })
  })

  // Mark all as read
  markAllReadBtn.addEventListener("click", (e) => {
    e.stopPropagation() // Prevent event bubbling

    document.querySelectorAll(".notification-item").forEach((item) => {
      const notificationId = item.dataset.id
      item.classList.remove("unread")
      readStates[notificationId] = true
    })

    document.querySelectorAll(".mark-read").forEach((button) => {
      button.remove()
    })

    // Save all as read to localStorage
    localStorage.setItem("notification-read-states", JSON.stringify(readStates))

    notificationBadge.style.display = "none"
    showToast("All notifications marked as read", "success")
  })
}

const pageLoader = document.getElementById("page-loader")

window.addEventListener("load", () => {
  setTimeout(() => {
    hideLoader()
  }, 1000)
})

function showLoader() {
  const scrollPosition = window.scrollY
  document.body.style.top = `-${scrollPosition}px`
  document.body.classList.add("noscroll")
  pageLoader.style.display = "flex"
  pageLoader.style.opacity = "1"
}

function hideLoader() {
  const scrollPosition = Number.parseInt(document.body.style.top || "0") * -1
  document.body.classList.remove("noscroll")
  document.body.style.top = ""
  window.scrollTo(0, scrollPosition)
  pageLoader.style.opacity = "0"
  setTimeout(() => {
    pageLoader.style.display = "none"
  }, 800)
}

function setupApiContent(endpoints) {
  const apiContent = document.getElementById("api-content")
  apiContent.innerHTML = ""

  // Track the currently open accordion
  let currentOpenAccordion = null

  endpoints.endpoints.forEach((category, index) => {
    // Create accordion header
    const categoryId = `category-${index}`
    const accordionHeader = document.createElement("div")
    accordionHeader.className = "accordion-header"
    accordionHeader.dataset.target = categoryId
    accordionHeader.innerHTML = `
    <h3>${category.name}</h3>
    <span class="material-icons accordion-icon text-accent-primary">expand_more</span>
  `

    // Create accordion content
    const accordionContent = document.createElement("div")
    accordionContent.className = "accordion-content"
    accordionContent.id = categoryId

    // Create container for API items
    const apiItems = document.createElement("div")
    apiItems.className = "api-items space-y-3"

    // Sort and add API items
    const sortedItems = Object.entries(category.items)
      .sort(([, a], [, b]) => (a.name || "").localeCompare(b.name || ""))
      .map(([, item]) => item)

    sortedItems.forEach((itemData, itemIndex) => {
      const itemName = Object.keys(itemData)[0]
      const item = itemData[itemName]
      const isLastItem = itemIndex === sortedItems.length - 1
      const itemElement = createApiItemElement(itemName, item, isLastItem)
      apiItems.appendChild(itemElement)
    })

    accordionContent.appendChild(apiItems)
    apiContent.appendChild(accordionHeader)
    apiContent.appendChild(accordionContent)

    // Add click event to toggle accordion
    accordionHeader.addEventListener("click", function () {
      // If this accordion is already open, close it
      if (this.classList.contains("active")) {
        this.classList.remove("active")
        const content = document.getElementById(this.dataset.target)
        content.classList.remove("active")
        currentOpenAccordion = null
        return
      }

      // Close currently open accordion if any
      if (currentOpenAccordion) {
        currentOpenAccordion.classList.remove("active")
        const currentContent = document.getElementById(currentOpenAccordion.dataset.target)
        if (currentContent) {
          currentContent.classList.remove("active")
        }
      }

      // Open this accordion
      this.classList.add("active")
      const content = document.getElementById(this.dataset.target)
      content.classList.add("active")
      currentOpenAccordion = this
    })

    // All accordions are closed by default - no need to open the first one
  })
}

function createApiItemElement(itemName, item, isLastItem) {
  const itemDiv = document.createElement("div")
  itemDiv.className = `w-full ${isLastItem ? "mb-0" : "mb-2"}` // Reduced margin
  itemDiv.dataset.name = itemName || ""
  itemDiv.dataset.desc = item.desc || "No description available" // Fallback description

  const heroSection = document.createElement("div")
  heroSection.className = "hero-card endpoint-card flex items-center justify-between p-5 px-6 rounded-lg" // Added endpoint-card class

  const textContent = document.createElement("div")
  textContent.className = "flex-grow mr-4 overflow-hidden"

  const title = document.createElement("h5")
  title.className = "text-lg font-semibold text-white truncate"
  title.textContent = itemName || "Unnamed Item"

  const description = document.createElement("p")
  description.className = "text-sm font-medium text-gray-400 truncate mt-1"
  description.textContent = item.desc || "No description available" // Fallback description

  textContent.appendChild(title)
  textContent.appendChild(description)

  const button = document.createElement("button")
  button.className = "premium-button px-5 py-2.5 text-sm font-medium flex-shrink-0 get-api-btn"
  button.dataset.apiPath = item.path || ""
  button.dataset.apiName = itemName || ""
  button.dataset.apiDesc = item.desc || "No description available" // Fallback description
  button.textContent = "TRY"

  heroSection.appendChild(textContent)
  heroSection.appendChild(button)
  itemDiv.appendChild(heroSection)

  return itemDiv
}

function setupApiButtonHandlers(endpoints) {
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("get-api-btn") || event.target.closest(".get-api-btn")) {
      const button = event.target.classList.contains("get-api-btn")
        ? event.target
        : event.target.closest(".get-api-btn")
      const { apiPath, apiName, apiDesc } = button.dataset

      const currentItem = endpoints.endpoints
        .flatMap((category) => Object.values(category.items))
        .map((itemData) => {
          const itemName = Object.keys(itemData)[0]
          return { name: itemName, ...itemData[itemName] }
        })
        .find((item) => item.path === apiPath && item.name === apiName)

      navigateToApiDetail(apiName, apiPath, apiDesc || "No description available")
    }
  })
}

function setupApiDetailPage() {
  // Set up back button
  document.getElementById("back-to-apis").addEventListener("click", () => {
    // Hide API detail page
    document.getElementById("api-detail-page").classList.add("hidden")

    // Show the previous page (either home or apis page)
    const previousPage = localStorage.getItem("previousPage") || "home"
    document.getElementById(`${previousPage}-page`).classList.remove("hidden")

    // Update page title
    document.getElementById("page-title").textContent = previousPage.charAt(0).toUpperCase() + previousPage.slice(1)
  })

  // Set up copy endpoint button
  document.getElementById("detail-copy-endpoint").addEventListener("click", async () => {
    const endpointUrl = document.getElementById("detail-endpoint-url").textContent
    const success = await copyToClipboard(endpointUrl)

    if (success) {
      const copyButton = document.getElementById("detail-copy-endpoint")
      copyButton.classList.add("copied")
      copyButton.querySelector(".tooltip-text").textContent = "Copied!"
      showToast("Endpoint copied to clipboard", "success")

      setTimeout(() => {
        copyButton.classList.remove("copied")
        copyButton.querySelector(".tooltip-text").textContent = "Copy to clipboard"
      }, 2000)
    } else {
      showToast("Failed to copy endpoint", "error")
    }
  })

  // Set up submit API button
  document.getElementById("detail-submit-api").addEventListener("click", async () => {
    await handleApiSubmit()
  })
}

function navigateToApiDetail(name, endpoint, description, method = "GET") {
  // Hide all pages
  document.querySelectorAll(".page-content").forEach((page) => {
    page.classList.add("hidden")
  })

  // Update page title
  document.getElementById("page-title").textContent = name

  // Show API detail page
  const apiDetailPage = document.getElementById("api-detail-page")
  apiDetailPage.classList.remove("hidden")

  // Set API details
  document.getElementById("detail-api-title").textContent = name
  document.getElementById("detail-api-description").textContent = description
  document.getElementById("detail-api-method").textContent = method

  // Set endpoint URL
  const url = new URL(endpoint, window.location.origin)
  document.getElementById("detail-endpoint-url").textContent = url.href

  // Reset response container
  const responseContainer = document.getElementById("detail-response-container")
  responseContainer.classList.add("hidden")
  document.getElementById("detail-response-data").innerHTML = ""
  document.getElementById("detail-response-actions").innerHTML = ""

  // Set up parameters
  setupApiParameters(endpoint)
}

function setupApiParameters(endpoint) {
  const paramsContainer = document.getElementById("detail-params-container")
  paramsContainer.innerHTML = ""

  const url = new URL(endpoint, window.location.origin)
  const urlParams = url.search ? url.search.substring(1).split("&") : []

  if (urlParams.length) {
    urlParams.forEach((param) => {
      const [key] = param.split("=")
      if (key) {
        const isOptional = key.startsWith("_")
        const placeholderText = `Enter ${key}${isOptional ? " (optional)" : ""}`

        const paramField = document.createElement("div")
        paramField.className = "mb-4"
        paramField.innerHTML = `
        <label for="param-${key}" class="block text-sm font-medium text-gray-300 mb-2">${key}</label>
        <input type='text' id='param-${key}' class='premium-input w-full px-4 py-3 text-sm text-gray-200 rounded-lg focus:outline-none transition-all duration-300' placeholder='${placeholderText}'>
        <div id='error-${key}' class='text-red-400 text-xs mt-2 hidden'>This field is required</div>
      `
        paramsContainer.appendChild(paramField)
      }
    })
  } else {
    const placeholderMatch = endpoint.match(/{([^}]+)}/g)
    if (placeholderMatch) {
      placeholderMatch.forEach((match) => {
        const paramName = match.replace(/{|}/g, "")
        const isOptional = paramName.startsWith("_")
        const placeholderText = `Enter ${paramName}${isOptional ? " (optional)" : ""}`

        const paramField = document.createElement("div")
        paramField.className = "mb-4"
        paramField.innerHTML = `
        <label for="param-${paramName}" class="block text-sm font-medium text-gray-300 mb-2">${paramName}</label>
        <input type='text' id='param-${paramName}' class='premium-input w-full px-4 py-3 text-sm text-gray-200 rounded-lg focus:outline-none transition-all duration-300' placeholder='${placeholderText}'>
        <div id='error-${paramName}' class='text-red-400 text-xs mt-2 hidden'>This field is required</div>
      `
        paramsContainer.appendChild(paramField)
      })
    }

    if (!placeholderMatch) {
      const noParamsMessage = document.createElement("div")
      noParamsMessage.className = "text-gray-400 text-sm"
      noParamsMessage.textContent = "This API endpoint does not require any parameters."
      paramsContainer.appendChild(noParamsMessage)
    }
  }
}

async function handleApiSubmit() {
  const submitBtn = document.getElementById("detail-submit-api")
  const paramsContainer = document.getElementById("detail-params-container")
  const responseContainer = document.getElementById("detail-response-container")
  const responseData = document.getElementById("detail-response-data")
  const responseStatus = document.getElementById("detail-response-status")
  const responseTime = document.getElementById("detail-response-time")
  const responseActions = document.getElementById("detail-response-actions")
  const endpointUrl = document.getElementById("detail-endpoint-url").textContent
  const method = document.getElementById("detail-api-method").textContent

  // Validate parameters
  let isValid = true
  document.querySelectorAll('[id^="error-"]').forEach((errorElement) => {
    errorElement.classList.add("hidden")
  })

  if (paramsContainer.children.length > 0) {
    Array.from(paramsContainer.querySelectorAll("input")).forEach((inputElement) => {
      const paramName = inputElement.id.replace("param-", "")
      const paramValue = inputElement.value.trim()
      const errorElement = document.getElementById(`error-${paramName}`)

      if (errorElement && !paramName.startsWith("_") && paramValue === "") {
        isValid = false
        errorElement.classList.remove("hidden")
        inputElement.classList.add("border-red-500")
      } else if (inputElement) {
        inputElement.classList.remove("border-red-500")
      }
    })
  }

  if (!isValid) {
    return
  }

  // Show loading state
  submitBtn.disabled = true
  submitBtn.innerHTML = `
  <span class="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
  Processing...
`

  let apiUrl = endpointUrl

  if (paramsContainer.children.length > 0) {
    const inputs = paramsContainer.querySelectorAll("input")
    if (inputs.length > 0) {
      Array.from(inputs).forEach((inputElement) => {
        const paramName = inputElement.id.replace("param-", "")
        const paramValue = inputElement.value

        if (paramName.startsWith("_") && paramValue === "") {
          return
        }

        if (apiUrl.includes(`{${paramName}}`)) {
          apiUrl = apiUrl.replace(`{${paramName}}`, encodeURIComponent(paramValue))
        } else {
          const urlObj = new URL(apiUrl)
          urlObj.searchParams.set(paramName, paramValue)
          apiUrl = urlObj.href
        }
      })
    }
  }

  responseContainer.classList.remove("hidden")
  responseData.innerHTML = `
  <div class="flex items-center justify-center p-4">
    <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-purple"></div>
  </div>
`

  const startTime = Date.now()
  try {
    const requestOptions = {
      method: method.toLowerCase(),
      headers: {
        "Content-Type": "application/json",
      },
    }

    const response = await fetch(apiUrl, requestOptions)
    const endTime = Date.now()
    const duration = endTime - startTime

    responseStatus.textContent = response.status
    responseStatus.className = response.ok
      ? "px-2.5 py-1 text-xs font-medium bg-green-900 text-green-200 rounded-full mr-2"
      : "px-2.5 py-1 text-xs font-medium bg-red-900 text-red-200 rounded-full mr-2"

    responseTime.textContent = `${duration}ms`
    responseActions.innerHTML = ""

    const contentType = response.headers.get("content-type")

    if (
      contentType &&
      (contentType.includes("image/") ||
        contentType.includes("video/") ||
        contentType.includes("audio/") ||
        contentType.includes("application/octet-stream"))
    ) {
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)

      if (contentType.includes("image/")) {
        responseData.innerHTML = `<img src='${objectUrl}' alt='Response Image' class='max-w-full h-auto rounded-lg cursor-pointer' />`
        const img = responseData.querySelector("img")
        img.addEventListener("click", () => {
          const modal = document.getElementById("image-modal")
          const modalImg = document.getElementById("modal-image")
          modalImg.src = objectUrl
          modal.classList.remove("hidden")
        })
      } else if (contentType.includes("video/")) {
        responseData.innerHTML = `
        <video controls class='max-w-full rounded-lg'>
          <source src='${objectUrl}' type='${contentType}'>
          Your browser does not support the video tag.
        </video>`
      } else if (contentType.includes("audio/")) {
        responseData.innerHTML = `
        <audio controls class='w-full'>
          <source src='${objectUrl}' type='${contentType}'>
          Your browser does not support the audio tag.
        </audio>`
      } else {
        responseData.innerHTML = `
        <div class='text-center p-6'>
          <p class='mb-3 text-gray-300'>Binary data received (${blob.size} bytes)</p>
        </div>`
      }

      // Add download button for media
      const downloadButton = createDownloadButton(objectUrl, `response-${Date.now()}`)
      responseActions.appendChild(downloadButton)
    } else if (contentType && contentType.includes("application/json")) {
      const data = await response.json()
      const formattedJson = syntaxHighlight(JSON.stringify(data, null, 2))
      responseData.innerHTML = `<div class='whitespace-pre-wrap break-words'>${formattedJson}</div>`

      // Add copy button for JSON
      const copyButton = createCopyButton()
      copyButton.addEventListener("click", async () => {
        const success = await copyToClipboard(JSON.stringify(data, null, 2))
        if (success) {
          copyButton.classList.add("copied")
          copyButton.querySelector(".tooltip-text").textContent = "Copied!"
          showToast("Response copied to clipboard", "success")

          setTimeout(() => {
            copyButton.classList.remove("copied")
            copyButton.querySelector(".tooltip-text").textContent = "Copy to clipboard"
          }, 2000)
        } else {
          showToast("Failed to copy response", "error")
        }
      })
      responseActions.appendChild(copyButton)
    } else {
      const responseText = await response.text()
      responseData.innerHTML = `<pre class='whitespace-pre-wrap break-words text-gray-300'>${responseText}</pre>`

      // Add copy button for text
      const copyButton = createCopyButton()
      copyButton.addEventListener("click", async () => {
        const success = await copyToClipboard(responseText)
        if (success) {
          copyButton.classList.add("copied")
          copyButton.querySelector(".tooltip-text").textContent = "Copied!"
          showToast("Response copied to clipboard", "success")

          setTimeout(() => {
            copyButton.classList.remove("copied")
            copyButton.querySelector(".tooltip-text").textContent = "Copy to clipboard"
          }, 2000)
        } else {
          showToast("Failed to copy response", "error")
        }
      })
      responseActions.appendChild(copyButton)
    }
  } catch (error) {
    const endTime = Date.now()
    const duration = endTime - startTime

    responseStatus.textContent = "Error"
    responseStatus.className = "px-2.5 py-1 text-xs font-medium bg-red-900 text-red-200 rounded-full mr-2"
    responseTime.textContent = `${duration}ms`
    responseData.innerHTML = `<pre class='text-red-400'>${error.message}</pre>`

    // Add copy button for error
    const copyButton = createCopyButton()
    copyButton.addEventListener("click", async () => {
      const success = await copyToClipboard(error.message)
      if (success) {
        showToast("Error message copied to clipboard", "success")
      } else {
        showToast("Failed to copy error message", "error")
      }
    })
    responseActions.appendChild(copyButton)
  } finally {
    submitBtn.disabled = false
    submitBtn.textContent = "Send Request"

    // Scroll to response section
    responseContainer.scrollIntoView({ behavior: "smooth", block: "start" })
  }
}

function setupGlobalSearch(endpoints) {
  const searchInput = document.getElementById("global-search")
  const clearSearchBtn = document.getElementById("global-clear-search")
  const searchResults = document.getElementById("global-search-results")
  const noResults = document.getElementById("global-no-results")
  const searchInfo = document.getElementById("search-info")
  const searchCount = document.getElementById("search-count")
  const initialState = document.getElementById("search-initial-state")

  if (!searchInput || !searchResults || !noResults || !clearSearchBtn) {
    console.error("Global search elements not found in the DOM")
    return
  }

  // Extract API data from endpoints for search
  function extractApiData(endpoints) {
    if (!endpoints || !endpoints.endpoints) return []

    const apiData = []
    endpoints.endpoints.forEach((category) => {
      // Add category itself as a searchable item
      apiData.push({
        id: `category-${category.name}`,
        title: category.name,
        type: "category",
        description: `Category containing ${Object.keys(category.items).length} API endpoints`,
        category: category.name,
        items: Object.keys(category.items).length,
      })

      if (category.items) {
        Object.entries(category.items).forEach(([key, itemData]) => {
          const itemName = Object.keys(itemData)[0]
          const item = itemData[itemName]
          apiData.push({
            id: key,
            title: itemName,
            type: "endpoint",
            path: item.path || "",
            description: item.desc || "No description available",
            category: category.name,
          })
        })
      }
    })

    return apiData
  }

  // Highlight matching text
  function highlightMatch(text, query) {
    if (!text) return ""
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    return text.replace(regex, '<span class="search-highlight">$1</span>')
  }

  // Perform search
  function performSearch(query) {
    if (!query) {
      searchResults.innerHTML = ""
      noResults.classList.add("hidden")
      searchInfo.classList.add("hidden")
      initialState.classList.remove("hidden")
      return
    }

    initialState.classList.add("hidden")
    query = query.toLowerCase()

    // Use the extracted API data
    const apiData = extractApiData(endpoints)

    const results = apiData.filter(
      (item) =>
        (item.title && item.title.toLowerCase().includes(query)) ||
        (item.path && item.path.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.category && item.category.toLowerCase().includes(query)),
    )

    searchResults.innerHTML = ""
    searchCount.textContent = results.length

    if (results.length === 0) {
      searchResults.classList.add("hidden")
      noResults.classList.remove("hidden")
      searchInfo.classList.add("hidden")
    } else {
      searchResults.classList.remove("hidden")
      noResults.classList.add("hidden")
      searchInfo.classList.remove("hidden")

      // Group results by category
      const groupedResults = {}
      results.forEach((result) => {
        if (!groupedResults[result.category]) {
          groupedResults[result.category] = []
        }
        groupedResults[result.category].push(result)
      })

      // Create results for each category
      Object.entries(groupedResults).forEach(([category, items]) => {
        const categoryHeader = document.createElement("div")
        categoryHeader.className = "mb-4 mt-6"
        categoryHeader.innerHTML = `
          <h3 class="text-lg font-semibold text-white mb-2">${category}</h3>
          <div class="h-px bg-dark-600 w-full"></div>
        `
        searchResults.appendChild(categoryHeader)

        items.forEach((result) => {
          const resultItem = document.createElement("div")
          resultItem.className =
            "search-result-item bg-dark-800 rounded-lg p-4 mb-3 border border-dark-600 hover:border-accent-primary transition-colors duration-200"

          // Highlight the matching text
          const titleWithHighlight = highlightMatch(result.title, query)
          const descriptionWithHighlight = highlightMatch(result.description, query)

          if (result.type === "category") {
            resultItem.innerHTML = `
              <div class="flex items-start">
                <div class="w-8 h-8 mr-3 flex-shrink-0 bg-dark-700 rounded-lg flex items-center justify-center">
                  <span class="material-icons text-accent-primary">folder</span>
                </div>
                <div>
                  <h4 class="text-lg font-medium text-white">${titleWithHighlight}</h4>
                  <p class="text-sm text-gray-400 mt-1">${descriptionWithHighlight}</p>
                  <div class="mt-2 flex items-center">
                    <span class="text-xs bg-dark-700 text-gray-300 px-2 py-1 rounded-full">${result.items} endpoints</span>
                  </div>
                </div>
              </div>
            `
          } else {
            const pathWithHighlight = result.path ? highlightMatch(result.path, query) : ""

            resultItem.innerHTML = `
              <div class="flex items-start">
                <div class="w-8 h-8 mr-3 flex-shrink-0 bg-dark-700 rounded-lg flex items-center justify-center">
                  <span class="material-icons text-accent-primary">api</span>
                </div>
                <div>
                  <h4 class="text-lg font-medium text-white">${titleWithHighlight}</h4>
                  <p class="text-sm text-gray-400 mt-1">${descriptionWithHighlight}</p>
                  <div class="mt-2 flex items-center">
                    <span class="text-xs bg-dark-700 text-gray-300 px-2 py-1 rounded-full">GET</span>
                    <span class="text-xs text-gray-400 ml-2">${pathWithHighlight}</span>
                  </div>
                </div>
              </div>
            `
          }

          resultItem.addEventListener("click", () => {
            if (result.type === "endpoint") {
              // Navigate to API detail page
              navigateToApiDetail(result.title, result.path, result.description)
            } else if (result.type === "category") {
              // Navigate to home page and open the category accordion
              const navLink = document.querySelector(`.nav-link[data-page="home"]`)
              if (navLink) {
                navLink.click()

                // Find and open the category accordion
                setTimeout(() => {
                  const accordionHeaders = document.querySelectorAll(".accordion-header")
                  accordionHeaders.forEach((header) => {
                    if (header.querySelector("h3").textContent === result.title) {
                      header.click()
                      header.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                  })
                }, 100)
              }
            }
          })

          searchResults.appendChild(resultItem)
        })
      })
    }
  }

  // Event listeners
  searchInput.addEventListener("input", function () {
    const query = this.value.trim()

    if (query === "") {
      clearSearchBtn.classList.add("opacity-0", "pointer-events-none")
      performSearch("")
    } else {
      clearSearchBtn.classList.remove("opacity-0", "pointer-events-none")
      performSearch(query)
    }
  })

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = ""
    clearSearchBtn.classList.add("opacity-0", "pointer-events-none")
    performSearch("")
    searchInput.focus()
  })

  // Focus search with keyboard shortcut (Ctrl+K or Command+K)
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "k") {
      event.preventDefault()

      // Navigate to search page
      const searchLink = document.querySelector(`.nav-link[data-page="search"]`)
      if (searchLink) {
        searchLink.click()
        setTimeout(() => {
          searchInput.focus()
        }, 100)
      }
    }
  })
}

// Toggle sidebar function
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar")
  const sidebarOverlay = document.getElementById("sidebar-overlay")

  if (window.innerWidth < 768) {
    // Mobile behavior
    sidebar.classList.toggle("open")
    sidebarOverlay.classList.toggle("active")

    // Prevent body scrolling when sidebar is open
    if (sidebar.classList.contains("open")) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
  } else {
    // Desktop behavior
    const mainContent = document.getElementById("main-content")

    if (sidebar.classList.contains("-translate-x-full")) {
      sidebar.classList.remove("-translate-x-full")
      mainContent.classList.remove("ml-0")
      mainContent.classList.add("ml-64")
    } else {
      sidebar.classList.add("-translate-x-full")
      mainContent.classList.remove("ml-64")
      mainContent.classList.add("ml-0")
    }
  }
}

// Close sidebar function
function closeSidebar() {
  const sidebar = document.getElementById("sidebar")
  const sidebarOverlay = document.getElementById("sidebar-overlay")

  sidebar.classList.remove("open")
  sidebarOverlay.classList.remove("active")
  document.body.style.overflow = ""
}

// Handle window resize
function handleResize() {
  const sidebar = document.getElementById("sidebar")
  const mainContent = document.getElementById("main-content")
  const sidebarOverlay = document.getElementById("sidebar-overlay")

  if (window.innerWidth < 768) {
    // Mobile layout
    mainContent.classList.remove("ml-64")
    mainContent.classList.add("ml-0")

    // Reset sidebar to closed state on mobile
    sidebar.classList.remove("-translate-x-full")
    if (!sidebar.classList.contains("open")) {
      sidebarOverlay.classList.remove("active")
    }
  } else {
    // Desktop layout
    sidebar.classList.remove("open")
    sidebarOverlay.classList.remove("active")
    document.body.style.overflow = ""

    if (!sidebar.classList.contains("-translate-x-full")) {
      mainContent.classList.remove("ml-0")
      mainContent.classList.add("ml-64")
    }
  }

  // Update notification dropdown position if it's open
  const notificationDropdown = document.getElementById("notification-dropdown")
  const notificationButton = document.getElementById("notification-button")

  if (notificationDropdown && notificationDropdown.classList.contains("show") && notificationButton) {
    const buttonRect = notificationButton.getBoundingClientRect()
    notificationDropdown.style.top = `${buttonRect.bottom + 8}px`
    notificationDropdown.style.right = `${window.innerWidth - buttonRect.right}px`
  }
}

// Copy to clipboard function
function copyToClipboard(text) {
  return navigator.clipboard
    .writeText(text)
    .then(() => {
      return true
    })
    .catch((error) => {
      console.error("Failed to copy: ", error)
      return false
    })
}

// Function to create a copy button
function createCopyButton() {
  const button = document.createElement("button")
  button.className = "copy-button tooltip"
  button.innerHTML = `
  <span class="material-icons text-sm">content_copy</span>
  <span class="tooltip-text">Copy to clipboard</span>
`
  return button
}

// Function to create a download button
function createDownloadButton(url, filename) {
  const button = document.createElement("button")
  button.className = "copy-button tooltip"
  button.innerHTML = `
  <span class="material-icons text-sm">download</span>
  <span class="tooltip-text">Download file</span>
`

  button.addEventListener("click", () => {
    const a = document.createElement("a")
    a.href = url
    a.download = filename || "download"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    showToast("Download started", "success")
  })

  return button
}

// Function to add syntax highlighting to JSON
function syntaxHighlight(json) {
  json = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "json-number" // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "json-key" // key
        } else {
          cls = "json-string" // string
        }
      } else if (/true|false/.test(match)) {
        cls = "json-boolean" // boolean
      } else if (/null/.test(match)) {
        cls = "json-null" // null
      }
      return '<span class="' + cls + '">' + match + "</span>"
    },
  )
}

function setupSearchFunctionality(endpoints) {
  const searchInput = document.getElementById("api-search")
  const clearSearchBtn = document.getElementById("clear-search")
  const searchResultsContainer = document.getElementById("search-results-container")
  const searchResults = document.getElementById("search-results")
  const noResults = document.getElementById("no-results")

  if (!searchInput || !searchResultsContainer || !searchResults || !noResults || !clearSearchBtn) {
    console.error("Search elements not found in the DOM")
    return
  }

  let originalData = null

  function captureOriginalData() {
    const result = []
    const accordionHeaders = document.querySelectorAll("#api-content .accordion-header")
    const accordionContents = document.querySelectorAll("#api-content .accordion-content")

    accordionHeaders.forEach((header, index) => {
      const content = accordionContents[index]
      if (content) {
        const items = Array.from(content.querySelectorAll("div[data-name]")).map((item) => {
          return {
            element: item.cloneNode(true),
            name: item.dataset.name,
            desc: item.dataset.desc || "No description available",
          }
        })

        result.push({
          categoryElement: header,
          contentElement: content,
          items: items,
        })
      }
    })

    return result
  }

  function restoreOriginalData() {
    if (!originalData) return

    originalData.forEach((categoryData) => {
      categoryData.categoryElement.classList.remove("hidden")
      const content = categoryData.contentElement
      const apiItems = content.querySelector(".api-items")
      if (apiItems) {
        apiItems.innerHTML = ""

        categoryData.items.forEach((item) => {
          const newItem = item.element.cloneNode(true)
          apiItems.appendChild(newItem)
        })
      }
    })
  }

  // Extract API data from endpoints for search
  function extractApiData(endpoints) {
    if (!endpoints || !endpoints.endpoints) return []

    const apiData = []
    endpoints.endpoints.forEach((category) => {
      if (category.items) {
        Object.entries(category.items).forEach(([key, itemData]) => {
          const itemName = Object.keys(itemData)[0]
          const item = itemData[itemName]
          apiData.push({
            id: key,
            title: itemName,
            path: item.path || "",
            description: item.desc || "No description available",
            category: category.name,
          })
        })
      }
    })

    return apiData
  }

  // Highlight matching text
  function highlightMatch(text, query) {
    if (!text) return ""
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    return text.replace(regex, '<span class="search-highlight">$1</span>')
  }

  // Perform search
  function performSearch(query) {
    if (!query) {
      searchResultsContainer.classList.add("hidden")
      return
    }

    query = query.toLowerCase()

    // Use the extracted API data or fall back to original data
    const apiData = extractApiData(endpoints)

    const results = apiData.filter(
      (item) =>
        (item.title && item.title.toLowerCase().includes(query)) ||
        (item.path && item.path.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query)),
    )

    searchResults.innerHTML = ""

    if (results.length === 0) {
      searchResults.classList.add("hidden")
      noResults.classList.remove("hidden")
    } else {
      searchResults.classList.remove("hidden")
      noResults.classList.add("hidden")

      results.forEach((result) => {
        const resultItem = document.createElement("div")
        resultItem.className = "search-result-item"

        // Highlight the matching text
        const titleWithHighlight = highlightMatch(result.title, query)
        const pathWithHighlight = highlightMatch(result.path, query)

        resultItem.innerHTML = `
        <div class="result-title">${titleWithHighlight}</div>
        <div class="result-path">${pathWithHighlight}</div>
        <div class="text-xs text-gray-500 mt-1">Category: ${result.category}</div>
      `

        resultItem.addEventListener("click", () => {
          // Navigate to API detail page
          navigateToApiDetail(result.title, result.path, result.description)
          searchResultsContainer.classList.add("hidden")
        })

        searchResults.appendChild(resultItem)
      })
    }

    searchResultsContainer.classList.remove("hidden")
  }

  originalData = captureOriginalData()

  // Event listeners
  searchInput.addEventListener("input", function () {
    const query = this.value.trim()

    if (query === "") {
      searchResultsContainer.classList.add("hidden")
      restoreOriginalData()
      return
    }

    performSearch(query)

    // Filter accordion content based on search
    if (originalData) {
      originalData.forEach((categoryData) => {
        let categoryVisible = false
        const content = categoryData.contentElement
        const apiItems = content.querySelector(".api-items")
        apiItems.innerHTML = ""

        categoryData.items.forEach((item) => {
          if (
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.desc.toLowerCase().includes(query.toLowerCase())
          ) {
            const newItem = item.element.cloneNode(true)
            apiItems.appendChild(newItem)
            categoryVisible = true
          }
        })

        if (!categoryVisible) {
          categoryData.categoryElement.classList.add("hidden")
          content.classList.remove("active")
        } else {
          categoryData.categoryElement.classList.remove("hidden")
          categoryData.categoryElement.classList.add("active")
          content.classList.add("active")
        }
      })
    }
  })

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = ""
    searchResultsContainer.classList.add("hidden")
    searchInput.focus()
    restoreOriginalData()
  })

  // Close search results when clicking outside
  document.addEventListener("click", (event) => {
    if (!searchResultsContainer.contains(event.target) && event.target !== searchInput) {
      searchResultsContainer.classList.add("hidden")
    }
  })

  // Focus search with keyboard shortcut (Ctrl+K or Command+K)
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "k") {
      event.preventDefault()
      searchInput.focus()
    }

    // Close search results with Escape key
    if (event.key === "Escape" && !searchResultsContainer.classList.contains("hidden")) {
      searchResultsContainer.classList.add("hidden")
      searchInput.blur()
    }
  })

  // Add styles for the global search page
  const style = document.createElement("style")
  style.textContent = `
    .search-highlight {
      color: #6366F1;
      font-weight: 500;
    }

    #global-search-results .search-result-item {
      cursor: pointer;
    }

    #global-search-results .search-result-item:hover {
      background-color: rgba(42, 42, 54, 0.7);
    }
  `
  document.head.appendChild(style)
}
