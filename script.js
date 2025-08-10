// Global variables
let classRecords = []
let resources = []
let currentPage = 1
const itemsPerPage = 5

// URL for the raw README.md content on GitHub
//const README_URL = "https://raw.githubusercontent.com/humayun-ashik/islamic-class-archive/main/README.md";

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  loadResources()
  loadClassRecords()
  loadQuranResources()
  setupNavigation()
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

// Load Quran resources by fetching the README.md from the provided URL
async function loadQuranResources() {
  const readmeContentDiv = document.getElementById("quran-resources-content")
  const emptyElement = document.getElementById("quran-resources-empty")
  
  try {
    const response = await fetch(README_URL)
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const markdown = await response.text()
    
    if (markdown.trim() === "") {
      emptyElement.style.display = "block"
      readmeContentDiv.innerHTML = ""
    } else {
      // Convert markdown to HTML using marked.js and inject it
      const html = marked.parse(markdown)
      readmeContentDiv.innerHTML = `<div class="readme-content">${html}</div>`
      emptyElement.style.display = "none"
    }
  } catch (error) {
    console.error("Error loading Quran resources:", error)
    emptyElement.style.display = "block"
    emptyElement.innerHTML = `
      <div class="empty-icon">⚠️</div>
      <p>Error loading resources from GitHub. Please check the URL.</p>
    `
  }
}

// Setup navigation logic
function setupNavigation() {
    const navLinks = document.querySelectorAll(".nav-link")
    const sections = document.querySelectorAll(".content-section")
  
    navLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const targetId = e.target.getAttribute("href").substring(1)
  
        // Hide all sections and remove active class from all links
        sections.forEach(section => {
          section.style.display = "none"
        })
        navLinks.forEach(navLink => {
          navLink.classList.remove("active")
        })
  
        // Show the target section and add active class to the clicked link
        document.getElementById(targetId).style.display = "block"
        e.target.classList.add("active")
      })
    })
  
    // Initially show the first section
    document.getElementById("resources-section").style.display = "block"
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
        <div class="resource-card">
          <div>
            <h3 class="resource-title">${resource.title}</h3>
            <p class="resource-writer">${resource.writer}</p>
          </div>
          <button class="btn btn-secondary" onclick="openLink('${resource.driveLink}')">
            View <i class="fas fa-external-link-alt"></i>
          </button>
        </div>
    `
    )
    .join("")
}

// Display class records
function displayClassRecords() {
  const loadingElement = document.getElementById("records-loading")
  const recordsElement = document.getElementById("class-records")
  const emptyElement = document.getElementById("records-empty")
  const paginationElement = document.getElementById("pagination")

  loadingElement.style.display = "none"

  if (classRecords.length === 0) {
    emptyElement.style.display = "block"
    paginationElement.style.display = "none"
    return
  }

  emptyElement.style.display = "none"
  paginationElement.style.display = "flex"

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const recordsOnPage = classRecords.slice(startIndex, endIndex)

  recordsElement.innerHTML = recordsOnPage
    .map(
      (record) => `
        <div class="record-card">
            <div class="record-header">
                <div class="record-meta">
                    <span class="record-date">${formatDate(record.date)}</span>
                    <div class="record-badges">
                        <span class="badge badge-${record.classType.toLowerCase().replace(" ", "-")}">${record.classType}</span>
                    </div>
                </div>
            </div>
            <div class="record-content">
                <div>
                    <h4 class="content-title">Summary</h4>
                    <p class="content-text">${record.summary}</p>
                </div>
                <div>
                    <h4 class="content-title">Homework</h4>
                    <p class="content-text">${record.homework}</p>
                </div>
                ${
                  record.audioLink && record.audioLink !== "N/A"
                    ? `<div class="audio-section">
                          <button class="btn btn-primary" onclick="openLink('${record.audioLink}')">
                              <i class="fas fa-play"></i> Listen
                          </button>
                      </div>`
                    : ""
                }
            </div>
        </div>
    `
    )
    .join("")
}

// Setup pagination buttons
function setupPagination() {
  const paginationElement = document.getElementById("pagination")
  const totalPages = Math.ceil(classRecords.length / itemsPerPage)
  
  if (totalPages <= 1) {
    paginationElement.style.display = "none";
    return;
  }
  
  let paginationHTML = `
      <button onclick="changePage(${
        currentPage - 1
      })" ${currentPage === 1 ? "disabled" : ""}>
          <i class="fas fa-chevron-left"></i> Previous
      </button>
  `

  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `
          <button class="page-number ${
            i === currentPage ? "active" : ""
          }" onclick="changePage(${i})">${i}</button>
      `
  }

  paginationHTML += `
      <button onclick="changePage(${
        currentPage + 1
      })" ${currentPage === totalPages ? "disabled" : ""}>
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
