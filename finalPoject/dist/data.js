// ============================================================
// data.ts — Data Module: Fetch Mock API Data
//           Demonstrates async/await, try-catch, modules
// ============================================================
import { isProduct } from "./types.js";
// ─── Fetch Products from Mock JSON API ──────────────────────
// Simulates fetching from a REST API endpoint
export async function fetchProducts(url = "./data/products.json") {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
        }
        const rawData = await response.json();
        // Validate that we received an array
        if (!Array.isArray(rawData)) {
            throw new Error("Invalid data format: expected an array of products");
        }
        // Validate each item using our custom type guard
        const validProducts = [];
        const invalidItems = [];
        rawData.forEach((item, index) => {
            if (isProduct(item)) {
                validProducts.push(item);
            }
            else {
                invalidItems.push(index);
            }
        });
        if (invalidItems.length > 0) {
            console.warn(`⚠️ Skipped ${invalidItems.length} invalid product entries at indices: [${invalidItems.join(", ")}]`);
        }
        console.log(`✅ Loaded ${validProducts.length} valid products from ${url}`);
        return validProducts;
    }
    catch (error) {
        // Robust error handling with try-catch
        if (error instanceof TypeError) {
            console.error("❌ Network error: Could not reach the server.", error.message);
        }
        else if (error instanceof SyntaxError) {
            console.error("❌ Parse error: Invalid JSON response.", error.message);
        }
        else if (error instanceof Error) {
            console.error("❌ Fetch error:", error.message);
        }
        // Return empty array as fallback so the app doesn't crash
        return [];
    }
}
//# sourceMappingURL=data.js.map