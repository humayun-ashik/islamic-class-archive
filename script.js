// Global variables
let classRecords = []
let resources = []
let currentPage = 1
// Changed to 5 items per page as requested
const itemsPerPage = 5

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
    // Call the function to set up the interactive navigation
    setupNavigation();

    // Load data for the content sections
    loadResources();
    loadClassRecords();
})

// New function to handle navigation and content display
function setupNavigation() {
    const navLinks = document.querySelectorAll(".nav-link");
    const contentSections = document.querySelectorAll(".content-section");

    // Hide all content sections initially
    contentSections.forEach(section => {
        section.style.display = "none";
    });

    // Show the first content section by default
    if (contentSections.length > 0) {
        contentSections[0].style.display = "block";
    }

    // Add click event listeners to each navigation link
    navLinks.forEach(link => {
        link.addEventListener("click", event => {
            // Prevent the default anchor behavior (jumping to the section)
            event.preventDefault();

            // Remove 'active' class from all links
            navLinks.forEach(item => item.classList.remove("active"));

            // Add 'active' class to the clicked link
            event.currentTarget.classList.add("active");

            // Get the target section's ID from the href attribute
            const targetId = event.currentTarget.getAttribute("href");

            // Hide all content sections
            contentSections.forEach(section => {
                section.style.display = "none";
            });

            // Show the target content section
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.style.display = "block";
            }
        });
    });
}

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
        <div class="resource-card">
            <h3 class="resource-title">${resource.title}</h3>
            <p class="resource-writer">${resource.writer}</p>
            <button class="btn" onclick="openLink('${resource.driveLink}')">
                <i class="fas fa-external-link-alt"></i> Access
            </button>
        </div>
    `
    )
    .join("")
}

// Display class records for the current page
function displayClassRecords() {
  const loadingElement = document.getElementById("records-loading")
  const recordsElement = document.getElementById("class-records")
  const emptyElement = document.getElementById("records-empty")

  loadingElement.style.display = "none"

  if (classRecords.length === 0) {
    emptyElement.style.display = "block"
    document.getElementById("pagination").style.display = "none"
    return
  }

  document.getElementById("pagination").style.display = "flex"

  const start = (currentPage - 1) * itemsPerPage
  const end = start + itemsPerPage
  const paginatedRecords = classRecords.slice(start, end)

  recordsElement.innerHTML = paginatedRecords
    .map(
      (record) => `
        <div class="record-card">
            <div class="record-header">
                <div class="record-meta">
                    <div class="record-date">
                        <i class="fas fa-calendar-alt"></i> ${formatDate(
                          record.date
                        )}
                    </div>
                </div>
                <div class="record-badges">
                    <span class="badge ${
                      record.classType === "Daily Activity" ? "badge-daily" : "badge-seerat"
                    }">${record.classType}</span>
                </div>
            </div>
            <div class="record-content">
                <div class="summary-section">
                    <p class="content-title"><i class="fas fa-book-reader"></i> Summary</p>
                    <p class="content-text">${record.summary}</p>
                </div>
                <div class="homework-section">
                    <p class="content-title"><i class="fas fa-tasks"></i> Homework</p>
                    <p class="content-text">${record.homework}</p>
                </div>
                ${record.audioLink && record.audioLink !== 'N/A' ? `
                    <div class="audio-section">
                        <p class="content-title"><i class="fas fa-headphones"></i> Class Record</p>
                        <button class="btn" onclick="playAudio('${record.audioLink}')">
                            <i class="fas fa-play"></i> Listen
                        </button>
                    </div>
                ` : ''}
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
    paginationElement.style.display = "none"
    return
  }

  let paginationHTML = ""
  paginationHTML += `
        <button onclick="changePage(${currentPage - 1})" ${
    currentPage === 1 ? 'disabled="true"' : ""
  }>
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
        <button onclick="changePage(${currentPage + 1})" ${
    currentPage === totalPages ? 'disabled="true"' : ""
  }>
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

// Play audio link
function playAudio(url) {
    if (url && url !== 'N/A') {
        window.open(url, "_blank");
    }
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
