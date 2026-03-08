import { fetchProducts } from "./data.js";
import { deduplicateBySku } from "./utils.js";
import { initDOM } from "./dom.js";

async function main(): Promise<void> {
    console.log("E-Commerce Inventory Auditor");
    const rawProducts = await fetchProducts("./data/products.json");

    if (rawProducts.length === 0) {
        document.getElementById("product-grid")!.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">Empty</div>
        <h3>No Products Found</h3>
        <p>Could not load product data. Please check the data source.</p>
      </div>
    `;
        return;
    }
    const uniqueProducts = deduplicateBySku(rawProducts);
    initDOM(uniqueProducts);

    console.log("Application initialized successfully!");
}
document.addEventListener("DOMContentLoaded", main);
