// ============================================================
// app.ts — Entry Point: Wires everything together
//          Demonstrates module imports, async init pipeline
// ============================================================
import { fetchProducts } from "./data.js";
import { deduplicateBySku } from "./utils.js";
import { initDOM } from "./dom.js";
// ─── Application Bootstrap ─────────────────────────────────
async function main() {
    console.log("🚀 E-Commerce Inventory Auditor — Starting...");
    // Step 1: Fetch products from mock API (JSON file)
    const rawProducts = await fetchProducts("./data/products.json");
    if (rawProducts.length === 0) {
        document.getElementById("product-grid").innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No Products Found</h3>
        <p>Could not load product data. Please check the data source.</p>
      </div>
    `;
        return;
    }
    // Step 2: Deduplicate using Map (removes duplicate SKUs)
    const uniqueProducts = deduplicateBySku(rawProducts);
    // Step 3: Initialize the DOM with clean data
    initDOM(uniqueProducts);
    console.log("✅ Application initialized successfully!");
}
// ─── Run on DOM ready ───────────────────────────────────────
document.addEventListener("DOMContentLoaded", main);
//# sourceMappingURL=app.js.map