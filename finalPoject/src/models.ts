import { IProduct, StockStatus, getStockStatus } from "./types.js";
export function Product(
    this: any,
    id: number,
    sku: string,
    name: string,
    category: string,
    price: number,
    stock: number,
    sold: number,
    supplier: string,
    lastAudited: string
) {
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

Product.prototype.getStockStatus = function (): StockStatus {
    return getStockStatus(this.stock);
};

Product.prototype.applyDiscount = function (percent: number): void {
    if (percent < 0 || percent > 100) {
        throw new Error("Discount must be between 0 and 100");
    }
    this.price = Math.round(this.price * (1 - percent / 100) * 100) / 100;
};
Product.prototype.getRevenue = function (): number {
    return Math.round(this.price * this.sold * 100) / 100;
};
Product.prototype.toJSON = function (): IProduct {
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
Product.prototype.toCard = function (): string {
    const status = this.getStockStatus();
    const statusClass =
        status === "out-of-stock"
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
          <span class="btn-icon">Search</span> Audit
        </button>
        <button class="btn btn-edit" data-action="edit" data-id="${this.id}">
          <span class="btn-icon">Edit</span> Edit
        </button>
        <label class="bulk-select-label">
          <input type="checkbox" class="bulk-checkbox" data-id="${this.id}" />
          Select
        </label>
      </div>
    </div>
  `;
};
export function Item(
    this: any,
    id: number,
    sku: string,
    name: string,
    category: string,
    price: number,
    stock: number,
    sold: number,
    supplier: string,
    lastAudited: string,
    warehouse: string,
    aisle: string
) {
    Product.call(this, id, sku, name, category, price, stock, sold, supplier, lastAudited);
    this.warehouse = warehouse;
    this.aisle = aisle;
}
Item.prototype = Object.create(Product.prototype);
Item.prototype.constructor = Item;
Item.prototype.getLocation = function (): string {
    return `${this.warehouse} — Aisle ${this.aisle}`;
};
export function createProductFromData(data: IProduct): any {
    return new (Product as any)(
        data.id,
        data.sku,
        data.name,
        data.category,
        data.price,
        data.stock,
        data.sold,
        data.supplier,
        data.lastAudited
    );
}
