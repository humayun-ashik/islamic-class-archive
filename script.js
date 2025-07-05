// Global variables
let classRecords = []
let resources = []
let currentPage = 1
const itemsPerPage = 10

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  loadResources()
  loadClassRecords()
})

// Load resources from JSON
async function loadResources() {
  try {
    const response = await fetch("data/resources.json")
    const data = await response.json()
    resources = data.resources
    displayResources()
  } catch (error) {
    console.error("Error loading resources:", error)
    showResourcesError()
  }
}

// Load class records from JSON
async function loadClassRecords() {
  try {
    const response = await fetch("data/class-records.json")
    const data = await response.json()
    // Sort by date descending (newest first)
    classRecords = data.classRecords.sort((a, b) => new Date(b.date) - new Date(a.date))
    displayClassRecords()
    setupPagination()
  } catch (error) {
    console.error("Error loading class records:", error)
    showRecordsError()
  }
}

// Display resources
function displayResources() {
  const loadingElement = document.getElementById("resources-loading")
  const gridElement = document.getElementById("resources-grid")
  const emptyElement = document.getElementById("resources-empty")

  loadingElement.style.display = "none"

  if (resources.length === 0) {
    emptyElement.style.display = "block"
    return
  }

  gridElement.innerHTML = resources
    .map(
      (resource) => `
        <div class="resource-card" onclick="openLink('${resource.driveLink}')">
            <h3 class="resource-title">${resource.title}</h3>
            <p class="resource-writer">by ${resource.writer}</p>
            <button class="btn">
                <i class="fas fa-external-link-alt"></i>
                Open
            </button>
        </div>
    `,
    )
    .join("")
}

// Display class records with pagination
function displayClassRecords() {
  const loadingElement = document.getElementById("records-loading")
  const recordsElement = document.getElementById("class-records")
  const emptyElement = document.getElementById("records-empty")

  loadingElement.style.display = "none"

  if (classRecords.length === 0) {
    emptyElement.style.display = "block"
    return
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRecords = classRecords.slice(startIndex, endIndex)

  recordsElement.innerHTML = currentRecords
    .map(
      (record) => `
        <div class="record-card">
            <div class="record-header">
                <div class="record-meta">
                    <div class="record-date">
                        <i class="fas fa-calendar"></i>
                        ${formatDate(record.date)}
                    </div>
                    <span class="badge ${record.classType === "Daily Activity" ? "badge-daily" : "badge-seerat"}">
                        ${record.classType}
                    </span>
                </div>
                <button class="btn" onclick="openLink('${record.audioLink}')">
                    <i class="fas fa-external-link-alt"></i>
                    Audio
                </button>
            </div>
            <div class="record-content">
                <div class="content-section homework-section">
                    <h4 class="content-title">📝 Homework</h4>
                    <p class="content-text">${record.homework}</p>
                </div>
                <div class="content-section summary-section">
                    <h4 class="content-title">📚 Class Summary</h4>
                    <p class="content-text">${record.summary}</p>
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

// Setup pagination
function setupPagination() {
  const totalPages = Math.ceil(classRecords.length / itemsPerPage)
  const paginationElement = document.getElementById("pagination")

  if (totalPages <= 1) {
    paginationElement.style.display = "none"
    return
  }

  paginationElement.style.display = "flex"

  let paginationHTML = `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""}>
            <i class="fas fa-chevron-left"></i> Previous
        </button>
    `

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `
            <button class="page-number ${i === currentPage ? "active" : ""}" onclick="changePage(${i})">
                ${i}
            </button>
        `
  }

  paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? "disabled" : ""}>
            Next <i class="fas fa-chevron-right"></i>
        </button>
    `

  paginationElement.innerHTML = paginationHTML
}

// Change page
function changePage(page) {
  const totalPages = Math.ceil(classRecords.length / itemsPerPage)

  if (page < 1 || page > totalPages) return

  currentPage = page
  displayClassRecords()
  setupPagination()

  // Scroll to top of class records section
  document.querySelector(".class-records-section").scrollIntoView({
    behavior: "smooth",
  })
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Open external link
function openLink(url) {
  window.open(url, "_blank")
}

// Show error states
function showResourcesError() {
  document.getElementById("resources-loading").style.display = "none"
  document.getElementById("resources-empty").style.display = "block"
  document.getElementById("resources-empty").innerHTML = `
        <div class="empty-icon">⚠️</div>
        <p>Error loading resources. Please check your data files.</p>
    `
}

function showRecordsError() {
  document.getElementById("records-loading").style.display = "none"
  document.getElementById("records-empty").style.display = "block"
  document.getElementById("records-empty").innerHTML = `
        <div class="empty-icon">⚠️</div>
        <p>Error loading class records. Please check your data files.</p>
    `
}
