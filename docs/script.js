document.addEventListener("DOMContentLoaded", async () => {
  // Initialize ripple effect for buttons
  initRippleEffect()

  document.body.classList.add("noscroll")

  try {
    // Load data
    const endpoints = await (await fetch("/endpoints")).json()
    const set = await (await fetch("/set")).json()

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
    setupSearchFunctionality(endpoints)
    setupNavigation()
    updateStats(endpoints)
    setupNotifications(set.notification)

    // Restore active page from localStorage
    restoreActivePage()
  } catch (error) {
    console.error("Error loading configuration:", error)
    showToast("Error loading configuration", "error")
  }

  // Hide loader after initialization
  hideLoader()

  // Toggle sidebar functionality
  document.getElementById("toggle-sidebar").addEventListener("click", () => {
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
  })

  // Close sidebar when clicking overlay
  document.getElementById("sidebar-overlay").addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar")
    const sidebarOverlay = document.getElementById("sidebar-overlay")

    sidebar.classList.remove("open")
    sidebarOverlay.classList.remove("active")
    document.body.style.overflow = ""
  })

  // Handle window resize for responsive design
  window.addEventListener("resize", () => {
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
  })

  // Initialize responsive behavior on load
  if (window.innerWidth < 768) {
    const mainContent = document.getElementById("main-content")
    mainContent.classList.remove("ml-64")
    mainContent.classList.add("ml-0")
  }

  // Setup notifications dropdown with improved mobile handling
  document.addEventListener("click", (e) => {
    const notificationDropdown = document.getElementById("notification-dropdown")
    const notificationButton = document.getElementById("notification-button")

    if (notificationButton && notificationButton.contains(e.target)) {
      notificationDropdown.classList.toggle("show")
      e.stopPropagation()
    } else if (notificationDropdown && !notificationDropdown.contains(e.target)) {
      notificationDropdown.classList.remove("show")
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

      // Save active page to localStorage
      localStorage.setItem("activePage", pageToShow)

      // Close sidebar on mobile after navigation
      if (window.innerWidth < 768) {
        const sidebar = document.getElementById("sidebar")
        const sidebarOverlay = document.getElementById("sidebar-overlay")

        sidebar.classList.remove("open")
        sidebarOverlay.classList.remove("active")
        document.body.style.overflow = ""
      }
    })
  })
}

function restoreActivePage() {
  const activePage = localStorage.getItem("activePage") || "home"
  const activeLink = document.querySelector(`.nav-link[data-page="${activePage}"]`)

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
      categoryItem.className = "flex justify-between items-center p-4 bg-dark-700 rounded-lg"
      categoryItem.innerHTML = `
  <div class="flex items-center">
    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary via-accent-purple to-accent-pink bg-opacity-20 flex items-center justify-center mr-3">
      <span class="material-icons text-white text-sm">folder</span>
    </div>
    <span class="text-white font-medium">${category.name}</span>
  </div>
  <div class="bg-dark-600 px-3 py-1 rounded-full text-xs font-medium text-gray-300">
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

function setupNotifications(notifications) {
  // Enhance notification dropdown styling
  const notificationDropdown = document.getElementById("notification-dropdown")
  notificationDropdown.className = "notification-dropdown shadow-premium border border-dark-500"

  const notificationList = document.getElementById("notification-list")
  const notificationBadge = document.getElementById("notification-badge")
  const markAllReadBtn = document.getElementById("mark-all-read")

  // Update notification badge
  const unreadCount = notifications.filter((n) => !n.read).length
  notificationBadge.textContent = unreadCount
  notificationBadge.style.display = unreadCount > 0 ? "flex" : "none"

  // Clear notification list
  notificationList.innerHTML = ""

  // Populate notification list
  notifications.forEach((notification) => {
    const notificationItem = document.createElement("div")
    notificationItem.className = `notification-item ${notification.read ? "" : "unread"}`
    notificationItem.dataset.id = notification.id

    notificationItem.innerHTML = `
      <div class="flex justify-between items-start">
        <h4 class="font-medium text-white">${notification.title}</h4>
        ${!notification.read ? '<button class="mark-read text-xs text-accent-primary hover:text-accent-secondary"><span class="material-icons" style="font-size: 16px;">check_circle</span></button>' : ""}
      </div>
      <p class="text-sm text-gray-400 mt-1">${notification.message}</p>
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
      notificationItem.classList.remove("unread")
      this.remove()

      // Update badge
      const unreadItems = document.querySelectorAll(".notification-item.unread").length
      notificationBadge.textContent = unreadItems
      notificationBadge.style.display = unreadItems > 0 ? "flex" : "none"

      showToast("Notification marked as read", "success")
    })
  })

  // Mark all as read
  markAllReadBtn.addEventListener("click", () => {
    document.querySelectorAll(".notification-item").forEach((item) => {
      item.classList.remove("unread")
    })

    document.querySelectorAll(".mark-read").forEach((button) => {
      button.remove()
    })

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

  endpoints.endpoints.forEach((category) => {
    const categoryHeader = document.createElement("h3")
    categoryHeader.className = "mb-5 text-xl font-bold text-white"
    categoryHeader.textContent = category.name
    apiContent.appendChild(categoryHeader)

    const row = document.createElement("div")
    row.className = "row"
    apiContent.appendChild(row)

    const sortedItems = Object.entries(category.items)
      .sort(([, a], [, b]) => (a.name || "").localeCompare(b.name || ""))
      .map(([, item]) => item)

    sortedItems.forEach((itemData, index) => {
      const itemName = Object.keys(itemData)[0]
      const item = itemData[itemName]
      const isLastItem = index === sortedItems.length - 1
      const itemElement = createApiItemElement(itemName, item, isLastItem)
      row.appendChild(itemElement)
    })
  })
}

function createApiItemElement(itemName, item, isLastItem) {
  const itemDiv = document.createElement("div")
  itemDiv.className = `w-full ${isLastItem ? "mb-8" : "mb-4"}`
  itemDiv.dataset.name = itemName || ""
  itemDiv.dataset.desc = item.desc || "No description available" // Fallback description

  const heroSection = document.createElement("div")
  heroSection.className =
    "flex items-center justify-between p-5 px-6 bg-dark-800 border border-dark-600 rounded-lg shadow-premium hover:shadow-premium-hover transition-all duration-300 h-24"

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
  button.className = "premium-button px-5 py-2.5 text-sm font-medium ripple-button flex-shrink-0 get-api-btn"
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

      openApiModal(apiName, apiPath, apiDesc || "No description available") // Fallback description
    }
  })
}

