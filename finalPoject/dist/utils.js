// ============================================================
// utils.ts — Utility Module: Debounce, Throttle, Deduping,
//            Stats Computation, and JSON Export
//            Demonstrates ES6+ features: Map, Set, reduce
// ============================================================
// ─── Debounce ───────────────────────────────────────────────
// Delays function execution until after `delay` ms of inactivity
// Used for search input to avoid firing on every keystroke
export function debounce(fn, delay) {
    let timeoutId = null;
    return function (...args) {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn.apply(this, args);
            timeoutId = null;
        }, delay);
    };
}
// ─── Throttle ───────────────────────────────────────────────
// Ensures function executes at most once every `limit` ms
// Used for scroll events to prevent excessive handler calls
export function throttle(fn, limit) {
    let inThrottle = false;
    return function (...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}
// ─── Deduplicate by SKU using Map ───────────────────────────
// Map ensures uniqueness by key — later duplicates are ignored
export function deduplicateBySku(products) {
    const skuMap = new Map();
    for (const product of products) {
        if (!skuMap.has(product.sku)) {
            skuMap.set(product.sku, product);
        }
    }
    console.log(`🧹 Deduplication: ${products.length} → ${skuMap.size} unique products (removed ${products.length - skuMap.size} duplicates)`);
    return Array.from(skuMap.values());
}
// ─── Get Unique Categories using Set ────────────────────────
// Set automatically handles uniqueness
export function getUniqueCategories(products) {
    const categorySet = new Set(products.map((p) => p.category));
    return Array.from(categorySet).sort();
}
// ─── Compute Inventory Stats using reduce ───────────────────
// Demonstrates Array.reduce for aggregation and statistics
export function computeStats(products) {
    // Use reduce to compute total value and total sold
    const { totalValue, totalSold } = products.reduce((acc, product) => {
        acc.totalValue += product.price * product.stock;
        acc.totalSold += product.sold;
        return acc;
    }, { totalValue: 0, totalSold: 0 });
    // Average price via reduce
    const averagePrice = products.reduce((sum, p) => sum + p.price, 0) / (products.length || 1);
    // Top sellers: sorted by units sold, take top 5
    const topSellers = [...products].sort((a, b) => b.sold - a.sold).slice(0, 5);
    // Low stock alerts: stock > 0 but <= 10
    const lowStockAlerts = products.filter((p) => p.stock > 0 && p.stock <= 10);
    // Out of stock
    const outOfStock = products.filter((p) => p.stock === 0);
    // Category breakdown using reduce with Record
    const categoryBreakdown = products.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
    }, {});
    return {
        totalProducts: products.length,
        totalValue: Math.round(totalValue * 100) / 100,
        totalSold,
        averagePrice: Math.round(averagePrice * 100) / 100,
        topSellers,
        lowStockAlerts,
        outOfStock,
        categoryBreakdown,
    };
}
// ─── Export to JSON ─────────────────────────────────────────
// Downloads data as a .json file using Blob and URL APIs
export function exportToJSON(data, filename = "inventory-export.json") {
    try {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log(`📥 Exported data to ${filename}`);
    }
    catch (error) {
        console.error("❌ Export failed:", error);
    }
}
//# sourceMappingURL=utils.js.map