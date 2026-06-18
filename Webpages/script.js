// CONFIGURATION
const CONFIG = {
    shopName: "Misunderstood World",
    // 🔧 1 Seymour Street, Observatory, Cape Town, 7925, South Africa
    location: [-33.93675, 18.45955], // Approx. coordinates for 1 Seymour St, Observatory
    initialZoom: 13,
    finalZoom: 16,
    flyDuration: 3,
    googleMapsLink: "https://maps.google.com/?q=1+Seymour+Street+Observatory+Cape+Town+7925+South+Africa"
};



// UTILITY FUNCTIONS
/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, duration = 3000) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), duration);
}

/**
 * Animate element with a class toggle
 * @param {HTMLElement} element
 * @param {string} className
 * @param {number} duration
 */
function animateElement(element, className, duration = 300) {
    element.classList.add(className);
    setTimeout(() => element.classList.remove(className), duration);
}

// LOADER
function hideLoader() {
    const loader = document.querySelector(".loader-wrapper");
    setTimeout(() => {
        loader.classList.add("hidden");
    }, 2000);
}

// MAP INITIALIZATION
function initMap() {
    // Create map instance
    const map = L.map("map", {
        center: CONFIG.location,
        zoom: CONFIG.initialZoom,
        zoomControl: true,
        attributionControl: true,
    });

    // Add OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
    }).addTo(map);

    return map;
}

// CUSTOM MARKER
function createCustomMarker() {
    return L.divIcon({
        className: "custom-marker-wrapper",
        html: `
            <div class="marker-ripple"></div>
            <div class="marker-pin"></div>
        `,
        iconSize: [60, 60],
        iconAnchor: [30, 50],
        popupAnchor: [0, -55],
    });
}

// POPUP CONTENT
function createPopupContent() {
    return `
        <div class="popup-content">
            <h3>🏪 ${CONFIG.shopName}</h3>
            <p>📍 1 Seymour Street, Observatory, Cape Town, 7925</p>
            <p>🕒 Mon-Sat: 10AM - 8PM</p>
            <p>📞 (+27) 83-404-3285</p>
            <span class="popup-badge">✨ Open Now</span>
        </div>
    `;
}


// MARKER SETUP
function setupMarker(map) {
    const shopIcon = createCustomMarker();
    const marker = L.marker(CONFIG.location, {
        icon: shopIcon,
        title: CONFIG.shopName,
    }).addTo(map);

    // Bind popup
    marker.bindPopup(createPopupContent(), {
        maxWidth: 250,
        className: "custom-popup",
    });

    // Open popup after fly animation
    setTimeout(() => {
        marker.openPopup();
        showToast("📍 Welcome to Misunderstood World!");
    }, CONFIG.flyDuration * 1000 + 500);

    // Click event on marker
    marker.on("click", function () {
        showToast("🏪 Click 'Get Directions' for navigation!");
    });

    // Mouse over event
    marker.on("mouseover", function () {
        this.openPopup();
    });

    return marker;
}

// FLY TO LOCATION
function flyToShop(map) {
    setTimeout(() => {
        map.flyTo(CONFIG.location, CONFIG.finalZoom, {
            animate: true,
            duration: CONFIG.flyDuration,
            easeLinearity: 0.2,
        });
    }, 2200);
}

// STORE INFO PANEL
function setupStoreInfoPanel() {
    const storeInfo = document.getElementById("storeInfo");

    // Show panel after fly animation completes
    setTimeout(() => {
        storeInfo.classList.add("show");
    }, CONFIG.flyDuration * 1000 + 1000);
}

// BUTTON CONTROLS
function setupControls(map, marker) {
    // Center on store button
    const centerBtn = document.getElementById("centerBtn");
    centerBtn.addEventListener("click", function () {
        map.flyTo(CONFIG.location, CONFIG.finalZoom, {
            animate: true,
            duration: 1.5,
        });
        marker.openPopup();
        showToast("🎯 Centering on Misunderstood World...");
        
        // Button animation
        this.style.transform = "scale(0.8) rotate(360deg)";
        setTimeout(() => {
            this.style.transform = "";
        }, 500);
    });

    // Toggle info panel button
    const toggleInfoBtn = document.getElementById("toggleInfoBtn");
    const storeInfo = document.getElementById("storeInfo");
    let infoVisible = true;

    toggleInfoBtn.addEventListener("click", function () {
        infoVisible = !infoVisible;
        storeInfo.classList.toggle("show", infoVisible);
        
        showToast(infoVisible ? "ℹ️ Info panel shown" : "ℹ️ Info panel hidden");

        // Button animation
        this.style.transform = "scale(0.8)";
        setTimeout(() => {
            this.style.transform = "";
        }, 200);
    });

    // Directions button
    const directionsBtn = document.getElementById("directionsBtn");
    directionsBtn.addEventListener("click", function () {
        window.open(CONFIG.googleMapsLink, "_blank");
        showToast("🗺️ Opening Google Maps...");
    });
}

