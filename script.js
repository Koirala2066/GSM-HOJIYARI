// ========================================
// GSM HOJIYARI UDHYOG - SCRIPT.JS
// Interactive Features & Modal Management
// ========================================

// ========================================
// OWNER MODAL FUNCTIONS
// ========================================

/**
 * Open the owner information modal
 */
function openOwnerModal() {
    const modal = document.getElementById('ownerModal');
    modal.style.display = 'block';
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Add animation effect
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.animation = 'slideInDown 0.3s ease';
}

/**
 * Close the owner information modal
 */
function closeOwnerModal() {
    const modal = document.getElementById('ownerModal');
    modal.style.display = 'none';
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
}

/**
 * Close modal when clicking outside of it
 */
window.addEventListener('click', function(event) {
    const modal = document.getElementById('ownerModal');
    if (event.target == modal) {
        closeOwnerModal();
    }
});

/**
 * Close modal with Escape key
 */
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeOwnerModal();
    }
});

/**
 * Open the location map modal
 */
function openLocationModal() {
    const modal = document.getElementById('locationModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

/**
 * Close the location map modal
 */
function closeLocationModal() {
    const modal = document.getElementById('locationModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

/**
 * Close location modal when clicking outside
 */
window.addEventListener('click', function(event) {
    const modal = document.getElementById('locationModal');
    if (event.target === modal) {
        closeLocationModal();
    }
});

/**
 * Close location modal with Escape key
 */
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeLocationModal();
    }
});

// ========================================
// SCROLL TO PRODUCTS FUNCTION
// ========================================

/**
 * Smooth scroll to products section
 */
function scrollToProducts() {
    const productsSection = document.getElementById('products');
    productsSection.scrollIntoView({ behavior: 'smooth' });
}

// ========================================
// PRODUCT CARD INTERACTIONS
// ========================================

/**
 * Add hover animations to product cards
 */
document.addEventListener('DOMContentLoaded', function() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach((card, index) => {
        // Add a slight delay to animation for each card
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Add click interaction to show full details
        card.addEventListener('click', function() {
            this.classList.toggle('expanded');
        });
    });
    
    // Add smooth scrolling for all anchor links
    addSmoothScrolling();
    
    // Add scroll animations for elements
    observeElementsOnScroll();
});

// ========================================
// SMOOTH SCROLLING FOR NAVIGATION LINKS
// ========================================

/**
 * Add smooth scrolling for all anchor links
 */
function addSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only prevent default if link points to an element
            if (href !== '#') {
                e.preventDefault();
                
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update active link in navbar
                    updateActiveNavLink(href);
                }
            }
        });
    });
}

/**
 * Update active navigation link based on scroll position
 */
function updateActiveNavLink(activeHref) {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === activeHref) {
            link.style.color = 'var(--accent-color)';
        } else {
            link.style.color = 'var(--white)';
        }
    });
}

// ========================================
// SCROLL ANIMATIONS
// ========================================

/**
 * Observe elements and trigger animations on scroll
 */
function observeElementsOnScroll() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe product cards and info cards
    const animateElements = document.querySelectorAll(
        '.product-card, .info-card, .contact-card, .contact-form'
    );
    
    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// ========================================
// FORM SUBMISSION
// ========================================

/**
 * Handle contact form submission
 */
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form values - using querySelector for inputs/textarea
            const inputs = this.querySelectorAll('input, textarea');
            const name = inputs[0].value;
            const email = inputs[1].value;
            const message = inputs[2].value;

            // Validate form
            if (!(name.trim() && email.trim() && message.trim())) {
                showNotification(
                    '⚠️ Hold up!',
                    'Please fill in all fields to send the magic message!',
                    'error'
                );
                return;
            }

            // Disable submit button during submission
            const submitBtn = this.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '✨ Sending... ✨';
            submitBtn.style.opacity = '0.7';

            // Try sending to local API endpoint
            try {
                const resp = await fetch('/api/message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message })
                });

                const data = await resp.json();
                if (resp.ok && data && data.success) {
                    // Show success message
                    const successMsg = document.querySelector('.form-success-message');
                    const form = document.querySelector('.contact-form form');
                    
                    form.style.display = 'none';
                    successMsg.style.display = 'block';
                    
                    showNotification(
                        '🎉 Message Received!',
                        `Thanks ${name}! We'll get back to you soon at ${email}`,
                        'success'
                    );
                    
                    // Reset after 3 seconds
                    setTimeout(() => {
                        this.reset();
                        form.style.display = 'flex';
                        successMsg.style.display = 'none';
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                        submitBtn.style.opacity = '1';
                    }, 3000);
                } else {
                    throw new Error((data && data.error) || 'Server error');
                }
            } catch (err) {
                console.error('Failed to send message:', err);
                showNotification(
                    '💬 Can\'t Send Right Now',
                    'Try WhatsApp or call us directly for instant chat!',
                    'error'
                );
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                submitBtn.style.opacity = '1';
            }
        });
    }
});

