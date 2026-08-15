document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

window.addEventListener('load', () => {
  document.body.classList.add('page-loaded');
});

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
  observer.observe(section);
});

const mobileMenuToggle = document.getElementById("mobileMenuToggle");
const navLinks = document.getElementById("navLinks");

if (mobileMenuToggle) {
  mobileMenuToggle.addEventListener("click", () => {
    mobileMenuToggle.classList.toggle("active");
    navLinks.classList.toggle("active");
  });

  document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
      mobileMenuToggle.classList.remove("active");
      navLinks.classList.remove("active");
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".floating-nav")) {
      mobileMenuToggle.classList.remove("active");
      navLinks.classList.remove("active");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      mobileMenuToggle.classList.remove("active");
      navLinks.classList.remove("active");
    }
  });
}

const PRODUCT_PRICES = {
  "3D Wave Ring Set": 25000,
  "Organic Sculpted Earrings": 40000,
  "Futuristic Hair Pin": 8000,
  "Customized 3D Wearable": 75000,
  "3D FLORAL BAG": 25000,
  "3D METALLIC CORSET": 40000,
  "METALLIC CORSET": 40000,
  "Minimalist Hair Pin": 8000,
  "FLORAL BROOCH": 50000
};

function normalizeProductName(name) {
  const legacyMap = {
    "3D Wave Ring Set": "3D FLORAL BAG",
    "Organic Sculpted Earrings": "3D METALLIC CORSET",
    "METALLIC CORSET": "3D METALLIC CORSET",
    "FLORAL BAG": "3D FLORAL BAG"
  };

  return legacyMap[name] || name;
}

function formatCurrency(value) {
  return `₦${Number(value).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

let cart = JSON.parse(localStorage.getItem("alterEgoCart")) || [];
cart = cart.map(item => ({
  ...item,
  name: normalizeProductName(item.name),
  price: Number(item.price) || PRODUCT_PRICES[normalizeProductName(item.name)] || 0
}));

const cartBtn = document.getElementById("cartBtn");
const closeCart = document.getElementById("closeCart");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartCount = document.getElementById("cartCount");
const cartItemsList = document.getElementById("cartItemsList");
const cartSubtotal = document.getElementById("cartSubtotal");
const checkoutBtn = document.querySelector(".checkout-btn");

updateCartUI();

cartBtn.addEventListener("click", () => {
  cartDrawer.classList.add("active");
  cartOverlay.classList.add("active");
  document.body.style.overflow = 'hidden';
});

closeCart.addEventListener("click", closeCartDrawer);
cartOverlay.addEventListener("click", closeCartDrawer);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && cartDrawer.classList.contains("active")) {
    closeCartDrawer();
  }
});

function closeCartDrawer() {
  cartDrawer.classList.remove("active");
  cartOverlay.classList.remove("active");
  document.body.style.overflow = 'auto';
}

function addToCart(itemName) {
  const normalizedName = normalizeProductName(itemName);
  cart.push({
    name: normalizedName,
    price: PRODUCT_PRICES[normalizedName] || PRODUCT_PRICES[itemName] || 45000,
    id: Date.now()
  });
  saveCart();
  updateCartUI();
  cartDrawer.classList.add("active");
  cartOverlay.classList.add("active");
  document.body.style.overflow = 'hidden';
  showNotification(`${itemName} added to cart!`);
}

function removeFromCart(itemId) {
  cart = cart.filter(item => item.id !== itemId);
  saveCart();
  updateCartUI();
  showNotification("Item removed from cart");
}

function saveCart() {
  localStorage.setItem("alterEgoCart", JSON.stringify(cart));
}

function updateCartUI() {
  cartCount.textContent = cart.length;
  
  if (cart.length === 0) {
    cartItemsList.innerHTML = `<p class="empty-msg" style="text-align:center; padding:2rem; color:rgba(45,58,52,0.5);">Your cart is currently empty.</p>`;
    cartSubtotal.textContent = formatCurrency(0);
  } else {
    const itemsHTML = cart.map(item => `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid rgba(45,58,52,0.1);">
        <div style="flex:1;">
          <span style="display:block; font-weight:500;">${item.name}</span>
          <span style="display:block; font-size:0.85rem; color:rgba(45,58,52,0.6);">${formatCurrency(item.price)}</span>
        </div>
        <button onclick="removeFromCart(${item.id})" style="background:none; border:none; color:#D07A4A; cursor:pointer; font-size:1.2rem; padding:4px 8px; transition:all 0.2s;" title="Remove item" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">✕</button>
      </div>
    `).join("");
    cartItemsList.innerHTML = itemsHTML;
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    cartSubtotal.textContent = formatCurrency(total);
  }
}

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty. Add items before checkout.");
    return;
  }
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const itemsList = cart.map(item => `${item.name} - ${formatCurrency(item.price)}`).join("\n");
  alert(`ORDER SUMMARY\n\n${itemsList}\n\n────────────\nTotal: ${formatCurrency(total)}\n\nThis is a demo. In production, you'd be redirected to a payment gateway.`);
  cart = [];
  saveCart();
  updateCartUI();
  closeCartDrawer();
  showNotification("Thank you for your order!");
});

function showNotification(message) {
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: #2D3A34;
    color: #F2E8D9;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 2000;
    animation: slideIn 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-size: 0.9rem;
    font-weight: 500;
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .empty-msg {
    text-align: center;
    padding: 2rem;
    color: rgba(45, 58, 52, 0.5);
  }
  section {
    opacity: 0;
    transition: opacity 0.6s ease;
  }
  section.fade-in {
    opacity: 1;
    animation: fadeInUp 0.6s ease;
  }
  .page-fade-in {
    animation: fadeInUp 0.8s ease;
  }
  .page-loaded body {
    opacity: 1;
  }
  a {
    position: relative;
  }
  .btn-primary, .btn-outline {
    position: relative;
    overflow: hidden;
  }
  .btn-primary::before, .btn-outline::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  .btn-primary:active::before, .btn-outline:active::before {
    width: 300px;
    height: 300px;
  }
  .card-details:hover {
    color: #D07A4A;
    transition: color 0.3s ease;
  }
`;
document.head.appendChild(style);


document.querySelectorAll('img').forEach(img => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = img.src;
  document.head.appendChild(link);
});

if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        imageObserver.unobserve(img);
      }
    });
  });
  document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
}

console.log('ALTER EGO Site Loaded Successfully ✓');