function setupSearchFunctionality(endpoints) {
  const searchInput = document.getElementById("api-search");
  const clearSearchBtn = document.getElementById("clear-search");
  const searchResultsContainer = document.getElementById("search-results-container");
  const searchResults = document.getElementById("search-results");
  const noResults = document.getElementById("no-results");
  
  if (!searchInput || !searchResultsContainer || !searchResults || !noResults || !clearSearchBtn) {
    console.error("Search elements not found in the DOM");
    return;
  }

  let originalData = null;

  function captureOriginalData() {
    const result = [];
    const categories = document.querySelectorAll("#api-content h3");

    categories.forEach((category) => {
      const nextElement = category.nextElementSibling;
      if (nextElement && nextElement.classList.contains("row")) {
        const items = Array.from(nextElement.querySelectorAll("div[data-name]")).map((item) => {
          return {
            element: item.cloneNode(true),
            name: item.dataset.name,
            desc: item.dataset.desc || "No description available",
          };
        });

        result.push({
          categoryElement: category,
          rowElement: nextElement,
          items: items,
        });
      }
    });

    return result;
  }

  function restoreOriginalData() {
    if (!originalData) return;

    originalData.forEach((categoryData) => {
      categoryData.categoryElement.classList.remove("hidden");
      const row = categoryData.rowElement;
      row.innerHTML = "";

      categoryData.items.forEach((item, index) => {
        const newItem = item.element.cloneNode(true);
        newItem.className = index === categoryData.items.length - 1 ? "w-full mb-8" : "w-full mb-4";
        row.appendChild(newItem);
      });
    });
  }

  // Extract API data from endpoints for search
  function extractApiData(endpoints) {
    if (!endpoints || !endpoints.endpoints) return [];
    
    const apiData = [];
    endpoints.endpoints.forEach(category => {
      if (category.items) {
        Object.entries(category.items).forEach(([key, itemData]) => {
          const itemName = Object.keys(itemData)[0];
          const item = itemData[itemName];
          apiData.push({
            id: key,
            title: itemName,
            path: item.path || '',
            description: item.desc || 'No description available'
          });
        });
      }
    });
    
    return apiData;
  }

  // Highlight matching text
  function highlightMatch(text, query) {
    if (!text) return '';
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }

  // Perform search
  function performSearch(query) {
    if (!query) {
      searchResultsContainer.classList.add("hidden");
      return;
    }
    
    query = query.toLowerCase();
    
    // Use the extracted API data or fall back to original data
    const apiData = extractApiData(endpoints);
    
    const results = apiData.filter(item => 
      (item.title && item.title.toLowerCase().includes(query)) || 
      (item.path && item.path.toLowerCase().includes(query)) || 
      (item.description && item.description.toLowerCase().includes(query))
    );
    
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
      searchResults.classList.add('hidden');
      noResults.classList.remove('hidden');
    } else {
      searchResults.classList.remove('hidden');
      noResults.classList.add('hidden');
      
      results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        
        // Highlight the matching text
        const titleWithHighlight = highlightMatch(result.title, query);
        const pathWithHighlight = highlightMatch(result.path, query);
        
        resultItem.innerHTML = `
          <div class="result-title">${titleWithHighlight}</div>
          <div class="result-path">${pathWithHighlight}</div>
        `;
        
        resultItem.addEventListener('click', () => {
          // Handle click on search result - navigate to the API or show modal
          const apiButton = document.querySelector(`.get-api-btn[data-api-name="${result.title}"]`);
          if (apiButton) {
            apiButton.click();
          } else {
            console.log(`Selected: ${result.title}`);
          }
          searchResultsContainer.classList.add('hidden');
        });
        
        searchResults.appendChild(resultItem);
      });
    }
    
    searchResultsContainer.classList.remove('hidden');
  }

  originalData = captureOriginalData();

  // Event listeners
  searchInput.addEventListener("input", function() {
    performSearch(this.value.trim());
  });
  
  clearSearchBtn.addEventListener("click", function() {
    searchInput.value = '';
    searchResultsContainer.classList.add('hidden');
    searchInput.focus();
    restoreOriginalData();
  });
  
  // Close search results when clicking outside
  document.addEventListener("click", function(event) {
    if (!searchResultsContainer.contains(event.target) && event.target !== searchInput) {
      searchResultsContainer.classList.add('hidden');
    }
  });
  
  // Focus search with keyboard shortcut (Ctrl+K or Command+K)
  document.addEventListener("keydown", function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      searchInput.focus();
    }
    
    // Close search results with Escape key
    if (event.key === 'Escape' && !searchResultsContainer.classList.contains('hidden')) {
      searchResultsContainer.classList.add('hidden');
      searchInput.blur();
    }
  });
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

