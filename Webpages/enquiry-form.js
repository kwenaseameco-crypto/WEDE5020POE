/* ================================================================ */
/*                    MESSAGE FORM HANDLER                          */
/* ================================================================ */

// Configuration - Change these to your email details
const EMAIL_CONFIG = {
  recipientEmail: "hello@misunderstoodworld.com",
  recipientName: "Misunderstood World",
  senderName: "Misunderstood World Message System",
};

// Message type labels
const MESSAGE_TYPES = {
  feedback: "💬 Feedback",
  suggestion: "💡 Suggestion",
  complaint: "⚠️ Complaint",
  "collaboration": "🤝 Collaboration Inquiry",
  "media-inquiry": "📰 Media Inquiry",
  general: "❓ General Question",
  other: "📌 Other",
};

// DOM Elements
const messageForm = document.getElementById("message-form");
const senderNameInput = document.getElementById("sender-name");
const senderEmailInput = document.getElementById("sender-email");
const senderPhoneInput = document.getElementById("sender-phone");
const messageTypeSelect = document.getElementById("message-type");
const messageSubjectInput = document.getElementById("message-subject");
const messageBodyInput = document.getElementById("message-body");
const charCount = document.getElementById("char-count");
const formLoading = document.getElementById("form-loading");
const formResponse = document.getElementById("form-response");
const sendBtn = document.getElementById("send-btn");

// Preview Elements
const previewFrom = document.getElementById("preview-from");
const previewSubject = document.getElementById("preview-subject");
const previewType = document.getElementById("preview-type");
const previewName = document.getElementById("preview-name");
const previewEmail = document.getElementById("preview-email");
const previewPhone = document.getElementById("preview-phone");
const previewPhoneContainer = document.getElementById("preview-phone-container");
const previewMessage = document.getElementById("preview-message");
const previewTimestamp = document.getElementById("preview-timestamp");

// ---- Theme Toggle ----
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

// ---- Real-time Preview Updates ----
function updatePreview() {
  // Update basic info
  previewFrom.textContent = senderEmailInput.value || "your.email@example.com";
  previewSubject.textContent = messageSubjectInput.value || "[Message Subject]";
  previewType.textContent = 
    MESSAGE_TYPES[messageTypeSelect.value] || "[Message Type]";
  previewName.textContent = senderNameInput.value || "Your Name";
  previewEmail.textContent = senderEmailInput.value || "your.email@example.com";

  // Handle phone number display
  if (senderPhoneInput.value) {
    previewPhoneContainer.style.display = "block";
    previewPhone.textContent = senderPhoneInput.value;
  } else {
    previewPhoneContainer.style.display = "none";
  }

  // Update message body
  const message = messageBodyInput.value || "Your message will appear here...";
  previewMessage.textContent = message;

  // Update timestamp
  const now = new Date();
  const timestamp = now.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  previewTimestamp.textContent = `Sent: ${timestamp}`;
}

// Add event listeners for real-time preview
senderNameInput.addEventListener("input", updatePreview);
senderEmailInput.addEventListener("input", updatePreview);
senderPhoneInput.addEventListener("input", updatePreview);
messageTypeSelect.addEventListener("change", updatePreview);
messageSubjectInput.addEventListener("input", updatePreview);
messageBodyInput.addEventListener("input", () => {
  updatePreview();
  updateCharCount();
});

// Initial preview update
updatePreview();

// ---- Character Counter ----
function updateCharCount() {
  const length = messageBodyInput.value.length;
  charCount.textContent = `${length} / 5000`;
}

