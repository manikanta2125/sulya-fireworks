// Get cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM Elements
const orderItems = document.getElementById('orderItems');
const checkoutForm = document.getElementById('checkoutForm');
const confirmationModal = document.getElementById('confirmationModal');
const placeOrderBtn = document.getElementById('placeOrderBtn');

// Your Web3Forms API key and your email here:
const WEB3FORM_API_KEY = 'c7673b83-f7b4-4021-be36-f3344908c378';  // Replace with your actual passkey
const YOUR_EMAIL = 'sushan8462@gmail.com';   // Replace with your email

// Initialize checkout page
document.addEventListener('DOMContentLoaded', function() {
    if (cart.length === 0) {
        redirectToEmptyCart();
        return;
    }
    
    renderOrderSummary();
    setupFormValidation();
    setupFormFormatting();
});

// Redirect if cart is empty
function redirectToEmptyCart() {
    document.querySelector('.checkout-content').innerHTML = `
        <div class="empty-cart-redirect">
            <i class="fas fa-shopping-cart"></i>
            <h2>Your cart is empty</h2>
            <p>Add some delicious items before proceeding to checkout</p>
            <a href="index.html" class="shop-now-btn">
                <i class="fas fa-utensils"></i>
                Shop Now
            </a>
        </div>
    `;
}

// Render order summary
function renderOrderSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = 200;
    const total = subtotal + delivery;
    
    // Render order items
    orderItems.innerHTML = cart.map(item => `
        <div class="order-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="order-item-info">
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-details">Qty: ${item.quantity} × ₹${item.price.toFixed(2)}</div>
            </div>
            <div class="order-item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');
    
    // Update totals
    document.getElementById('checkoutSubtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('checkoutDelivery').textContent = `₹${delivery.toFixed(2)}`;
    document.getElementById('checkoutTotal').textContent = `₹${total.toFixed(2)}`;
}

// Setup form validation
function setupFormValidation() {
    const form = document.getElementById('checkoutForm');
    const inputs = form.querySelectorAll('input, select');
    
    // Add real-time validation
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
    
    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            processOrder();
        }
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing error
    clearFieldError(field);
    
    // Check if required field is empty
    if (field.required && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Specific validations
    switch (field.name) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;
            
        case 'phone':
            const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
            if (value && !phoneRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
            break;
            
        case 'pin':
            const pinRegex = /^\d{6}$/;
            if (value && !pinRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid 6-digit PIN code';
            }
            break;
            
        case 'cardNumber':
            if (value && value.replace(/\s/g, '').length !== 16) {
                isValid = false;
                errorMessage = 'Please enter a valid 16-digit card number';
            }
            break;
            
        case 'expiry':
            const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
            if (value && !expiryRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter expiry in MM/YY format';
            }
            break;
            
        case 'cvv':
            const cvvRegex = /^\d{3,4}$/;
            if (value && !cvvRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid CVV';
            }
            break;
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        field.classList.add('success');
    }
    
    return isValid;
}

// Show field error
function showFieldError(field, message) {
    field.classList.add('error');
    field.classList.remove('success');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(field) {
    field.classList.remove('error');
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Validate entire form
function validateForm() {
    const form = document.getElementById('checkoutForm');
    const inputs = form.querySelectorAll('input, select');
    let isFormValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });
    
    return isFormValid;
}

// Setup form formatting
function setupFormFormatting() {
    // Format card number
    const cardNumberInput = document.getElementById('cardNumber');
    if(cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue.substring(0, 19);
        });
    }
    
    // Format expiry date
    const expiryInput = document.getElementById('expiry');
    if(expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // Format CVV
    const cvvInput = document.getElementById('cvv');
    if(cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 4);
        });
    }
    
    // Format phone number
    const phoneInput = document.getElementById('phone');
    if(phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            let formattedValue = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
            e.target.value = formattedValue;
        });
    }
}

// Process order
async function processOrder() {
    // Show loading state
    placeOrderBtn.classList.add('loading');
    placeOrderBtn.textContent = 'Processing...';
    placeOrderBtn.disabled = true;

    // Prepare data to send
    const formData = new FormData(checkoutForm);

    // Add cart info + totals to form data
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = 200;
    const total = subtotal + delivery;

    const cartSummary = cart.map(item => 
      `${item.name} (x${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const fullSummary = `
${cartSummary}

Subtotal: ₹${subtotal.toFixed(2)}
Delivery: ₹${delivery.toFixed(2)}
Total: ₹${total.toFixed(2)}
`;

    formData.append('Cart Summary', fullSummary);

    // Add hidden fields required by Web3Forms
    formData.append('access_key', WEB3FORM_API_KEY);
    formData.append('subject', 'New Order from Sulya Fireworks');
    formData.append('reply_to', formData.get('email'));
    formData.append('redirect', '');  // No redirect; we'll handle UI after success

    // 🔥 Generate unique order number ONCE
    const orderNumber = `MA${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    formData.append('Order Number', orderNumber);

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (result.success) {
            // ✅ Use the same order number in modal
            showOrderConfirmation(orderNumber);

            // Clear cart
            localStorage.removeItem('cart');
            cart = [];

            // Reset button
            placeOrderBtn.classList.remove('loading');
            placeOrderBtn.textContent = 'Place Order';
            placeOrderBtn.disabled = false;
        } else {
            alert('Failed to place order. Please try again.');
            placeOrderBtn.classList.remove('loading');
            placeOrderBtn.textContent = 'Place Order';
            placeOrderBtn.disabled = false;
        }
    } catch (error) {
        alert('Error submitting form. Please check your internet connection and try again.');
        placeOrderBtn.classList.remove('loading');
        placeOrderBtn.textContent = 'Place Order';
        placeOrderBtn.disabled = false;
    }
}

// Show order confirmation
function showOrderConfirmation(orderNumber) {
    document.getElementById('orderNumber').textContent = `#${orderNumber}`;
    confirmationModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Progress step animation
    setTimeout(() => {
        updateProgressStep(2);
        setTimeout(() => {
            updateProgressStep(3);
        }, 500);
    }, 1000);
}

// Update progress step
function updateProgressStep(step) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((stepEl, index) => {
        if (index + 1 <= step) {
            stepEl.classList.add('active');
        } else {
            stepEl.classList.remove('active');
        }
    });
}

// Continue shopping from modal
function continueShoppingFromModal() {
    window.location.href = 'index.html';
}

// Add demo button in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    const demoBtn = document.createElement('button');
    demoBtn.textContent = 'Fill Demo Data';
    demoBtn.style.cssText = `
        position: fixed;
        top: 100px;
        left: 20px;
        background: #6366f1;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-size: 0.8rem;
        cursor: pointer;
        z-index: 1000;
    `;
    demoBtn.onclick = fillDemoData;
    document.body.appendChild(demoBtn);
}

// Handle browser back button
window.addEventListener('popstate', function(e) {
    if (confirmationModal.classList.contains('active')) {
        e.preventDefault();
        window.location.href = 'index.html';
    }
});

// Close modal on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && confirmationModal.classList.contains('active')) {
        continueShoppingFromModal();
    }
});

// Prevent form submission on Enter (except on submit button)
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName !== 'BUTTON' && e.target.type !== 'submit') {
        e.preventDefault();
    }
});