// ========================================
// NOTIFICATION SYSTEM
// ========================================

/**
 * Show a notification to the user
 */
function showNotification(title, message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add styles dynamically if not already added
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                max-width: 400px;
                padding: 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 3000;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                animation: slideInRight 0.4s ease;
            }
            
            .notification-success {
                background: linear-gradient(135deg, #27ae60, #229954);
                color: white;
            }
            
            .notification-error {
                background: linear-gradient(135deg, #e74c3c, #c0392b);
                color: white;
            }
            
            .notification-info {
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white;
            }
            
            .notification h4 {
                margin: 0 0 0.5rem 0;
                font-size: 1rem;
            }
            
            .notification p {
                margin: 0;
                font-size: 0.95rem;
                opacity: 0.95;
            }
            
            .notification-close {
                background: transparent;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                margin-left: 1rem;
                opacity: 0.8;
                transition: opacity 0.2s;
            }
            
            .notification-close:hover {
                opacity: 1;
            }
            
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @media (max-width: 600px) {
                .notification {
                    left: 20px;
                    right: 20px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease';
        setTimeout(() => notification.remove(), 400);
    }, 5000);
}

// ========================================
// NAVBAR SCROLL EFFECT
// ========================================

/**
 * Add scroll effect to navbar
 */
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// ========================================
// WHATSAPP LINK FUNCTIONALITY
// ========================================

/**
 * Open WhatsApp chat
 */
function openWhatsApp() {
    const phoneNumber = '9779857013919';
    const message = 'Hello! I am interested in GSM HOJIYARI UDHYOG products.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// ========================================
// PAGE LOAD INITIALIZATION
// ========================================

/**
 * Initialize page on load
 */
window.addEventListener('load', function() {
    // Fade in page content
    document.body.style.opacity = '1';
    
    // Log initialization
    console.log('%cGSM HOJIYARI UDHYOG', 'font-size: 20px; color: #2c3e50; font-weight: bold;');
    console.log('%cWelcome to our website!', 'font-size: 14px; color: #e74c3c;');
});

// ========================================
// PERFORMANCE OPTIMIZATION
// ========================================

/**
 * Lazy load images
 */
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.src = entry.target.dataset.src;
                entry.target.removeAttribute('data-src');
                observer.unobserve(entry.target);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ========================================
// UTILITIES
// ========================================

/**
 * Get URL parameter by name
 */
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

/**
 * Debounce function for performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
/**
 * Counter Animation for Formula Section
 * Animates numbers from 0 to target value
 */
function animateCounter(element, target, duration = 2000) {
    if (element.dataset.animated === 'true') return; // Prevent multiple animations
    
    element.dataset.animated = 'true';
    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

/**
 * Initialize Formula Section Animations
 * Triggers counter animation when section comes into view
 */
function initFormulaAnimations() {
    const formulaSection = document.getElementById('formula');
    if (!formulaSection) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate counter when section becomes visible
                const counters = entry.target.querySelectorAll('.counter');
                counters.forEach(counter => {
                    const target = parseInt(counter.dataset.target);
                    animateCounter(counter, target, 1500);
                });
                
                // Unobserve after animation is triggered
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    observer.observe(formulaSection);
}

// Initialize formula animations when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initFormulaAnimations();
    
    // Initialize all new interactive features
    initScrollRevealAnimations();
    initParallaxEffect();
    initButtonRippleEffect();
    initFormFieldAnimations();
    initProductCardHover();
    initInfoCardFloatingAnimation();
    initWhatsAppButton();
});

// ========================================
// SCROLL REVEAL ANIMATIONS
// ========================================
/**
 * Reveals elements with fadeIn animation when they come into view
 */
function initScrollRevealAnimations() {
    const revealElements = document.querySelectorAll('.product-card, .formula-card, .info-card, .company-description');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                entry.target.style.animation = `slideUp 0.6s ease-out ${index * 0.1}s both`;
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    revealElements.forEach(element => observer.observe(element));
}

// ========================================
// PARALLAX SCROLL EFFECT
// ========================================
/**
 * Creates parallax effect on hero section background
 */
function initParallaxEffect() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        hero.style.backgroundPosition = `0 ${scrollPosition * 0.5}px`;
    }, { passive: true });
}

// ========================================
// BUTTON RIPPLE EFFECT
// ========================================
/**
 * Adds ripple effect to buttons on click
 */
