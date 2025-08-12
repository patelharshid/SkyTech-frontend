const API_BASE_URL = 'http://localhost:8080/api/products';

// DOM Elements
const loginModal = document.getElementById('loginModal');
const adminCodeInput = document.getElementById('adminCode');
const loginBtn = document.getElementById('loginBtn');
const logo = document.getElementById('logo');
const mainContent = document.getElementById('mainContent');
const adminPage = document.getElementById('adminPage');
const addProductBtn = document.getElementById('addProductBtn');
const viewProductsBtn = document.getElementById('viewProductsBtn');
const logoutBtn = document.getElementById('logoutBtn');
const productForm = document.getElementById('productForm');
const productFormElement = document.getElementById('productFormElement');
const productsTableContainer = document.getElementById('productsTableContainer');
const productsTableBody = document.getElementById('productsTableBody');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const saveProductBtn = document.getElementById('saveProductBtn');
const productGrid = document.getElementById('productGrid');

// Slider elements
const slides = document.querySelectorAll('.slide');
const indicators = document.querySelectorAll('.indicator');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

// Category buttons
const categoryButtons = document.querySelectorAll('.categories button');

let currentProductId = null;
let currentSlide = 0;

// API Functions
async function fetchProducts() {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    return Array.isArray(data) ? data : []; // Ensure we always return an array
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function fetchProductById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

async function createProduct(product) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productsName: product.name,
        category: product.category,
        image: product.image,
        specs: product.specs,
        price: product.price,
        highlight : product.highlight,
      })
    });
    if (!response.ok) throw new Error('Failed to create product');
    return await response.json();
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
}

async function updateProduct(id, product) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productsId: id,
        productsName: product.name,
        category: product.category,
        image: product.image,
        specs: product.specs,
        price: product.price
      })
    });
    if (!response.ok) throw new Error('Failed to update product');
    return await response.json();
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
}

async function deleteProductFromServer(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
}

// UI Functions
async function renderProductCards() {
  const products = await fetchProducts();
  if (!products || products.length === 0) {
    productGrid.innerHTML = '<p class="no-products">No products available at the moment.</p>';
    return;
  }

  productGrid.innerHTML = products.map(product => `
    <div class="product-card" data-cat="${product.category}" data-id="${product.productsId}">
      <img src="${product.image}" alt="${product.productsName}">
      <div class="product-details">
        <h3>${product.productsName}</h3>
        <div class="product-specs">${product.specs}</div>
        <div class="price">₹${product.price.toLocaleString()}</div>
        <button>View Details</button>
      </div>
    </div>
  `).join('');

  // Reattach event listeners to the new buttons
  setupProductButtons();
}