// Store the page state before opening the modal
let previousPageState = {
  scrollPosition: 0,
  activeTab: null,
  searchValue: "",
  activeElement: null
};

function openApiModal(name, endpoint, description, method = "GET") {
  // Save the current page state before opening the modal
  previousPageState = {
    scrollPosition: window.scrollY,
    activeTab: document.querySelector(".nav-link.bg-dark-700")?.getAttribute("data-page") || "home",
    searchValue: document.getElementById("api-search")?.value || "",
    activeElement: document.activeElement
  };

  // Prevent background scrolling by fixing the body position
  document.body.style.position = 'fixed';
  document.body.style.top = `-${previousPageState.scrollPosition}px`;
  document.body.style.width = '100%';
  document.body.style.overflow = 'hidden';

  const modal = document.getElementById("api-modal")
  const modalContent = modal.querySelector(".modal-content")
  const closeModalBtn = document.getElementById("close-modal")
  const submitApiBtn = document.getElementById("submit-api")
  const modalTitle = document.getElementById("modal-title")
  const apiMethod = document.getElementById("api-method")
  const apiDescription = document.getElementById("api-description")
  const paramsContainer = document.getElementById("params-container")
  const responseContainer = document.getElementById("response-container")
  const responseData = document.getElementById("response-data")
  const responseStatus = document.getElementById("response-status")
  const responseTime = document.getElementById("response-time")
  const responseActions = document.getElementById("response-actions")
  const endpointDisplay = document.getElementById("endpoint-display")
  const endpointUrl = document.getElementById("endpoint-url")
  const copyEndpointBtn = document.getElementById("copy-endpoint")

  // Reset modal state
  responseContainer.classList.add("hidden")
  endpointDisplay.classList.add("hidden")
  responseData.innerHTML = ""
  responseActions.innerHTML = ""
  submitApiBtn.classList.remove("hidden")
  paramsContainer.classList.remove("hidden")
  paramsContainer.innerHTML = ""

  modalTitle.textContent = name
  apiDescription.textContent = description || "No description available" // Fallback description
  apiMethod.textContent = method

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
          <input type='text' id='param-${key}' class='w-full px-4 py-3 text-sm text-gray-200 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-300' placeholder='${placeholderText}'>
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
          <input type='text' id='param-${paramName}' class='w-full px-4 py-3 text-sm text-gray-200 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-300' placeholder='${placeholderText}'>
          <div id='error-${paramName}' class='text-red-400 text-xs mt-2 hidden'>This field is required</div>
        `
        paramsContainer.appendChild(paramField)
      })
    }
  }

  // Show modal
  modal.classList.add("show")

  // Setup copy endpoint button
  copyEndpointBtn.addEventListener("click", async () => {
    const success = await copyToClipboard(endpointUrl.textContent)
    if (success) {
      copyEndpointBtn.classList.add("copied")
      copyEndpointBtn.querySelector(".tooltip-text").textContent = "Copied!"
      showToast("Endpoint copied to clipboard", "success")

      setTimeout(() => {
        copyEndpointBtn.classList.remove("copied")
        copyEndpointBtn.querySelector(".tooltip-text").textContent = "Copy to clipboard"
      }, 2000)
    } else {
      showToast("Failed to copy endpoint", "error")
    }
  })

  const closeModal = () => {
    modal.classList.remove("show")

    // Restore body position and scroll
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';

    // Restore the page state to what it was before the modal was opened
    if (previousPageState.activeTab) {
      const tabToActivate = document.querySelector(`.nav-link[data-page="${previousPageState.activeTab}"]`);
      if (tabToActivate && !tabToActivate.classList.contains("bg-dark-700")) {
        tabToActivate.click();
      }
    }

    if (previousPageState.searchValue) {
      const searchInput = document.getElementById("api-search");
      if (searchInput && searchInput.value !== previousPageState.searchValue) {
        searchInput.value = previousPageState.searchValue;
        // Trigger the input event to apply the search
        searchInput.dispatchEvent(new Event('input'));
      }
    }

    // Restore focus to the previously active element
    if (previousPageState.activeElement) {
      setTimeout(() => {
        previousPageState.activeElement.focus();
      }, 100);
    }

    // Restore scroll position
    window.scrollTo(0, previousPageState.scrollPosition);

    // Reset modal scroll position
    setTimeout(() => {
      modalContent.scrollTop = 0;
    }, 100);
  }

  closeModalBtn.onclick = closeModal

  // Close modal when clicking outside
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal()
    }
  })

  // Close modal with Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeModal()
    }
  })

  submitApiBtn.onclick = async () => {
    let isValid = true

    document.querySelectorAll('[id^="error-"]').forEach((errorElement) => {
      errorElement.classList.add("hidden")
    })

    if (paramsContainer.children.length > 0) {
      Array.from(paramsContainer.children).forEach((paramDiv) => {
        const inputElement = paramDiv.querySelector("input")
        const paramName = inputElement.id.replace("param-", "")
        const paramValue = inputElement.value.trim()
        const errorElement = document.getElementById(`error-${paramName}`)

        if (!paramName.startsWith("_") && paramValue === "") {
          isValid = false
          errorElement.classList.remove("hidden")
          inputElement.classList.add("border-red-500")
        } else {
          inputElement.classList.remove("border-red-500")
        }
      })
    }

    if (!isValid) {
      return
    }

    // Show loading state
    submitApiBtn.disabled = true
    submitApiBtn.innerHTML = `
      <span class="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
      Processing...
    `

    let apiUrl = endpoint

    if (paramsContainer.children.length > 0) {
      Array.from(paramsContainer.children).forEach((paramDiv) => {
        const inputElement = paramDiv.querySelector("input")
        const paramName = inputElement.id.replace("param-", "")
        const paramValue = inputElement.value

        if (paramName.startsWith("_") && paramValue === "") {
          return
        }

        if (apiUrl.includes(`{${paramName}}`)) {
          apiUrl = apiUrl.replace(`{${paramName}}`, encodeURIComponent(paramValue))
        } else {
          const urlObj = new URL(apiUrl, window.location.origin)
          urlObj.searchParams.set(paramName, paramValue)
          apiUrl = urlObj.pathname + urlObj.search
        }
      })
    }

    const fullUrl = new URL(apiUrl, window.location.origin).href

    // Display endpoint URL
    endpointDisplay.classList.remove("hidden")
    endpointUrl.textContent = fullUrl

    responseContainer.classList.remove("hidden")
    paramsContainer.classList.add("hidden")
    submitApiBtn.classList.add("hidden")

    const startTime = Date.now()
    try {
      responseData.innerHTML = `
        <div class="flex items-center justify-center p-4">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-purple"></div>
        </div>
      `

      const requestOptions = {
        method: method.toLowerCase(),
        headers: {
          "Content-Type": "application/json",
        },
      }

      const response = await fetch(fullUrl, requestOptions)
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
          responseData.innerHTML = `<img src='${objectUrl}' alt='Response Image' class='max-w-full h-auto rounded-lg' />`
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
      submitApiBtn.disabled = false
      submitApiBtn.textContent = "Send Request"
    }
  }
}

// Function to add syntax highlighting to JSON
function syntaxHighlight(json) {
  json = json.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">")
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "text-amber-400" // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "text-blue-400" // key
        } else {
          cls = "text-green-400" // string
        }
      } else if (/true|false/.test(match)) {
        cls = "text-accent-purple" // boolean
      } else if (/null/.test(match)) {
        cls = "text-accent-pink" // null
      }
      return '<span class="' + cls + '">' + match + '</span>'
    },
  )
}