// Product pricing data
const productPrices = {
  "hoodie-outsider": 89.99,
  "tee-ghosted": 34.99,
  "print-fractured": 29.99,
  "zine-misread": 12.99,
};

const productAvailability = {
  "hoodie-outsider": true,
  "tee-ghosted": true,
  "print-fractured": false,
  "zine-misread": true,
};

const productNames = {
  "hoodie-outsider": "Outsider Hoodie",
  "tee-ghosted": "Ghosted T-Shirt",
  "print-fractured": "Fractured Print",
  "zine-misread": "Misread Zine",
};

// ---- DOM Elements ----
const inquiryForm = document.getElementById("inquiry-form");
const inquiryTypeRadios = document.querySelectorAll('input[name="inquiry-type"]');
const productGroup = document.getElementById("product-group");
const quantityGroup = document.getElementById("quantity-group");
const sponsorshipTypeGroup = document.getElementById("sponsorship-type-group");
const budgetGroup = document.getElementById("budget-group");
const messageField = document.getElementById("message");
const charCount = document.getElementById("char-count");
const formLoading = document.getElementById("form-loading");
const formResponse = document.getElementById("form-response");
const submitBtn = document.getElementById("submit-btn");

// ---- Theme Toggle (same as main site) ----
const themeToggleBtn = document.getElementById("theme-toggle");
const body = document.body;

function setTheme(theme) {
  body.dataset.theme = theme;
  localStorage.setItem("mw-theme", theme);
  themeToggleBtn.textContent = theme === "dark" ? "☀️" : "🌙";
}

function toggleTheme() {
  const current = body.dataset.theme === "dark" ? "dark" : "light";
  setTheme(current === "dark" ? "light" : "dark");
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", toggleTheme);

  const savedTheme = localStorage.getItem("mw-theme");
  if (savedTheme === "dark" || savedTheme === "light") {
    setTheme(savedTheme);
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }
}

// ---- Show/hide fields based on inquiry type ----
function updateFormFields() {
  const selectedType = document.querySelector(
    'input[name="inquiry-type"]:checked'
  )?.value;

  if (selectedType === "product-inquiry") {
    productGroup.style.display = "flex";
    quantityGroup.style.display = "flex";
    sponsorshipTypeGroup.style.display = "none";
    budgetGroup.style.display = "none";
  } else if (selectedType === "sponsorship") {
    productGroup.style.display = "none";
    quantityGroup.style.display = "none";
    sponsorshipTypeGroup.style.display = "flex";
    budgetGroup.style.display = "flex";
  }
}

inquiryTypeRadios.forEach((radio) => {
  radio.addEventListener("change", updateFormFields);
});

updateFormFields();

// ---- Character counter ----
messageField.addEventListener("input", () => {
  const length = messageField.value.length;
  charCount.textContent = `${length} / 1000`;
});

