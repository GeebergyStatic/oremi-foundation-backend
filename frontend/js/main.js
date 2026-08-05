// Select the navbar and nav links
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.navbar .nav-link');
const navbarToggler = document.querySelector('.navbar-toggler');
const elementToHide = document.getElementById('elementToHide');

// Toggle navbar expanded/collapsed state
navbarToggler.addEventListener('click', () => {
    const isExpanded = navbarToggler.getAttribute('aria-expanded') === 'true';

    // Toggle visibility of the element
    elementToHide.style.display = elementToHide.style.display === 'none' ? 'block' : 'none';

    if (isExpanded) {
        // Only remove scroll classes if scrollY is less than 100
        if (window.scrollY < 100) {
            navbar.classList.remove('scrolled');
            navLinks.forEach(link => link.classList.remove('scrolled-link'));
        }
    } else {
        navbar.classList.add('scrolled');
        navLinks.forEach(link => link.classList.add('scrolled-link'));
    }
});


// Handle scroll effects
window.addEventListener('scroll', () => {
    const isExpanded = navbarToggler.getAttribute('aria-expanded') === 'true';
    if (!isExpanded && window.scrollY > 100) {
        navbar.classList.add('scrolled'); // Add class to navbar
        navLinks.forEach(link => link.classList.add('scrolled-link')); // Add class to nav links
    } else if (!isExpanded) {
        navbar.classList.remove('scrolled'); // Remove class from navbar
        navLinks.forEach(link => link.classList.remove('scrolled-link')); // Remove class from nav links
    }
});

// Notification functions
function showNotification() {
    const notification = document.getElementById("chatNotification");
    if (notification) {
        notification.style.display = "block"; // Show notification
    }
}

function closeNotification() {
    const notification = document.getElementById("chatNotification");
    if (notification) {
        notification.style.display = "none"; // Hide notification
    }
}

// Hero section image and heading updates
const heroSection = document.getElementById("heroSection");
const heroHeading = document.getElementById("heroHeading");

// Arrays of background images and corresponding headings
const backgroundImages = [
    "https://cdn.oremiazibabenfoundation.org/genral-page-images/group_pic.jpg"
];
const headings = [
    "Charity Foundation"
];

// Ensure arrays have the same length
if (backgroundImages.length !== headings.length) {
    console.error("Background images and headings arrays must have the same length.");
}

const intervalTime = 8000; // Interval time in milliseconds
let index = 0;

function changeHeroContent() {
    if (heroSection && heroHeading) {
        // Update background image and heading text
        heroSection.style.backgroundImage = `url(${backgroundImages[index]})`;
        heroHeading.textContent = headings[index];

        // Move to the next index
        index = (index + 1) % backgroundImages.length;
    }
}

// Initialize hero section updates
if (backgroundImages.length > 0 && headings.length > 0) {
    changeHeroContent();
    setInterval(changeHeroContent, intervalTime);
}