// SCROLL ANIMATIONS
function setupScrollAnimations() {
    const featureCards = document.querySelectorAll(".feature-card");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const delay = entry.target.getAttribute("data-delay") || 0;
                    setTimeout(() => {
                        entry.target.classList.add("visible");
                    }, parseInt(delay));
                }
            });
        },
        { threshold: 0.15 }
    );

    featureCards.forEach((card) => observer.observe(card));
}

// MAP EVENT LISTENERS
function setupMapEvents(map) {
    // Show zoom level on zoom
    map.on("zoomend", function () {
        const zoom = map.getZoom();
        if (zoom < 12) {
            showToast("🔍 Zoom in to see the store better!");
        }
    });

    // Click on map (not marker)
    map.on("click", function (e) {
        const distance = map.distance(e.latlng, CONFIG.location);
        if (distance > 500) {
            showToast(`📍 ${Math.round(distance / 1000 * 10) / 10} km away from store`);
        }
    });
}

// PARALLAX EFFECT
function setupParallax() {
    window.addEventListener("scroll", function () {
        const scrollY = window.scrollY;
        const mapWrapper = document.querySelector(".map-wrapper");
        
        if (mapWrapper) {
            const offset = scrollY * 0.03;
            mapWrapper.style.transform = `translateY(${offset}px)`;
        }
    });
}

// CURSOR EFFECT ON MAP
function setupCursorEffect(map) {
    const mapContainer = document.getElementById("map");
    
    mapContainer.addEventListener("mouseenter", function () {
        this.style.cursor = "grab";
    });

    mapContainer.addEventListener("mousedown", function () {
        this.style.cursor = "grabbing";
    });

    mapContainer.addEventListener("mouseup", function () {
        this.style.cursor = "grab";
    });
}

// TYPING ANIMATION
function setupTypingEffect() {
    const subtitle = document.querySelector(".subtitle");
    if (!subtitle) return;

    const text = subtitle.textContent;
    subtitle.textContent = "";

    let index = 0;

    setTimeout(() => {
        const interval = setInterval(() => {
            subtitle.textContent += text[index];
            index++;
            if (index >= text.length) clearInterval(interval);
        }, 50);
    }, 1500);
}

// LIVE CLOCK
function setupLiveClock() {
    // Check if shop is open
    function isShopOpen() {
        const now = new Date();
        const day = now.getDay(); // 0 = Sunday
        const hour = now.getHours();

        if (day === 0) {
            return hour >= 12 && hour < 18; // Sun: 12PM - 6PM
        } else {
            return hour >= 10 && hour < 20; // Mon-Sat: 10AM - 8PM
        }
    }

    // Update popup badge
    function updateOpenStatus() {
        const badge = document.querySelector(".popup-badge");
        if (badge) {
            const open = isShopOpen();
            badge.textContent = open ? "✅ Open Now" : "❌ Closed";
            badge.style.background = open
                ? "linear-gradient(135deg, #27ae60, #2ecc71)"
                : "linear-gradient(135deg, #7f8c8d, #95a5a6)";
        }
    }

    updateOpenStatus();
    setInterval(updateOpenStatus, 60000); // Update every minute
}

// MAIN INITIALIZATION
document.addEventListener("DOMContentLoaded", function () {
    // Step 1: Hide loader
    hideLoader();

    // Step 2: Initialize map
    const map = initMap();

    // Step 3: Setup marker
    const marker = setupMarker(map);

    // Step 4: Fly to shop
    flyToShop(map);

    // Step 5: Show store info panel
    setupStoreInfoPanel();

    // Step 6: Setup controls
    setupControls(map, marker);

    // Step 7: Setup scroll animations
    setupScrollAnimations();

    // Step 8: Setup map events
    setupMapEvents(map);

    // Step 9: Setup parallax
    setupParallax();

    // Step 10: Setup cursor
    setupCursorEffect(map);

    // Step 11: Setup typing effect
    setupTypingEffect();

    // Step 12: Setup live clock
    setupLiveClock();

    // Welcome toast
    setTimeout(() => {
        showToast("🌍 Welcome! Exploring Misunderstood World...");
    }, 100);
});