async function renderProductsTable() {
  productsTableBody.innerHTML = '';

  const products = await fetchProducts();
  if (!products) return;

  products.forEach(product => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${product.productsName}</td>
      <td>${product.category}</td>
      <td>₹${product.price.toLocaleString()}</td>
      <td>
        <button class="edit-btn" data-id="${product.productsId}">Edit</button>
        <button class="delete-btn" data-id="${product.productsId}">Delete</button>
      </td>
    `;

    productsTableBody.appendChild(row);
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => editProduct(parseInt(e.target.dataset.id)));
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => deleteProduct(parseInt(e.target.dataset.id)));
  });
}

// Initialize the page
async function init() {
  adminPage.style.display = 'none';
  productForm.style.display = 'none';
  productsTableContainer.style.display = 'none';

  // Load products when page loads
  await renderProductCards();

  setupEventListeners();
  startSlider();
  setupCategoryFilters();
  setupScrollAnimations();
  setupProductButtons();
  setupSmoothScrolling();
}

// Event Handlers
function setupEventListeners() {
  logo.addEventListener('click', () => {
    loginModal.classList.add('active');
  });

  loginBtn.addEventListener('click', () => {
    if (adminCodeInput.value === '9999') {
      loginModal.classList.remove('active');
      mainContent.style.display = 'none';
      adminPage.style.display = 'block';
      renderProductsTable();
    } else {
      alert('Incorrect admin code. Please try again.');
      adminCodeInput.value = '';
    }
  });

  addProductBtn.addEventListener('click', showProductForm);
  viewProductsBtn.addEventListener('click', showProductsTable);
  logoutBtn.addEventListener('click', logout);

  cancelFormBtn.addEventListener('click', cancelForm);
  productFormElement.addEventListener('submit', saveProduct);
}

// Slider Functions (unchanged)
function startSlider() {
  showSlide(currentSlide);

  setInterval(() => {
    nextSlide();
  }, 5000);

  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);

  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      goToSlide(index);
    });
  });
}

function showSlide(index) {
  slides.forEach(slide => slide.style.display = 'none');
  indicators.forEach(indicator => indicator.classList.remove('active'));

  slides[index].style.display = 'block';
  indicators[index].classList.add('active');
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
}

function goToSlide(index) {
  currentSlide = index;
  showSlide(currentSlide);
}

// Product Filtering
function setupCategoryFilters() {
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const category = button.dataset.cat;
      filterProducts(category);
    });
  });
}

function filterProducts(category) {
  const productCards = document.querySelectorAll('.product-card');

  productCards.forEach(card => {
    if (category === 'all' || card.dataset.cat === category) {
      card.style.display = 'block';
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100);
    } else {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.display = 'none';
      }, 300);
    }
  });
}

// Other UI Functions (unchanged)
function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
  });

  window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
      header.style.background = 'rgba(26, 32, 44, 0.95)';
    } else {
      header.style.background = 'rgba(26, 32, 44, 0.85)';
    }
  });
}

function setupProductButtons() {
  document.querySelectorAll('.product-card .product-details button').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const productCard = e.target.closest('.product-card');
      const productId = productCard.dataset.id;

      try {
        const product = await fetchProductById(productId);
        if (product) {
          showProductDetails(product);
        } else {
          alert('Product details not found.');
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        alert('Error fetching product details.');
      }
    });
  });
}


function showProductDetails(product) {
  const container = document.querySelector('#mainContent');

  container.innerHTML = `
    <div class="product-details-hero">
      <div class="product-details-container">
        <button id="backButton" class="back-btn">
          Back to Products
        </button>

        <div class="product-details-card">
          <div class="product-image-section">
            <div class="image-container">
              <img src="${product.image}" alt="${product.productsName}" class="product-main-image" />
            </div>
          </div>

          <!-- Product info section -->
          <div class="product-info-section">
            <div class="product-badge">${product.category}</div>
            
            <h1 class="product-title">${product.productsName}</h1>
            
            <div class="price-section">
              <span class="current-price">₹${product.price.toLocaleString()}</span>
            </div>

            <div class="specs-section">
              <h3 class="specs-title">Specifications</h3>
              <div class="specs-content">
                <p>${product.specs}</p>
              </div>
            </div>
            <br>
              <div class="specs-section">
              <h3 class="specs-title">Highlight</h3>
              <div class="specs-content">
                <p>${product.highlight}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `;

  addProductDetailsStyles();

  document.getElementById('backButton').addEventListener('click', () => {
    window.location.reload();
  });

  setTimeout(() => {
    document.querySelector('.product-details-card').classList.add('animate-in');
  }, 100);
}

function addProductDetailsStyles() {
  if (document.getElementById('product-details-styles')) return;

  const styleSheet = document.createElement('style');
  styleSheet.id = 'product-details-styles';
  styleSheet.textContent = `
  
    .product-details-hero {
      min-height: 100vh;
      position: relative;
    }

    .product-details-container {
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }
       .product-details-hero {
      min-height: 100vh;
      display: flex;
      align-items: center;  
      justify-content: center; 
      position: relative;
      padding: 2rem; 
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      background: var(--glass);
      backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      border-radius: 50px;
      color: var(--text-light);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 3rem;
      text-decoration: none;
    }
    .product-details-card {
      background: var(--glass);
      backdrop-filter: blur(30px);
      border: 1px solid var(--glass-border);
      border-radius: 32px;
      overflow: hidden;
      box-shadow: 0 25px 50px var(--shadow);
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      min-height: 400px;
      margin-bottom: 3rem;
    }

    .product-details-card.animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .product-image-section {
      position: relative;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(240, 147, 251, 0.05));
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .image-container {
      position: relative;
      width: 100%;
      max-width: 400px;
      aspect-ratio: 4/3;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }

    .product-main-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .image-container:hover .product-main-image {
      transform: scale(1.05);
    }

    .product-info-section {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .product-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 1rem;
      width: fit-content;
    }

    .product-title {
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--text-light), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 1.5rem;
      line-height: 1.2;
    }

    .price-section {
      margin-bottom: 2rem;
      display: flex;
      align-items: baseline;
      gap: 1rem;
    }

    .current-price {
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--warning), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  `;

  document.head.appendChild(styleSheet);
}


function setupSmoothScrolling() {
  document.querySelectorAll('nav a, .cta-btn').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Admin Functions
function showProductForm() {
  productForm.style.display = 'block';
  productsTableContainer.style.display = 'none';
  resetForm();
}

async function showProductsTable() {
  productForm.style.display = 'none';
  productsTableContainer.style.display = 'block';
  await renderProductsTable();
}

function logout() {
  mainContent.style.display = 'block';
  adminPage.style.display = 'none';
  adminCodeInput.value = '';
}

async function editProduct(id) {
  const product = await fetchProductById(id);
  if (!product) return;

  currentProductId = id;

  document.getElementById('productId').value = product.productsId;
  document.getElementById('productsName').value = product.productsName;
  document.getElementById('productCategory').value = product.category;
  document.getElementById('productImage').value = product.image;
  document.getElementById('productSpecs').value = product.specs;
  document.getElementById('productPrice').value = product.price;

  productForm.style.display = 'block';
  productsTableContainer.style.display = 'none';
}

async function deleteProduct(id) {
  if (confirm('Are you sure you want to delete this product?')) {
    const success = await deleteProductFromServer(id);
    if (success) {
      await renderProductsTable();
      await renderProductCards(); // Update the main product grid as well
    } else {
      alert('Failed to delete product');
    }
  }
}

function cancelForm() {
  productForm.style.display = 'none';
  productsTableContainer.style.display = 'block';
  resetForm();
}

function resetForm() {
  currentProductId = null;
  productFormElement.reset();
}

async function saveProduct(e) {
  e.preventDefault();

  const name = document.getElementById('productsName').value;
  const category = document.getElementById('productCategory').value;
  const image = document.getElementById('productImage').value;
  const specs = document.getElementById('productSpecs').value;
  const price = parseFloat(document.getElementById('productPrice').value);
  const highlight = document.getElementById('highlight').value;

  const productData = { name, category, image, specs, price , highlight};

  try {
    if (currentProductId) {
      const updatedProduct = await updateProduct(currentProductId, productData);
      if (!updatedProduct) throw new Error('Failed to update product');
    } else {
      const newProduct = await createProduct(productData);
      if (!newProduct) throw new Error('Failed to create product');
    }

    resetForm();
    await renderProductsTable();
    await renderProductCards(); // Update the main product grid
    productForm.style.display = 'none';
    productsTableContainer.style.display = 'block';
  } catch (error) {
    console.error('Error saving product:', error);
    alert('Failed to save product. Please try again.');
  }
}

// Initialize the application
init();