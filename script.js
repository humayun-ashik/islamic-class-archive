// Global variables
let classRecords = []
let resources = []
let allQuranResources = [];
let currentPage = 1
const itemsPerPage = 5

// The URL for the Quran resources JSON file
const QURAN_RESOURCES_URL = 'data/quran-resources.json';

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
    // Call the function to set up the interactive navigation
    setupNavigation();

    // Load data for the content sections
    loadResources();
    loadClassRecords();
    loadQuranResources(); // Call the new function to load Quran resources
});

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
        // Find the active link and show its corresponding section
        const activeLink = document.querySelector(".nav-link.active");
        const targetId = activeLink ? activeLink.getAttribute("href").substring(1) : contentSections[0].id;
        document.getElementById(targetId).style.display = "block";
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
            const targetId = event.currentTarget.getAttribute("href").substring(1);

            // Hide all content sections
            contentSections.forEach(section => {
                section.style.display = "none";
            });

            // Show the target section
            document.getElementById(targetId).style.display = "block";
        });
    });

    // Add event listeners for the search functionality
    document.getElementById('search-button').addEventListener('click', filterQuranResources);
    document.getElementById('search-input').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            filterQuranResources();
        }
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

// New function to load the Quran resources from the JSON file
async function loadQuranResources() {
    const container = document.getElementById("quran-resources-content");
    const emptyElement = document.getElementById("quran-resources-empty");

    try {
        const response = await fetch(QURAN_RESOURCES_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        allQuranResources = data.quranResources;
        renderQuranResources(allQuranResources);

        // Hide empty state if data is loaded
        emptyElement.style.display = "none";

    } catch (error) {
        console.error("Error loading Quran resources:", error);
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <p>Error loading resources. Please check your data files.</p>
            </div>
        `;
        // Hide the content container and show the empty state
        container.style.display = "none";
        emptyElement.style.display = "block";
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
        <h3>${resource.title}</h3>
        <p>by ${resource.writer}</p>
        <a href="${resource.driveLink}" target="_blank" class="link-button">
            View <i class="fas fa-external-link-alt"></i>
        </a>
    </div>
  `
        )
        .join("")
}

// Display class records
function displayClassRecords() {
    const recordsElement = document.getElementById("class-records")
    const loadingElement = document.getElementById("records-loading")
    const emptyElement = document.getElementById("records-empty")
    
    loadingElement.style.display = "none"

    if (classRecords.length === 0) {
        emptyElement.style.display = "block"
        return
    }
    
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    const recordsToDisplay = classRecords.slice(start, end)

    recordsElement.innerHTML = recordsToDisplay
        .map(
            (record) => `
    <div class="class-record-card">
        <div class="record-header">
            <span class="date"><i class="fas fa-calendar-alt"></i> ${formatDate(record.date)}</span>
            <span class="class-type ${record.classType.toLowerCase().replace(/\s/g, '-')}">${record.classType}</span>
        </div>
        <p class="homework"><strong>Homework:</strong> ${record.homework}</p>
        <p class="summary"><strong>Summary:</strong> ${record.summary}</p>
        ${
            record.audioLink && record.audioLink !== "N/A"
                ? `<a href="${record.audioLink}" target="_blank" class="audio-link">
                        <i class="fas fa-headphones"></i> Listen
                    </a>`
                : ""
        }
    </div>
  `
        )
        .join("")
}

// Setup pagination
function setupPagination() {
    const paginationElement = document.getElementById("pagination")
    const totalPages = Math.ceil(classRecords.length / itemsPerPage)

    if (totalPages <= 1) {
        paginationElement.style.display = "none"
        return
    }

    paginationElement.style.display = "flex"

    let paginationHTML = `
    <button onclick="changePage(1)" ${currentPage === 1 ? "disabled" : ""}>
        <i class="fas fa-chevron-left"></i> First
    </button>
  `

    // Generate page numbers
    let startPage = Math.max(1, currentPage - 2)
    let endPage = Math.min(totalPages, currentPage + 2)

    if (startPage > 1) {
        paginationHTML += `<span class="ellipsis">...</span>`
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
      <button onclick="changePage(${i})" class="page-number ${
            i === currentPage ? "active" : ""
        }">${i}</button>
    `
    }

    if (endPage < totalPages) {
        paginationHTML += `<span class="ellipsis">...</span>`
    }

    paginationHTML += `
    <button onclick="changePage(${totalPages})" ${
        currentPage === totalPages ? "disabled" : ""
    }>
        Last <i class="fas fa-chevron-right"></i>
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
    window.open(url, "a_blank")
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


// --- New functions for Quran resources ---

// Function to render the resources using Handlebars
function renderQuranResources(resourcesToRender) {
    const source = document.getElementById("quran-resources-template").innerHTML;
    const template = Handlebars.compile(source);
    const html = template({ quranResources: resourcesToRender });
    const container = document.getElementById("quran-resources-content");
    container.innerHTML = html;
}

// Function to filter the resources based on search input
function filterQuranResources() {
    const query = document.getElementById('search-input').value.toLowerCase();
    if (query === '') {
        renderQuranResources(allQuranResources); // Show all resources if search is empty
        return;
    }

    const filteredResources = allQuranResources.filter(resource => {
        const searchInAyat = resource.ayat.toLowerCase().includes(query);
        const searchInName = resource.name.toLowerCase().includes(query);
        const searchInType = resource.resourceType.toLowerCase().includes(query);
        const searchInText = resource.resources.some(link => link.text.toLowerCase().includes(query));

        return searchInAyat || searchInName || searchInType || searchInText;
    });

    renderQuranResources(filteredResources);
}