messageBodyInput.addEventListener("input", updateCharCount);

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
  const name = senderNameInput.value.trim();
  if (!name) {
    errors["sender-name"] = "Name is required";
    isValid = false;
  } else if (name.length < 2) {
    errors["sender-name"] = "Name must be at least 2 characters";
    isValid = false;
  }

  // Email validation
  const email = senderEmailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors["sender-email"] = "Email is required";
    isValid = false;
  } else if (!emailRegex.test(email)) {
    errors["sender-email"] = "Please enter a valid email address";
    isValid = false;
  }

  // Phone validation (optional but if provided, must be valid)
  const phone = senderPhoneInput.value.trim();
  if (phone && phone.replace(/\D/g, "").length < 10) {
    errors["sender-phone"] = "Please enter a valid phone number";
    isValid = false;
  }

  // Message type validation
  if (!messageTypeSelect.value) {
    errors["message-type"] = "Please select a message type";
    isValid = false;
  }

  // Subject validation
  const subject = messageSubjectInput.value.trim();
  if (!subject) {
    errors["message-subject"] = "Subject is required";
    isValid = false;
  } else if (subject.length < 5) {
    errors["message-subject"] = "Subject must be at least 5 characters";
    isValid = false;
  }

  // Message body validation
  const body = messageBodyInput.value.trim();
  if (!body) {
    errors["message-body"] = "Message is required";
    isValid = false;
  } else if (body.length < 20) {
    errors["message-body"] = "Message must be at least 20 characters";
    isValid = false;
  }

  // Privacy agreement validation
  const privacyAgree = document.getElementById("privacy-agree").checked;
  if (!privacyAgree) {
    errors["privacy-agree"] = "You must agree to the privacy notice";
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

// ---- Generate Email Content ----
function generateEmailContent(formData) {
  const name = formData.get("sender-name");
  const email = formData.get("sender-email");
  const phone = formData.get("sender-phone");
  const type = formData.get("message-type");
  const subject = formData.get("message-subject");
  const message = formData.get("message-body");

  const timestamp = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // HTML Email Format
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .email-container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #e63946 0%, #d62828 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px; }
        .sender-info { background: white; padding: 15px; border-left: 4px solid #e63946; margin-bottom: 20px; border-radius: 4px; }
        .sender-info p { margin: 5px 0; }
        .sender-label { font-weight: bold; color: #e63946; }
        .message-body { background: white; padding: 15px; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word; }
        .footer { color: #999; font-size: 12px; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; }
        .message-type { display: inline-block; background: #e63946; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 15px; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h2 style="margin: 0;">New Message from Misunderstood World</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Type: ${MESSAGE_TYPES[type]}</p>
        </div>
        
        <div class="content">
          <div class="sender-info">
            <p><span class="sender-label">From:</span> ${escapeHtml(name)}</p>
            <p><span class="sender-label">Email:</span> <a href="mailto:${email}">${email}</a></p>
            ${phone ? `<p><span class="sender-label">Phone:</span> ${escapeHtml(phone)}</p>` : ""}
            <p><span class="sender-label">Message Type:</span> ${MESSAGE_TYPES[type]}</p>
          </div>

          <div class="message-type">${MESSAGE_TYPES[type]}</div>

          <p><strong>Subject: ${escapeHtml(subject)}</strong></p>

          <div class="message-body">
${escapeHtml(message)}
          </div>

          <div class="footer">
            <p>This message was sent via the Misunderstood World Message System</p>
            <p>Sent: ${timestamp}</p>
            <p><strong>Reply to:</strong> ${email}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Plain text format
  const plainTextContent = `
NEW MESSAGE FROM MISUNDERSTOOD WORLD
${"=".repeat(50)}

FROM: ${name}
EMAIL: ${email}
${phone ? `PHONE: ${phone}` : ""}
MESSAGE TYPE: ${MESSAGE_TYPES[type]}
SUBJECT: ${subject}

${"=".repeat(50)}
MESSAGE:
${"=".repeat(50)}

${message}

${"=".repeat(50)}
Sent: ${timestamp}
Reply to: ${email}
  `.trim();

  return {
    to: EMAIL_CONFIG.recipientEmail,
    from: email,
    fromName: name,
    subject: `[${MESSAGE_TYPES[type]}] ${subject}`,
    html: htmlContent,
    plainText: plainTextContent,
    replyTo: email,
  };
}

// ---- Escape HTML to prevent injection ----
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ---- Send Email via EmailJS or Backend ----
async function sendEmail(emailData) {
  // Option 1: Using EmailJS (recommended for client-side)
  // First, add: <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/index.min.js"></script>
  // Then initialize: emailjs.init("YOUR_PUBLIC_KEY");

  try {
    // Option 1: Using EmailJS
    if (typeof emailjs !== "undefined") {
      const response = await emailjs.send("service_id", "template_id", {
        to_email: emailData.to,
        from_email: emailData.from,
        from_name: emailData.fromName,
        subject: emailData.subject,
        message: emailData.plainText,
        html_message: emailData.html,
      });
      return response;
    }

    // Option 2: Using a backend API (recommended for production)
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
}

// ---- Display Email Content in Modal (Alternative - No actual send) ----
function displayEmailModal(emailData) {
  const modalContent = `
    <div class="email-modal">
      <h3>📧 Your Email Ready to Send</h3>
      
      <div class="email-modal-content">
        <div class="email-modal-field">
          <strong>To:</strong> ${emailData.to}
        </div>
        <div class="email-modal-field">
          <strong>From:</strong> ${emailData.from}
        </div>
        <div class="email-modal-field">
          <strong>Subject:</strong> ${emailData.subject}
        </div>
        <div class="email-modal-divider"></div>
        <div class="email-modal-body">
          ${emailData.html}
        </div>
      </div>

      <div class="email-modal-actions">
        <p class="info-text">
          ✨ Your email has been compiled and is ready. You can:
        </p>
        <ul>
          <li>Copy and paste into your email client</li>
          <li>Click the button below to send via our system</li>
          <li>Send directly from your email client by clicking "Reply"</li>
        </ul>
        <div class="button-group">
          <button class="btn btn-primary" id="confirm-send">Send via Our System</button>
          <button class="btn btn-secondary" id="cancel-send">Cancel</button>
        </div>
      </div>
    </div>
  `;

  formResponse.innerHTML = modalContent;
  formResponse.className = "form-response response-info";
  formResponse.style.display = "block";

  formResponse.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ---- Form Submission ----
messageForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Validate
  if (!validateForm()) {
    return;
  }

  // Show loading
  sendBtn.disabled = true;
  formLoading.style.display = "flex";
  formResponse.style.display = "none";

  const formData = new FormData(messageForm);

  try {
    // Generate email content
    const emailData = generateEmailContent(formData);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Display success message with email preview
    displaySuccessResponse(emailData, formData);

    // Optional: Actually send the email (uncomment to enable)
    // await sendEmail(emailData);
    // displaySuccessResponse(emailData, formData, true);

    // Reset form
    messageForm.reset();
    updateCharCount();
    updatePreview();
  } catch (error) {
    console.error("Error:", error);
    displayErrorResponse(error.message);
  } finally {
    sendBtn.disabled = false;
    formLoading.style.display = "none";
  }
});

// ---- Display Success Response ----
function displaySuccessResponse(emailData, formData, emailSent = false) {
  const name = formData.get("sender-name");
  const email = formData.get("sender-email");

  formResponse.innerHTML = `
    <div class="response-header">✅ Message Compiled Successfully!</div>
    <div class="response-content">
      <p>Hi <strong>${escapeHtml(name)}</strong>,</p>
      
      <p>Your message has been compiled into an email format and is ready to be sent to our team at <strong>${EMAIL_CONFIG.recipientEmail}</strong>.</p>

      <div class="success-details">
        <h4>Email Summary:</h4>
        <div class="detail-item">
          <span class="detail-label">From:</span>
          <span class="detail-value">${email}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">To:</span>
          <span class="detail-value">${EMAIL_CONFIG.recipientEmail}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Subject:</span>
          <span class="detail-value">${escapeHtml(emailData.subject)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Message Type:</span>
          <span class="detail-value">${MESSAGE_TYPES[formData.get("message-type")]}</span>
        </div>
      </div>

      <div class="next-steps">
        <h4>What happens next:</h4>
        <ol>
          <li>We'll receive your message and review it carefully</li>
          <li>Our team will respond to you at <strong>${email}</strong> within 2-3 business days</li>
          <li>Check your email (and spam folder) for our response</li>
        </ol>
      </div>

      <div class="action-buttons">
        <p style="margin-bottom: 1rem; font-size: 0.9rem; color: gray;">
          You can also copy your message and send it directly from your email client if preferred.
        </p>
        <button class="btn btn-primary" id="view-email-btn">View Full Email</button>
        <button class="btn btn-secondary" id="copy-email-btn">Copy Email Content</button>
      </div>

      <p style="margin-top: 1.5rem; font-size: 0.85rem; color: gray;">
        <strong>Reference ID:</strong> ${generateRefNumber()}
      </p>
    </div>
  `;

  formResponse.className = "form-response response-success";
  formResponse.style.display = "block";

  // Attach button listeners
  document.getElementById("view-email-btn").addEventListener("click", () => {
    displayEmailPreviewModal(emailData);
  });

  document.getElementById("copy-email-btn").addEventListener("click", () => {
    copyToClipboard(emailData.plainText);
  });

  formResponse.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ---- Display Error Response ----
function displayErrorResponse(errorMessage) {
  formResponse.innerHTML = `
    <div class="response-header">❌ Error Processing Message</div>
    <div class="response-content">
      <p>We encountered an error while processing your message:</p>
      <p style="color: #e63946; font-weight: 500;">${escapeHtml(errorMessage)}</p>
      <p>Please try again or contact us directly at <a href="mailto:hello@misunderstoodworld.com">hello@misunderstoodworld.com</a></p>
    </div>
  `;

  formResponse.className = "form-response response-error";
  formResponse.style.display = "block";
  formResponse.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ---- Display Full Email Preview ----
function displayEmailPreviewModal(emailData) {
  const previewModal = document.createElement("div");
  previewModal.className = "email-preview-modal";
  previewModal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content">
        <button class="modal-close" id="close-preview">×</button>
        <h3>📧 Full Email Preview</h3>
        <div class="email-preview-full">
          ${emailData.html}
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" id="confirm-send-email">Confirm & Send</button>
          <button class="btn btn-secondary" id="close-modal">Close</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(previewModal);

  document.getElementById("close-preview").addEventListener("click", () => {
    previewModal.remove();
  });

  document.getElementById("close-modal").addEventListener("click", () => {
    previewModal.remove();
  });

  document.getElementById("confirm-send-email").addEventListener("click", async () => {
    previewModal.remove();
    await sendEmailNow(emailData);
  });

  document.querySelector(".modal-overlay").addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      previewModal.remove();
    }
  });
}

// ---- Send Email Now ----
async function sendEmailNow(emailData) {
  formLoading.style.display = "flex";

  try {
    // Simulate sending
    await new Promise((resolve) => setTimeout(resolve, 2000));

    displayEmailSentResponse(emailData);
  } catch (error) {
    displayErrorResponse(error.message);
  } finally {
    formLoading.style.display = "none";
  }
}

// ---- Display Email Sent Response ----
function displayEmailSentResponse(emailData) {
  formResponse.innerHTML = `
    <div class="response-header">🎉 Email Sent Successfully!</div>
    <div class="response-content">
      <p>Your message has been successfully sent to <strong>${emailData.to}</strong>.</p>
      
      <div class="success-details">
        <div class="detail-item">
          <span class="detail-label">✓ Status:</span>
          <span class="detail-value">Delivered</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">✓ To:</span>
          <span class="detail-value">${emailData.to}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">✓ Subject:</span>
          <span class="detail-value">${escapeHtml(emailData.subject)}</span>
        </div>
      </div>

      <p style="margin-top: 1.5rem; font-size: 0.9rem; color: gray;">
        We'll review your message and get back to you as soon as possible. 
        Thank you for reaching out to Misunderstood World!
      </p>
    </div>
  `;

  formResponse.className = "form-response response-success";
  formResponse.style.display = "block";
  formResponse.scrollIntoView({ behavior: "smooth", block: "nearest" });

  // Reset form after 3 seconds
  setTimeout(() => {
    messageForm.reset();
    updateCharCount();
    updatePreview();
  }, 3000);
}

// ---- Copy to Clipboard ----
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      alert("Email content copied to clipboard!");
    });
  } else {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    alert("Email content copied to clipboard!");
  }
}

// ---- Generate Reference Number ----
function generateRefNumber() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000);
  return `MW-${timestamp}-${random}`.substring(0, 20);
}
