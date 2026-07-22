/* ==========================================================================
   Frutería Mis Dos Angelitos - Main Application Logic & Interactivity
   Handles Catalog, Search, Order Calculator, WhatsApp API & Chatbot
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- STATE MANAGEMENT ---
  let currentCategory = 'all';
  let searchQuery = '';
  let cart = []; // [{ product, type: 'retail'|'wholesale', qty: 1 }]

  // --- DOM ELEMENTS ---
  const productsGrid = document.getElementById('products-grid');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const searchInput = document.getElementById('search-input');
  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const cartCountBadge = document.getElementById('cart-count-badge');
  const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const drawerBody = document.getElementById('drawer-body');
  const cartTotalAmount = document.getElementById('cart-total-amount');
  const sendWhatsappOrderBtn = document.getElementById('send-whatsapp-order-btn');

  // Chatbot Elements
  const chatbotFloatBtn = document.getElementById('chatbot-float-btn');
  const chatbotWindow = document.getElementById('chatbot-window');
  const closeChatbotBtn = document.getElementById('close-chatbot-btn');
  const chatBody = document.getElementById('chat-body');
  const chatInput = document.getElementById('chat-input');
  const sendChatBtn = document.getElementById('send-chat-btn');
  const quickChips = document.querySelectorAll('.quick-chip');

  // Mobile Menu Elements
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');

  // --- INITIALIZATION ---
  initCatalog();
  setupEventListeners();
  setupFAQ();
  setupMobileMenu();

  // --- CATALOG & RENDER LOGIC ---
  function initCatalog() {
    renderProducts();
  }

  function filterProducts() {
    return PRODUCTS.filter(product => {
      // Category Match
      let matchesCategory = true;
      if (currentCategory === 'frutas') {
        matchesCategory = product.category === 'frutas';
      } else if (currentCategory === 'verduras') {
        matchesCategory = product.category === 'verduras';
      } else if (currentCategory === 'temporada') {
        matchesCategory = product.isSeason === true;
      } else if (currentCategory === 'mayoreo') {
        matchesCategory = product.wholesalePrice <= 500;
      }

      // Search Query Match
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }

  function renderProducts() {
    if (!productsGrid) return;
    const filtered = filterProducts();

    if (filtered.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--slate-gray);">
          <div style="font-size: 3rem; margin-bottom: 12px;">🔍</div>
          <h3>No encontramos productos</h3>
          <p>Intenta buscando con otro nombre o seleccionando otra categoría.</p>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = filtered.map(product => {
      return `
        <div class="product-card">
          <div class="card-top-badges">
            <span class="badge-origin">📍 ${product.origin}</span>
            ${product.isSeason ? '<span class="badge-season">🌟 De Temporada</span>' : ''}
          </div>

          <div class="product-emoji">${product.icon}</div>
          <h3 class="product-name">${product.name}</h3>
          <p class="product-desc">${product.description}</p>

          <div class="price-box">
            <div class="price-row">
              <span class="price-label">Menudeo:</span>
              <span class="price-value highlight">$${product.retailPrice.toFixed(2)} MXN / ${product.retailUnit}</span>
            </div>
            <div class="price-row">
              <span class="price-label">Mayoreo (Huacal):</span>
              <span class="price-value">$${product.wholesalePrice.toFixed(2)} MXN / ${product.wholesaleUnit.split(' ')[0]}</span>
            </div>
          </div>

          <div class="product-card-actions">
            <button class="add-btn add-retail-btn" onclick="addToCart('${product.id}', 'retail')">
              + 1 ${product.retailUnit}
            </button>
            <button class="add-btn add-wholesale-btn" onclick="addToCart('${product.id}', 'wholesale')">
              + 1 Huacal
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- CART & CALCULATOR LOGIC ---
  window.addToCart = function (productId, type) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = cart.findIndex(item => item.product.id === productId && item.type === type);

    if (existingIndex > -1) {
      cart[existingIndex].qty += 1;
    } else {
      cart.push({
        product: product,
        type: type,
        qty: 1
      });
    }

    updateCartUI();
    openCartDrawer();
  };

  window.updateCartQty = function (productId, type, delta) {
    const index = cart.findIndex(item => item.product.id === productId && item.type === type);
    if (index > -1) {
      cart[index].qty += delta;
      if (cart[index].qty <= 0) {
        cart.splice(index, 1);
      }
    }
    updateCartUI();
  };

  function updateCartUI() {
    // Update badge count
    const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCountBadge) {
      cartCountBadge.textContent = totalItemsCount;
    }

    // Update Drawer Content
    if (!drawerBody) return;

    if (cart.length === 0) {
      drawerBody.innerHTML = `
        <div class="cart-empty-state">
          <div style="font-size: 3.5rem; margin-bottom: 12px;">🧺</div>
          <h4>Tu pedido está vacío</h4>
          <p style="font-size: 0.9rem; margin-top: 8px;">Explora el catálogo y agrega tus frutas o verduras al menudeo o mayoreo.</p>
        </div>
      `;
      if (cartTotalAmount) cartTotalAmount.textContent = '$0.00 MXN';
      return;
    }

    let grandTotal = 0;

    drawerBody.innerHTML = cart.map(item => {
      const itemUnitPrice = item.type === 'retail' ? item.product.retailPrice : item.product.wholesalePrice;
      const itemSubtotal = itemUnitPrice * item.qty;
      grandTotal += itemSubtotal;

      const unitLabel = item.type === 'retail' ? item.product.retailUnit : 'Huacal';

      return `
        <div class="cart-item">
          <div class="cart-item-info">
            <span class="cart-item-emoji">${item.product.icon}</span>
            <div>
              <div class="cart-item-title">${item.product.name}</div>
              <div class="cart-item-sub">
                ${item.type === 'retail' ? 'Menudeo' : 'Mayoreo'}: $${itemUnitPrice.toFixed(2)} por ${unitLabel}
              </div>
            </div>
          </div>

          <div class="cart-item-controls">
            <button class="qty-btn" onclick="updateCartQty('${item.product.id}', '${item.type}', -1)">-</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="updateCartQty('${item.product.id}', '${item.type}', 1)">+</button>
          </div>
        </div>
      `;
    }).join('');

    if (cartTotalAmount) {
      cartTotalAmount.textContent = `$${grandTotal.toFixed(2)} MXN`;
    }
  }

  function openCartDrawer() {
    if (cartDrawerOverlay) cartDrawerOverlay.classList.add('active');
  }

  function closeCartDrawer() {
    if (cartDrawerOverlay) cartDrawerOverlay.classList.remove('active');
  }

  // --- WHATSAPP ORDER GENERATOR ---
  function sendOrderToWhatsApp() {
    if (cart.length === 0) {
      alert('Tu carrito está vacío. Agrega productos del catálogo para realizar tu pedido.');
      return;
    }

    let grandTotal = 0;
    let itemsText = '';

    cart.forEach((item, index) => {
      const itemUnitPrice = item.type === 'retail' ? item.product.retailPrice : item.product.wholesalePrice;
      const itemSubtotal = itemUnitPrice * item.qty;
      grandTotal += itemSubtotal;

      const unitLabel = item.type === 'retail' ? item.product.retailUnit : 'Huacal(es)';
      itemsText += `${index + 1}. *${item.product.name}* (${item.type === 'retail' ? 'Menudeo' : 'Mayoreo'})\n   ➔ Cantidad: ${item.qty} ${unitLabel} - Subtotal: $${itemSubtotal.toFixed(2)} MXN\n`;
    });

    const message = `¡Hola Frutería Mis Dos Angelitos! 👋🍊\nMe gustaría realizar el siguiente pedido:\n\n📋 *DETALLE DEL PEDIDO:*\n${itemsText}\n💰 *TOTAL ESTIMADO: $${grandTotal.toFixed(2)} MXN*\n\n📍 *Cobertura solicitada:* (Por favor indicar: Oxkutzcab / Dzan / Maní / Akil / Zapata)\n🏠 *Dirección de entrega:*\n\n¡Quedo a la espera de confirmación! Gracias.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  }

  // --- CHATBOT "ANGELITOBOT" LOGIC ---
  function toggleChatbot() {
    if (chatbotWindow) chatbotWindow.classList.toggle('active');
  }

  function addChatMessage(text, sender) {
    if (!chatBody) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${sender}`;
    msgDiv.textContent = text;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function processBotResponse(query) {
    const q = query.toLowerCase();
    let response = "¡Hola! Con gusto te ayudo. Puedes preguntarme sobre nuestro catálogo, precios de huacales al mayoreo, entregas a domicilio o nuestros horarios en Oxkutzcab.";

    if (q.includes('horario') || q.includes('hora') || q.includes('abierto')) {
      response = `⏰ Nuestro horario de atención es de ${BUSINESS_INFO.hours}. ¡Abrimos de Lunes a Domingo!`;
    } else if (q.includes('donde') || q.includes('ubicacion') || q.includes('direccion') || q.includes('oxkutzcab')) {
      response = "📍 Nos encontramos ubicados en el corazón agrícola de Oxkutzcab, Yucatán. Realizamos envíos directos a tu domicilio.";
    } else if (q.includes('domicilio') || q.includes('cobertura') || q.includes('entrega') || q.includes('envio')) {
      response = "🚚 Contamos con servicio a domicilio en: Oxkutzcab, Dzan, Maní (Pueblo Mágico), Akil y la comisaría Emiliano Zapata.";
    } else if (q.includes('mayoreo') || q.includes('huacal') || q.includes('caja')) {
      response = "📦 ¡Excelente opción! Vendemos huacales de madera tradicionales (18-25kg) con precios especiales de mayoreo que NUNCA superan los $500 MXN por huacal.";
    } else if (q.includes('pago') || q.includes('transferencia') || q.includes('efectivo')) {
      response = "💵 Aceptamos pago en efectivo contra entrega y transferencias bancarias (SPEI).";
    } else if (q.includes('pedido') || q.includes('comprar') || q.includes('whatsapp')) {
      response = "💬 Puedes armar tu pedido en la calculadora del sitio o escribirnos directo a WhatsApp al " + BUSINESS_INFO.phone + ".";
    }

    setTimeout(() => {
      addChatMessage(response, 'bot');
    }, 400);
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Tabs Filtering
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        renderProducts();
      });
    });

    // Search Input
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderProducts();
      });
    }

    // Cart Drawer Toggle
    if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCartDrawer);
    if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeCartDrawer);
    if (cartDrawerOverlay) {
      cartDrawerOverlay.addEventListener('click', (e) => {
        if (e.target === cartDrawerOverlay) closeCartDrawer();
      });
    }

    // Checkout WhatsApp
    if (sendWhatsappOrderBtn) {
      sendWhatsappOrderBtn.addEventListener('click', sendOrderToWhatsApp);
    }

    // Chatbot Events
    if (chatbotFloatBtn) chatbotFloatBtn.addEventListener('click', toggleChatbot);
    if (closeChatbotBtn) closeChatbotBtn.addEventListener('click', toggleChatbot);

    if (sendChatBtn && chatInput) {
      const sendHandler = () => {
        const text = chatInput.value.trim();
        if (text) {
          addChatMessage(text, 'user');
          chatInput.value = '';
          processBotResponse(text);
        }
      };

      sendChatBtn.addEventListener('click', sendHandler);
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendHandler();
      });
    }

    // Quick Chips for Chatbot
    quickChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.dataset.query;
        addChatMessage(query, 'user');
        processBotResponse(query);
      });
    });
  }

  // --- FAQ ACCORDION ---
  function setupFAQ() {
    faqItems.forEach(item => {
      const questionBtn = item.querySelector('.faq-question');
      if (questionBtn) {
        questionBtn.addEventListener('click', () => {
          const isActive = item.classList.contains('active');
          faqItems.forEach(i => i.classList.remove('active'));
          if (!isActive) item.classList.add('active');
        });
      }
    });
  }

  // --- MOBILE MENU ---
  function setupMobileMenu() {
    if (mobileMenuBtn && navMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
      });
    }
  }
});
