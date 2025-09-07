// Get cart
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM
const orderItems = document.getElementById('orderItems');
const checkoutForm = document.getElementById('checkoutForm');
const confirmationModal = document.getElementById('confirmationModal');
const placeOrderBtn = document.getElementById('placeOrderBtn');

document.addEventListener("DOMContentLoaded", () => {
    if (cart.length === 0) {
        orderItems.innerHTML = "<p>Your cart is empty</p>";
        placeOrderBtn.disabled = true;
        return;
    }
    renderOrderSummary();
});

function renderOrderSummary() {
    const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const delivery = 200;
    const total = subtotal + delivery;

    orderItems.innerHTML = cart.map(i => `
        <div>${i.name} (x${i.quantity}) - ₹${(i.price * i.quantity).toFixed(2)}</div>
    `).join("");

    document.getElementById("checkoutSubtotal").textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById("checkoutDelivery").textContent = `₹${delivery.toFixed(2)}`;
    document.getElementById("checkoutTotal").textContent = `₹${total.toFixed(2)}`;
}

// Generate PDF and auto-download
function generatePDFInvoice(orderData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("MA CRACKERS", 105, 30, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Fireworks Wholesale & Retail Sales", 105, 40, { align: "center" });
    doc.text("Website: https://sulya-fireworks.vercel.app/ E-Mail: macrackers@gmail.com", 105, 50, { align: "center" });
    
    // Mobile numbers (top right)
    doc.text("Mob No: 77609 48462", 150, 20);
    doc.text("94497 98462", 150, 30);

    // Invoice details
    doc.text(`Date: ${orderData.date}`, 150, 70);
    doc.text(`Invoice No: ${orderData.orderNumber}`, 20, 80);

    // Customer details
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 20, 100);
    doc.setFont("helvetica", "normal");
    doc.text(`${orderData.customerName}`, 20, 110);
    doc.text(`${orderData.address}`, 20, 120);
    doc.text(`Phone: ${orderData.phone}`, 20, 130);
    doc.text(`Email: ${orderData.email}`, 20, 140);

    // Table header
    doc.setFont("helvetica", "bold");
    doc.rect(20, 160, 170, 10);
    doc.text("S.No", 25, 167);
    doc.text("PRODUCT", 60, 167);
    doc.text("QTY", 110, 167);
    doc.text("PRICE", 130, 167);
    doc.text("AMOUNT", 160, 167);

    // Table rows
    doc.setFont("helvetica", "normal");
    let yPos = 180;
    orderData.items.forEach((item, index) => {
        doc.rect(20, yPos - 10, 170, 10);
        doc.text((index + 1).toString(), 25, yPos - 3);
        doc.text(item.name.substring(0, 25), 25, yPos - 3);
        doc.text(item.quantity.toString(), 115, yPos - 3);
        doc.text(`Rs.${item.price.toFixed(2)}`, 135, yPos - 3);
        doc.text(`Rs.${(item.price * item.quantity).toFixed(2)}`, 165, yPos - 3);
        yPos += 10;
    });

    // Totals
    yPos += 10;
    doc.text(`Subtotal: Rs.${orderData.subtotal.toFixed(2)}`, 130, yPos);
    doc.text(`Delivery: Rs.${orderData.delivery.toFixed(2)}`, 130, yPos + 10);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: Rs.${orderData.total.toFixed(2)}`, 130, yPos + 20);

    // Footer
    doc.setFont("helvetica", "normal");
    doc.text("Payment Method: UPI/QR", 20, yPos + 40);
    doc.text("Order Status: Confirmed", 20, yPos + 50);
    
    doc.setFont("helvetica", "bold");
    doc.text("THANK YOU FOR MA CRACKERS!", 105, yPos + 70, { align: "center" });

    // Download PDF
    doc.save(`MA-CRACKERS-Invoice-${orderData.orderNumber}.pdf`);
}

checkoutForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = "Processing...";

    // Get form data
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
    const city = document.getElementById("city").value;
    const district = document.getElementById("District").value;
    const pin = document.getElementById("pin").value;

    const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const delivery = 200;
    const total = subtotal + delivery;
    const orderNumber = `MA${Date.now().toString().slice(-5)}`;
    const invoiceDate = new Date().toLocaleDateString('en-IN');

    // Prepare data for PDF
    const orderData = {
        orderNumber: orderNumber,
        date: invoiceDate,
        customerName: firstName + " " + lastName,
        phone: phone,
        email: email,
        address: `${address}, ${city}, ${district} - ${pin}`,
        items: cart,
        subtotal: subtotal,
        delivery: delivery,
        total: total
    };

    // Generate and download PDF
    generatePDFInvoice(orderData);

    // Create detailed table-style invoice for emails
    const invoiceTable = cart.map((item, index) => 
        `${(index + 1).toString().padEnd(4)} ${item.name.padEnd(35)} ${item.quantity.toString().padEnd(5)} Rs.${item.price.toFixed(2).padEnd(10)} Rs.${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const fullAddress = `${address}, ${city}, ${district} - ${pin}`;

    try {
        // 1. Send order notification to YOU via Web3Forms
        const businessFormData = new FormData();
        businessFormData.append("access_key", "c7673b83-f7b4-4021-be36-f3344908c378");
        businessFormData.append("subject", `New Order ${orderNumber} - MA CRACKERS`);
        businessFormData.append("message", `NEW ORDER RECEIVED

ORDER INVOICE - MA CRACKERS
========================================

Order Number: ${orderNumber}
Date: ${invoiceDate}

CUSTOMER DETAILS:
Name: ${firstName} ${lastName}
Phone: ${phone}
Email: ${email}
Address: ${fullAddress}

ITEMS ORDERED:
========================================
S.No Product Name                    Qty   Price      Amount
========================================
${invoiceTable}
----------------------------------------
                        Subtotal: Rs.${subtotal.toFixed(2)}
                        Delivery: Rs.${delivery.toFixed(2)}
                        =============================
                        TOTAL:    Rs.${total.toFixed(2)}
========================================

Payment: Cash on Delivery
Status: Order Confirmed

Contact Customer: ${phone}`);

        await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: businessFormData
        });

        // 2. Send COMPLETE INVOICE to CUSTOMER via EmailJS
        await emailjs.send("service_rblyk6p", "template_g0varae", {
            to_email: email,
            to_name: firstName + " " + lastName,
            order_number: orderNumber,
            from_name: "MA CRACKERS Team",
            message: `Dear ${firstName} ${lastName},

Thank you for your order with MA CRACKERS!

ORDER INVOICE & CONFIRMATION
================================================

                    MA CRACKERS
            Fireworks Wholesale & Retail Sales
        Website: https://sulya-fireworks.vercel.app/
        E-Mail: macrackers@gmail.com
        Mob: 77609 48462, 94497 98462

================================================

Invoice No: ${orderNumber}
Date: ${invoiceDate}

BILL TO:
${firstName} ${lastName}
${fullAddress}
Phone: ${phone}
Email: ${email}

================================================
ITEMS ORDERED:
================================================
S.No Product Name                    Qty   Price      Amount
================================================
${invoiceTable}
------------------------------------------------
                        Subtotal: Rs.${subtotal.toFixed(2)}
                        Delivery: Rs.${delivery.toFixed(2)}
                        ================================
                        TOTAL:    Rs.${total.toFixed(2)}
================================================

PAYMENT METHOD: Cash on Delivery
ORDER STATUS: Confirmed

DELIVERY INFORMATION:
- We will contact you within 24 hours for delivery confirmation
- Expected delivery: 1-2 business days
- Keep this email as your order receipt

PDF Invoice has been downloaded to your device automatically.

For any queries, please contact us or reply to this email.

THANK YOU FOR CHOOSING MA CRACKERS!

Best Regards,
MA CRACKERS Team
Contact: macrackers@gmail.com`
        });

        showOrderConfirmation(orderNumber);
        localStorage.removeItem("cart");
        cart = [];
        
    } catch (error) {
        console.error('Error:', error);
        alert("Order placed and PDF downloaded successfully! We'll contact you directly if there are any email issues.");
        showOrderConfirmation(orderNumber);
        localStorage.removeItem("cart");
        cart = [];
    }

    placeOrderBtn.disabled = false;
    placeOrderBtn.textContent = "Place Order";
});

function showOrderConfirmation(orderNumber) {
    document.getElementById("orderNumber").textContent = "#" + orderNumber;
    confirmationModal.classList.add("active");
}

function continueShoppingFromModal() {
    window.location.href = "index.html";
}