// ---- Form Validation ----
function validateForm() {
  let isValid = true;
  const errors = {};

  // Clear previous errors
  document.querySelectorAll(".error-message").forEach((el) => {
    el.textContent = "";
  });
  document.querySelectorAll(".form-input, .form-textarea").forEach((el) => {
    el.classList.remove("error");
  });

  // Name validation
  const name = document.getElementById("name").value.trim();
  if (!name) {
    errors["name"] = "Name is required";
    isValid = false;
  } else if (name.length < 2) {
    errors["name"] = "Name must be at least 2 characters";
    isValid = false;
  }

  // Email validation
  const email = document.getElementById("email").value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors["email"] = "Email is required";
    isValid = false;
  } else if (!emailRegex.test(email)) {
    errors["email"] = "Please enter a valid email address";
    isValid = false;
  }

  // Phone validation (optional)
  const phone = document.getElementById("phone").value.trim();
  if (phone && phone.length < 10) {
    errors["phone"] = "Please enter a valid phone number";
    isValid = false;
  }

  // Inquiry type validation
  const inquiryType = document.querySelector(
    'input[name="inquiry-type"]:checked'
  );
  if (!inquiryType) {
    errors["inquiry-type"] = "Please select an inquiry type";
    isValid = false;
  }

  // Product inquiry validation
  if (inquiryType?.value === "product-inquiry") {
    const product = document.getElementById("product").value;
    if (!product) {
      errors["product"] = "Please select a product";
      isValid = false;
    }
  }

  // Sponsorship validation
  if (inquiryType?.value === "sponsorship") {
    const sponsorshipType = document.getElementById("sponsorship-type").value;
    const budget = document.getElementById("budget").value;

    if (!sponsorshipType) {
      errors["sponsorship-type"] = "Please select a sponsorship type";
      isValid = false;
    }
    if (!budget) {
      errors["budget"] = "Please select a budget range";
      isValid = false;
    }
  }

  // Message validation
  const message = document.getElementById("message").value.trim();
  if (!message) {
    errors["message"] = "Message is required";
    isValid = false;
  } else if (message.length < 10) {
    errors["message"] = "Message must be at least 10 characters";
    isValid = false;
  }

  // Terms validation
  const terms = document.getElementById("terms").checked;
  if (!terms) {
    errors["terms"] = "You must agree to the terms";
    isValid = false;
  }

  // Display errors
  Object.entries(errors).forEach(([field, message]) => {
    const errorEl = document.getElementById(`${field}-error`);
    const inputEl = document.getElementById(field);
    if (errorEl) {
      errorEl.textContent = message;
    }
    if (inputEl) {
      inputEl.classList.add("error");
    }
  });

  return isValid;
}

// ---- Generate Response ----
function generateResponse(formData) {
  const inquiryType = formData.get("inquiry-type");

  if (inquiryType === "product-inquiry") {
    return generateProductResponse(formData);
  } else if (inquiryType === "sponsorship") {
    return generateSponsorshipResponse(formData);
  }
}

function generateProductResponse(formData) {
  const productId = formData.get("product");
  const quantity = parseInt(formData.get("quantity")) || 1;
  const productName = productNames[productId];
  const price = productPrices[productId];
  const isAvailable = productAvailability[productId];

  const subtotal = price * quantity;
  const tax = subtotal * 0.08;
  const shipping = subtotal > 75 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  const availabilityStatus = isAvailable
    ? "✅ In Stock"
    : "⏳ Currently Out of Stock";
  const availabilityClass = isAvailable ? "response-success" : "response-info";

  return {
    type: availabilityClass,
    header: `Thank you for your interest, ${formData.get("name")}!`,
    content: `
      <div class="response-item">
        <span class="response-label">Product</span>
        <span class="response-value">${productName}</span>
      </div>
      <div class="response-item">
        <span class="response-label">Quantity</span>
        <span class="response-value">${quantity}</span>
      </div>
      <div class="response-item">
        <span class="response-label">Unit Price</span>
        <span class="response-value">$${price.toFixed(2)}</span>
      </div>
      <div class="response-item">
        <span class="response-label">Subtotal</span>
        <span class="response-value">$${subtotal.toFixed(2)}</span>
      </div>
      <div class="response-item">
        <span class="response-label">Tax (8%)</span>
        <span class="response-value">$${tax.toFixed(2)}</span>
      </div>
      <div class="response-item">
        <span class="response-label">Shipping</span>
        <span class="response-value">${shipping === 0 ? "FREE" : "$" + shipping.toFixed(2)}</span>
      </div>
      <div class="response-item" style="border-top: 2px solid currentColor; padding-top: 0.75rem; margin-top: 0.75rem;">
        <span class="response-label" style="font-weight: 700; font-size: 1.05rem;">Total Cost</span>
        <span class="response-value" style="font-weight: 700; font-size: 1.05rem;">$${total.toFixed(2)}</span>
      </div>
      <div class="response-item" style="border: none; padding: 1rem 0 0 0; margin-top: 0.5rem;">
        <span class="response-label">Availability</span>
        <span class="response-value">${availabilityStatus}</span>
      </div>
      <p style="margin-top: 1rem; font-size: 0.9rem;">
        ${
          isAvailable
            ? "We'll send you a confirmation email with payment details and estimated shipping time shortly."
            : "We'll notify you as soon as this item is back in stock. You can pre-order now!"
        }
      </p>
    `,
  };
}

