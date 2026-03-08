// ============================================================
// dom.ts — DOM Rendering, Event Delegation, Search, Scroll,
//          Bulk-Edit Form, and Stats Dashboard
//          Demonstrates Async/DOM patterns from syllabus
// ============================================================
import { createProductFromData } from "./models.js";
import { AuditSession } from "./audit.js";
import { debounce, throttle, computeStats, getUniqueCategories, exportToJSON, } from "./utils.js";
// ─── DOM Element References ─────────────────────────────────
const getEl = (id) => document.getElementById(id);
// ─── State ──────────────────────────────────────────────────
let allProducts = [];
let filteredProducts = [];
let displayedCount = 0;
const BATCH_SIZE = 12;
let currentAuditSession = null;
// ─── Initialize the DOM Module ──────────────────────────────
export function initDOM(products) {
    allProducts = products;
    filteredProducts = [...products];
    displayedCount = 0;
    renderStats(computeStats(products));
    renderCategoryFilter(products);
    loadMoreProducts();
    setupEventDelegation();
    setupSearch();
    setupScroll();
    setupBulkEditForm();
    setupAuditButton();
    setupExportButton();
    setupSelectAll();
}
// ─── Render Stats Dashboard ─────────────────────────────────
function renderStats(stats) {
    const dashboard = getEl("stats-dashboard");
    dashboard.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon">📦</div>
      <div class="stat-info">
        <span class="stat-number">${stats.totalProducts}</span>
        <span class="stat-label">Total Products</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">💰</div>
      <div class="stat-info">
        <span class="stat-number">$${stats.totalValue.toLocaleString()}</span>
        <span class="stat-label">Inventory Value</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">🛒</div>
      <div class="stat-info">
        <span class="stat-number">${stats.totalSold.toLocaleString()}</span>
        <span class="stat-label">Total Sold</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">💵</div>
      <div class="stat-info">
        <span class="stat-number">$${stats.averagePrice.toFixed(2)}</span>
        <span class="stat-label">Avg. Price</span>
      </div>
    </div>
    <div class="stat-card stat-card-warning">
      <div class="stat-icon">⚠️</div>
      <div class="stat-info">
        <span class="stat-number">${stats.lowStockAlerts.length}</span>
        <span class="stat-label">Low Stock</span>
      </div>
    </div>
    <div class="stat-card stat-card-danger">
      <div class="stat-icon">🚫</div>
      <div class="stat-info">
        <span class="stat-number">${stats.outOfStock.length}</span>
        <span class="stat-label">Out of Stock</span>
      </div>
    </div>
  `;
    // Render top sellers
    renderTopSellers(stats.topSellers);
    // Render category breakdown
    renderCategoryBreakdown(stats.categoryBreakdown);
}
// ─── Render Top Sellers ─────────────────────────────────────
function renderTopSellers(topSellers) {
    const container = getEl("top-sellers");
    container.innerHTML = topSellers
        .map((p, i) => `
    <div class="top-seller-item">
      <span class="rank">#${i + 1}</span>
      <span class="seller-name">${p.name}</span>
      <span class="seller-sold">${p.sold} sold</span>
    </div>
  `)
        .join("");
}
// ─── Render Category Breakdown ──────────────────────────────
function renderCategoryBreakdown(breakdown) {
    const container = getEl("category-breakdown");
    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
    container.innerHTML = Object.entries(breakdown)
        .sort(([, a], [, b]) => b - a)
        .map(([cat, count]) => `
    <div class="breakdown-item">
      <div class="breakdown-bar-wrapper">
        <span class="breakdown-label">${cat}</span>
        <span class="breakdown-count">${count}</span>
      </div>
      <div class="breakdown-bar">
        <div class="breakdown-fill" style="width: ${(count / total) * 100}%"></div>
      </div>
    </div>
  `)
        .join("");
}
// ─── Render Category Filter Dropdown ────────────────────────
function renderCategoryFilter(products) {
    const select = getEl("category-filter");
    const categories = getUniqueCategories(products);
    // Keep the "All Categories" option; add dynamic ones
    categories.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
    select.addEventListener("change", () => {
        applyFilters();
    });
}
// ─── Render Product Grid (append batch) ─────────────────────
function renderProductBatch(products) {
    const grid = getEl("product-grid");
    const html = products
        .map((p) => {
        const productInstance = createProductFromData(p);
        return productInstance.toCard();
    })
        .join("");
    grid.insertAdjacentHTML("beforeend", html);
}
// ─── Load More Products (infinite scroll batching) ──────────
function loadMoreProducts() {
    const nextBatch = filteredProducts.slice(displayedCount, displayedCount + BATCH_SIZE);
    if (nextBatch.length === 0)
        return;
    renderProductBatch(nextBatch);
    displayedCount += nextBatch.length;
    // Update load status
    const status = getEl("load-status");
    status.textContent = `Showing ${displayedCount} of ${filteredProducts.length} products`;
}
// ─── Apply Filters (search + category) ─────────────────────
function applyFilters() {
    const searchInput = getEl("search-input");
    const categorySelect = getEl("category-filter");
    const query = searchInput.value.toLowerCase().trim();
    const category = categorySelect.value;
    filteredProducts = allProducts.filter((p) => {
        const matchesSearch = !query ||
            p.name.toLowerCase().includes(query) ||
            p.sku.toLowerCase().includes(query) ||
            p.supplier.toLowerCase().includes(query);
        const matchesCategory = !category || p.category === category;
        return matchesSearch && matchesCategory;
    });
    // Reset grid and re-render
    const grid = getEl("product-grid");
    grid.innerHTML = "";
    displayedCount = 0;
    loadMoreProducts();
}
// ─── Setup Search with Debounce ─────────────────────────────
function setupSearch() {
    const searchInput = getEl("search-input");
    // Debounce: only fires 300ms after user stops typing
    const debouncedSearch = debounce(() => {
        applyFilters();
    }, 300);
    searchInput.addEventListener("input", debouncedSearch);
}
// ─── Setup Scroll with Throttle ─────────────────────────────
function setupScroll() {
    const container = getEl("grid-container");
    // Throttle: fires at most once every 200ms
    const throttledScroll = throttle(() => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        // Load more when scrolled to 80% of container
        if (scrollTop + clientHeight >= scrollHeight * 0.8) {
            loadMoreProducts();
        }
    }, 200);
    container.addEventListener("scroll", throttledScroll);
}
// ─── Event Delegation on Product Grid ───────────────────────
// Single event listener on parent handles all child button clicks
function setupEventDelegation() {
    const grid = getEl("product-grid");
    grid.addEventListener("click", (e) => {
        const target = e.target;
        const button = target.closest("button[data-action]");
        if (!button)
            return;
        const action = button.dataset.action;
        const productId = parseInt(button.dataset.id || "0", 10);
        switch (action) {
            case "audit":
                handleSingleAudit(productId);
                break;
            case "edit":
                handleSingleEdit(productId);
                break;
        }
    });
}
// ─── Handle Single Product Audit ────────────────────────────
function handleSingleAudit(productId) {
    const product = allProducts.find((p) => p.id === productId);
    if (!product)
        return;
    const session = new AuditSession();
    session.runAudit([product]);
    const reportPanel = getEl("audit-panel");
    reportPanel.innerHTML = session.generateReport();
    reportPanel.classList.add("visible");
    reportPanel.scrollIntoView({ behavior: "smooth" });
}
// ─── Handle Single Product Edit ─────────────────────────────
function handleSingleEdit(productId) {
    const product = allProducts.find((p) => p.id === productId);
    if (!product)
        return;
    // Pre-fill the bulk edit form with this single product
    const modal = getEl("bulk-edit-modal");
    const priceInput = getEl("edit-price");
    const stockInput = getEl("edit-stock");
    const selectedList = getEl("selected-products-list");
    priceInput.value = product.price.toString();
    stockInput.value = product.stock.toString();
    selectedList.innerHTML = `<div class="selected-item">${product.name} (${product.sku})</div>`;
    // Store the selected IDs for form submission
    modal.dataset.selectedIds = JSON.stringify([productId]);
    modal.classList.add("visible");
}
// ─── Setup Bulk Edit Form ───────────────────────────────────
function setupBulkEditForm() {
    const form = getEl("bulk-edit-form");
    const modal = getEl("bulk-edit-modal");
    const openBtn = getEl("bulk-edit-btn");
    const closeBtn = getEl("close-modal");
    // Open modal with selected products
    openBtn.addEventListener("click", () => {
        const checkboxes = document.querySelectorAll(".bulk-checkbox:checked");
        const selectedIds = Array.from(checkboxes).map((cb) => parseInt(cb.dataset.id || "0", 10));
        if (selectedIds.length === 0) {
            showToast("Please select at least one product to edit.", "warning");
            return;
        }
        const selectedList = getEl("selected-products-list");
        selectedList.innerHTML = selectedIds
            .map((id) => {
            const p = allProducts.find((prod) => prod.id === id);
            return p
                ? `<div class="selected-item">${p.name} (${p.sku})</div>`
                : "";
        })
            .join("");
        modal.dataset.selectedIds = JSON.stringify(selectedIds);
        // Clear form fields
        getEl("edit-price").value = "";
        getEl("edit-stock").value = "";
        modal.classList.add("visible");
    });
    // Close modal
    closeBtn.addEventListener("click", () => {
        modal.classList.remove("visible");
    });
    // Handle form submission
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const selectedIds = JSON.parse(modal.dataset.selectedIds || "[]");
        const priceValue = getEl("edit-price").value;
        const stockValue = getEl("edit-stock").value;
        const update = {};
        if (priceValue)
            update.price = parseFloat(priceValue);
        if (stockValue)
            update.stock = parseInt(stockValue, 10);
        // Apply updates to matching products
        let updatedCount = 0;
        allProducts = allProducts.map((p) => {
            if (selectedIds.includes(p.id)) {
                updatedCount++;
                return { ...p, ...update };
            }
            return p;
        });
        // Re-render everything
        modal.classList.remove("visible");
        filteredProducts = [...allProducts];
        const grid = getEl("product-grid");
        grid.innerHTML = "";
        displayedCount = 0;
        applyFilters();
        renderStats(computeStats(allProducts));
        // Reset checkboxes
        document
            .querySelectorAll(".bulk-checkbox:checked")
            .forEach((cb) => (cb.checked = false));
        showToast(`✅ Updated ${updatedCount} product(s) successfully!`, "success");
    });
}
// ─── Setup Run Audit Button ─────────────────────────────────
function setupAuditButton() {
    const btn = getEl("run-audit-btn");
    btn.addEventListener("click", () => {
        currentAuditSession = new AuditSession();
        currentAuditSession.runAudit(allProducts);
        const reportPanel = getEl("audit-panel");
        reportPanel.innerHTML = currentAuditSession.generateReport();
        reportPanel.classList.add("visible");
        reportPanel.scrollIntoView({ behavior: "smooth" });
    });
}
// ─── Setup Export Button ────────────────────────────────────
function setupExportButton() {
    const btn = getEl("export-btn");
    btn.addEventListener("click", () => {
        const exportData = {
            exportDate: new Date().toISOString(),
            products: allProducts,
            stats: computeStats(allProducts),
            auditResults: currentAuditSession
                ? currentAuditSession.getResults()
                : [],
        };
        exportToJSON(exportData, `inventory-export-${Date.now()}.json`);
        showToast("📥 Inventory data exported successfully!", "success");
    });
}
// ─── Setup Select All Checkbox ──────────────────────────────
function setupSelectAll() {
    const selectAllBtn = getEl("select-all-btn");
    let allSelected = false;
    selectAllBtn.addEventListener("click", () => {
        allSelected = !allSelected;
        const checkboxes = document.querySelectorAll(".bulk-checkbox");
        checkboxes.forEach((cb) => (cb.checked = allSelected));
        selectAllBtn.textContent = allSelected ? "Deselect All" : "Select All";
    });
}
// ─── Toast Notification ─────────────────────────────────────
function showToast(message, type = "success") {
    // Remove any existing toast
    const existing = document.querySelector(".toast");
    if (existing)
        existing.remove();
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    // Trigger animation
    requestAnimationFrame(() => toast.classList.add("visible"));
    // Auto-remove after 3s
    setTimeout(() => {
        toast.classList.remove("visible");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
//# sourceMappingURL=dom.js.map