
import { IProduct, IInventoryStats, ProductUpdate } from "./types.js";
import { createProductFromData } from "./models.js";
import { AuditSession } from "./audit.js";
import {
    debounce,
    throttle,
    computeStats,
    getUniqueCategories,
    exportToJSON,
} from "./utils.js";

const getEl = (id: string): HTMLElement => document.getElementById(id)!;
let allProducts: IProduct[] = [];
let filteredProducts: IProduct[] = [];
let displayedCount = 0;
const BATCH_SIZE = 12;
let currentAuditSession: AuditSession | null = null;

export function initDOM(products: IProduct[]): void {
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

function renderStats(stats: IInventoryStats): void {
    const dashboard = getEl("stats-dashboard");

    dashboard.innerHTML = `
   <div class="stat-card">
  <div class="stat-info">
    <span class="stat-number">${stats.totalProducts}</span>
    <span class="stat-label">Products</span>
  </div>
</div>

<div class="stat-card">
  <div class="stat-info">
    <span class="stat-number">$${stats.totalValue.toLocaleString()}</span>
    <span class="stat-label">Inventory Value</span>
  </div>
</div>

<div class="stat-card">
  <div class="stat-info">
    <span class="stat-number">${stats.totalSold.toLocaleString()}</span>
    <span class="stat-label">Sold Items</span>
  </div>
</div>

<div class="stat-card">
  <div class="stat-info">
    <span class="stat-number">$${stats.averagePrice.toFixed(2)}</span>
    <span class="stat-label">Average Price</span>
  </div>
</div>

<div class="stat-card stat-card-warning">
  <div class="stat-info">
    <span class="stat-number">${stats.lowStockAlerts.length}</span>
    <span class="stat-label">Low Stock</span>
  </div>
</div>

<div class="stat-card stat-card-danger">
  <div class="stat-info">
    <span class="stat-number">${stats.outOfStock.length}</span>
    <span class="stat-label">Out of Stock</span>
  </div>
</div>

  `;
    renderTopSellers(stats.topSellers);
    renderCategoryBreakdown(stats.categoryBreakdown);
}
function renderTopSellers(topSellers: IProduct[]): void {
    const container = getEl("top-sellers");
    container.innerHTML = topSellers
        .map(
            (p, i) => `
    <div class="top-seller-item">
      <span class="rank">#${i + 1}</span>
      <span class="seller-name">${p.name}</span>
      <span class="seller-sold">${p.sold} sold</span>
    </div>
  `
        )
        .join("");
}
function renderCategoryBreakdown(breakdown: Record<string, number>): void {
    const container = getEl("category-breakdown");
    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

    container.innerHTML = Object.entries(breakdown)
        .sort(([, a], [, b]) => b - a)
        .map(
            ([cat, count]) => `
    <div class="breakdown-item">
      <div class="breakdown-bar-wrapper">
        <span class="breakdown-label">${cat}</span>
        <span class="breakdown-count">${count}</span>
      </div>
      <div class="breakdown-bar">
        <div class="breakdown-fill" style="width: ${(count / total) * 100}%"></div>
      </div>
    </div>
  `
        )
        .join("");
}
function renderCategoryFilter(products: IProduct[]): void {
    const select = getEl("category-filter") as HTMLSelectElement;
    const categories = getUniqueCategories(products);
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
function renderProductBatch(products: IProduct[]): void {
    const grid = getEl("product-grid");

    const html = products
        .map((p) => {
            const productInstance = createProductFromData(p);
            return productInstance.toCard();
        })
        .join("");

    grid.insertAdjacentHTML("beforeend", html);
}

function loadMoreProducts(): void {
    const nextBatch = filteredProducts.slice(
        displayedCount,
        displayedCount + BATCH_SIZE
    );
    if (nextBatch.length === 0) return;

    renderProductBatch(nextBatch);
    displayedCount += nextBatch.length;
    const status = getEl("load-status");
    status.textContent = `Showing ${displayedCount} of ${filteredProducts.length} products`;
}
function applyFilters(): void {
    const searchInput = getEl("search-input") as HTMLInputElement;
    const categorySelect = getEl("category-filter") as HTMLSelectElement;
    const query = searchInput.value.toLowerCase().trim();
    const category = categorySelect.value;

    filteredProducts = allProducts.filter((p) => {
        const matchesSearch =
            !query ||
            p.name.toLowerCase().includes(query) ||
            p.sku.toLowerCase().includes(query) ||
            p.supplier.toLowerCase().includes(query);

        const matchesCategory = !category || p.category === category;

        return matchesSearch && matchesCategory;
    });
    const grid = getEl("product-grid");
    grid.innerHTML = "";
    displayedCount = 0;
    loadMoreProducts();
}

function setupSearch(): void {
    const searchInput = getEl("search-input") as HTMLInputElement;
    const debouncedSearch = debounce(() => {
        applyFilters();
    }, 300);

    searchInput.addEventListener("input", debouncedSearch);
}

function setupScroll(): void {
    const container = getEl("grid-container");

    const throttledScroll = throttle(() => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        if (scrollTop + clientHeight >= scrollHeight * 0.8) {
            loadMoreProducts();
        }
    }, 200);

    container.addEventListener("scroll", throttledScroll);
}
function setupEventDelegation(): void {
    const grid = getEl("product-grid");

    grid.addEventListener("click", (e: Event) => {
        const target = e.target as HTMLElement;
        const button = target.closest("button[data-action]") as HTMLElement | null;
        if (!button) return;

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
function handleSingleAudit(productId: number): void {
    const product = allProducts.find((p) => p.id === productId);
    if (!product) return;

    const session = new AuditSession();
    session.runAudit([product]);

    const reportPanel = getEl("audit-panel");
    reportPanel.innerHTML = session.generateReport();
    reportPanel.classList.add("visible");
    reportPanel.scrollIntoView({ behavior: "smooth" });
}
function handleSingleEdit(productId: number): void {
    const product = allProducts.find((p) => p.id === productId);
    if (!product) return;
    const modal = getEl("bulk-edit-modal");
    const priceInput = getEl("edit-price") as HTMLInputElement;
    const stockInput = getEl("edit-stock") as HTMLInputElement;
    const selectedList = getEl("selected-products-list");

    priceInput.value = product.price.toString();
    stockInput.value = product.stock.toString();
    selectedList.innerHTML = `<div class="selected-item">${product.name} (${product.sku})</div>`;
    modal.dataset.selectedIds = JSON.stringify([productId]);
    modal.classList.add("visible");
}
function setupBulkEditForm(): void {
    const form = getEl("bulk-edit-form") as HTMLFormElement;
    const modal = getEl("bulk-edit-modal");
    const openBtn = getEl("bulk-edit-btn");
    const closeBtn = getEl("close-modal"); 

    openBtn.addEventListener("click", () => {
        const checkboxes = document.querySelectorAll(
            ".bulk-checkbox:checked"
        ) as NodeListOf<HTMLInputElement>;
        const selectedIds = Array.from(checkboxes).map((cb) =>
            parseInt(cb.dataset.id || "0", 10)
        );

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
        (getEl("edit-price") as HTMLInputElement).value = "";
        (getEl("edit-stock") as HTMLInputElement).value = "";

        modal.classList.add("visible");
    });
    closeBtn.addEventListener("click", () => {
        modal.classList.remove("visible");
    });

    form.addEventListener("submit", (e: Event) => {
        e.preventDefault();

        const selectedIds: number[] = JSON.parse(
            modal.dataset.selectedIds || "[]"
        );
        const priceValue = (getEl("edit-price") as HTMLInputElement).value;
        const stockValue = (getEl("edit-stock") as HTMLInputElement).value;

        const update: ProductUpdate = {};
        if (priceValue) update.price = parseFloat(priceValue);
        if (stockValue) update.stock = parseInt(stockValue, 10);

        let updatedCount = 0;
        allProducts = allProducts.map((p) => {
            if (selectedIds.includes(p.id)) {
                updatedCount++;
                return { ...p, ...update };
            }
            return p;
        });

        modal.classList.remove("visible");
        filteredProducts = [...allProducts];
        const grid = getEl("product-grid");
        grid.innerHTML = "";
        displayedCount = 0;
        applyFilters();
        renderStats(computeStats(allProducts));

        document
            .querySelectorAll(".bulk-checkbox:checked")
            .forEach((cb) => ((cb as HTMLInputElement).checked = false));

        showToast(`✅ Updated ${updatedCount} product(s) successfully!`, "success");
    });
}
function setupAuditButton(): void {
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
function setupExportButton(): void {
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
        showToast("Inventory data exported successfully!", "success");
    });
}

function setupSelectAll(): void {
    const selectAllBtn = getEl("select-all-btn");
    let allSelected = false;

    selectAllBtn.addEventListener("click", () => {
        allSelected = !allSelected;
        const checkboxes = document.querySelectorAll(
            ".bulk-checkbox"
        ) as NodeListOf<HTMLInputElement>;
        checkboxes.forEach((cb) => (cb.checked = allSelected));
        selectAllBtn.textContent = allSelected ? "Deselect All" : "Select All";
    });
}
function showToast(
    message: string,
    type: "success" | "warning" | "error" = "success"
): void {
    const existing = document.querySelector(".toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("visible"));
    setTimeout(() => {
        toast.classList.remove("visible");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