function generateSponsorshipResponse(formData) {
  const sponsorshipType = formData.get("sponsorship-type");
  const budget = formData.get("budget");
  const sponsorName = formData.get("name");

  const sponsorshipDetails = {
    "brand-partnership": {
      name: "Brand Partnership",
      baseInvestment: "$15,000 - $50,000",
      deliverables:
        "Co-branded content, social media promotion, exclusive collaborations",
      timeline: "3-6 months",
    },
    "event-sponsorship": {
      name: "Event Sponsorship",
      baseInvestment: "$5,000 - $25,000",
      deliverables:
        "Branding presence, exclusive event merch, media recognition",
      timeline: "1-3 months",
    },
    influencer: {
      name: "Influencer Collaboration",
      baseInvestment: "$3,000 - $15,000",
      deliverables: "Social posts, product features, audience reach up to 100K+",
      timeline: "1-2 months",
    },
    other: {
      name: "Custom Sponsorship",
      baseInvestment: "To be discussed",
      deliverables:
        "Tailored to your specific goals and requirements",
      timeline: "Flexible",
    },
  };

  const details = sponsorshipDetails[sponsorshipType];

  return {
    type: "response-info",
    header: `Sponsorship Inquiry Received, ${sponsorName}!`,
    content: `
      <div class="response-item">
        <span class="response-label">Sponsorship Type</span>
        <span class="response-value">${details.name}</span>
      </div>
      <div class="response-item">
        <span class="response-label">Your Budget Range</span>
        <span class="response-value">${getBudgetRange(budget)}</span>
      </div>
      <div class="response-item">
        <span class="response-label">Typical Investment</span>
        <span class="response-value">${details.baseInvestment}</span>
      </div>
      <div class="response-item">
        <span class="response-label">Standard Deliverables</span>
        <span class="response-value">${details.deliverables}</span>
      </div>
      <div class="response-item">
        <span class="response-label">Typical Timeline</span>
        <span class="response-value">${details.timeline}</span>
      </div>
      <p style="margin-top: 1rem; font-size: 0.9rem;">
        Our team will review your inquiry and reach out within 2-3 business days 
        with a personalized proposal and next steps. We're excited to explore how 
        we can collaborate!
      </p>
    `,
  };
}

function getBudgetRange(budgetValue) {
  const budgets = {
    "5k-10k": "$5,000 - $10,000",
    "10k-25k": "$10,000 - $25,000",
    "25k-50k": "$25,000 - $50,000",
    "50k+": "$50,000+",
  };
  return budgets[budgetValue] || budgetValue;
}

// ---- Form Submission ----
inquiryForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  submitBtn.disabled = true;
  formLoading.style.display = "flex";
  formResponse.style.display = "none";

  const formData = new FormData(inquiryForm);

  try {
    // Simulate server processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const response = generateResponse(formData);
    displayResponse(response);

    inquiryForm.reset();
    charCount.textContent = "0 / 1000";
    updateFormFields();
  } catch (error) {
    console.error("Error:", error);
    displayResponse({
      type: "response-error",
      header: "Oops! Something went wrong",
      content: `
        <p>We encountered an error while processing your inquiry. 
        Please try again or contact us at hello@misunderstoodworld.com</p>
      `,
    });
  } finally {
    submitBtn.disabled = false;
    formLoading.style.display = "none";
  }
});

// ---- Display Response ----
function displayResponse(response) {
  formResponse.innerHTML = `
    <div class="response-header">${response.header}</div>
    <div class="response-content">${response.content}</div>
  `;
  formResponse.className = `form-response ${response.type}`;
  formResponse.style.display = "block";

  formResponse.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ---- FAQ Accordion ----
document.addEventListener("DOMContentLoaded", () => {
  const faqItems = document.querySelectorAll(".faq-item");
  
  faqItems.forEach((item) => {
    const summary = item.querySelector("summary");
    
    summary.addEventListener("click", () => {
      // Close other open items
      faqItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.open) {
          otherItem.open = false;
        }
      });
    });
  });
});