function initButtonRippleEffect() {
    const buttons = document.querySelectorAll('.cta-button, button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 50%;
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
                animation: ripple-animation 0.6s ease-out;
            `;
            
            this.style.position = 'relative';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// ========================================
// FORM FIELD ANIMATIONS
// ========================================
/**
 * Animates form fields with focus effects and input validation
 */
function initFormFieldAnimations() {
    const formInputs = document.querySelectorAll('input[type="text"], input[type="email"], textarea');
    
    formInputs.forEach(input => {
        // Add focus animation
        input.addEventListener('focus', function() {
            this.style.transform = 'scale(1.02)';
            this.style.boxShadow = '0 5px 20px rgba(52, 152, 219, 0.3)';
        });
        
        // Remove focus animation
        input.addEventListener('blur', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        });
        
        // Character counter animation for textarea
        if (input.tagName === 'TEXTAREA') {
            input.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 300) + 'px';
            });
        }
    });
}

// ========================================
// PRODUCT CARD HOVER EFFECTS
// ========================================
/**
 * Enhanced hover effects for product cards
 */
function initProductCardHover() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.03)';
            this.style.boxShadow = '0 15px 40px rgba(52, 152, 219, 0.3)';
            
            const icon = this.querySelector('.product-icon');
            if (icon) {
                icon.style.transform = 'rotate(10deg) scale(1.2)';
                icon.style.animation = 'spin 2s linear infinite';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            
            const icon = this.querySelector('.product-icon');
            if (icon) {
                icon.style.transform = 'rotate(0) scale(1)';
                icon.style.animation = 'none';
            }
        });
    });
}

// ========================================
// INFO CARD FLOATING ANIMATION
// ========================================
/**
 * Adds subtle floating animation to info cards
 */
function initInfoCardFloatingAnimation() {
    const infoCards = document.querySelectorAll('.info-card');
    
    infoCards.forEach((card, index) => {
        card.style.animation = `float 3s ease-in-out ${index * 0.2}s infinite`;
    });
}

// ========================================
// ENHANCED KEYFRAME ANIMATIONS
// ========================================
/**
 * Add styles for new animations if they don't exist
 */
function injectAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @keyframes spin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
        
        @keyframes float {
            0%, 100% {
                transform: translateY(0px);
            }
            50% {
                transform: translateY(-10px);
            }
        }
        
        @keyframes glow {
            0%, 100% {
                box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
            }
            50% {
                box-shadow: 0 0 20px rgba(52, 152, 219, 0.8);
            }
        }
        
        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        /* Smooth input transitions */
        input[type="text"],
        input[type="email"],
        textarea {
            transition: all 0.3s ease !important;
        }
        
        .product-icon {
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

// Inject animation styles on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectAnimationStyles);
} else {
    injectAnimationStyles();
}

// ========================================
// WHATSAPP BUTTON ENHANCEMENTS
// ========================================
/**
 * Initialize WhatsApp button with interactive features
 */
function initWhatsAppButton() {
    const floatingBtn = document.querySelector('.floating-whatsapp');
    if (!floatingBtn) return;
    
    // Hide button initially and show on scroll
    floatingBtn.style.opacity = '0';
    floatingBtn.style.pointerEvents = 'none';
    
    // Show button after 1.5 seconds
    setTimeout(() => {
        floatingBtn.style.transition = 'opacity 0.5s ease';
        floatingBtn.style.opacity = '1';
        floatingBtn.style.pointerEvents = 'auto';
    }, 1500);
    
    // Add click animation
    floatingBtn.addEventListener('click', function() {
        this.style.animation = 'none';
        setTimeout(() => {
            this.style.animation = 'bounce 2s infinite';
        }, 100);
    });
    
    // Add pulse effect on hover
    floatingBtn.addEventListener('mouseenter', function() {
        this.style.animation = 'none';
    });
    
    floatingBtn.addEventListener('mouseleave', function() {
        this.style.animation = 'bounce 2s infinite';
    });
}

// ========================================
// AI CHATBOT FUNCTIONALITY
// ========================================

function toggleChatbot() {
    const chatbot = document.getElementById('chatbot-widget');
    const toggle = document.getElementById('chatbot-toggle');
    chatbot.classList.toggle('active');
    
    if (chatbot.classList.contains('active')) {
        document.getElementById('chatbot-input').focus();
    }
}

function closeChatbot() {
    document.getElementById('chatbot-widget').classList.remove('active');
}

function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    const messagesContainer = document.getElementById('chatbot-messages');
    
    // Add user message
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'chat-message user-message';
    userMessageDiv.innerHTML = `<p>${escapeHtml(message)}</p>`;
    messagesContainer.appendChild(userMessageDiv);
    
    input.value = '';
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    try {
        // Send to backend
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.response) {
            throw new Error('No response from server');
        }
        
        // Add bot response
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'chat-message bot-message';
        botMessageDiv.innerHTML = `<p>${escapeHtml(data.response)}</p>`;
        messagesContainer.appendChild(botMessageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        console.error('Chat error:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'chat-message bot-message';
        errorDiv.innerHTML = '<p>Sorry, I couldn\'t process that. Please try again. (Error: ' + error.message + ')</p>';
        messagesContainer.appendChild(errorDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
