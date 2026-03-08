// ============================================================
// models.ts — OOP Prototypes for Product and Item
//             Demonstrates prototype-based inheritance
// ============================================================
import { getStockStatus } from "./types.js";
// ─── Product Constructor Function (Prototype-based OOP) ─────
// Using constructor functions and prototypes as per syllabus
export function Product(id, sku, name, category, price, stock, sold, supplier, lastAudited) {
    this.id = id;
    this.sku = sku;
    this.name = name;
    this.category = category;
    this.price = price;
    this.stock = stock;
    this.sold = sold;
    this.supplier = supplier;
    this.lastAudited = lastAudited;
}
// ─── Prototype Methods ──────────────────────────────────────
// Returns the stock status based on current quantity
Product.prototype.getStockStatus = function () {
    return getStockStatus(this.stock);
};
// Apply a percentage discount to the price
Product.prototype.applyDiscount = function (percent) {
    if (percent < 0 || percent > 100) {
        throw new Error("Discount must be between 0 and 100");
    }
    this.price = Math.round(this.price * (1 - percent / 100) * 100) / 100;
};
// Calculate total revenue from this product
Product.prototype.getRevenue = function () {
    return Math.round(this.price * this.sold * 100) / 100;
};
// Convert to a plain IProduct object
Product.prototype.toJSON = function () {
    return {
        id: this.id,
        sku: this.sku,
        name: this.name,
        category: this.category,
        price: this.price,
        stock: this.stock,
        sold: this.sold,
        supplier: this.supplier,
        lastAudited: this.lastAudited,
    };
};
// Render as an HTML card string
Product.prototype.toCard = function () {
    const status = this.getStockStatus();
    const statusClass = status === "out-of-stock"
        ? "status-danger"
        : status === "low-stock"
            ? "status-warning"
            : "status-success";
    return `
    <div class="product-card" data-id="${this.id}" data-sku="${this.sku}">
      <div class="card-header">
        <span class="card-category">${this.category}</span>
        <span class="status-badge ${statusClass}">${status}</span>
      </div>
      <h3 class="card-title">${this.name}</h3>
      <div class="card-details">
        <div class="detail-row">
          <span class="detail-label">SKU</span>
          <span class="detail-value">${this.sku}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Price</span>
          <span class="detail-value price-value">$${this.price.toFixed(2)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Stock</span>
          <span class="detail-value">${this.stock} units</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Sold</span>
          <span class="detail-value">${this.sold} units</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Supplier</span>
          <span class="detail-value">${this.supplier}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Last Audited</span>
          <span class="detail-value">${this.lastAudited}</span>
        </div>
      </div>
      <div class="card-actions">
        <button class="btn btn-audit" data-action="audit" data-id="${this.id}">
          <span class="btn-icon">🔍</span> Audit
        </button>
        <button class="btn btn-edit" data-action="edit" data-id="${this.id}">
          <span class="btn-icon">✏️</span> Edit
        </button>
        <label class="bulk-select-label">
          <input type="checkbox" class="bulk-checkbox" data-id="${this.id}" />
          Select
        </label>
      </div>
    </div>
  `;
};
// ─── Item Constructor (Inherits from Product) ───────────────
// Adds warehouse-specific fields via prototypal inheritance
export function Item(id, sku, name, category, price, stock, sold, supplier, lastAudited, warehouse, aisle) {
    // Call parent constructor
    Product.call(this, id, sku, name, category, price, stock, sold, supplier, lastAudited);
    this.warehouse = warehouse;
    this.aisle = aisle;
}
// Set up prototype chain: Item inherits from Product
Item.prototype = Object.create(Product.prototype);
Item.prototype.constructor = Item;
// Item-specific method
Item.prototype.getLocation = function () {
    return `${this.warehouse} — Aisle ${this.aisle}`;
};
// ─── Factory Function ───────────────────────────────────────
// Create a Product instance from a plain IProduct object
export function createProductFromData(data) {
    return new Product(data.id, data.sku, data.name, data.category, data.price, data.stock, data.sold, data.supplier, data.lastAudited);
}
//# sourceMappingURL=models.js.map