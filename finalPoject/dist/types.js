// ============================================================
// types.ts — TypeScript Overlay: Interfaces, Generics, Utility
//            Types, Abstract Class, and Custom Type Guards
// ============================================================
// ─── Abstract Audit Base Class ──────────────────────────────
// Demonstrates abstract class with template method pattern
export class AuditBase {
    constructor() {
        this.results = [];
        this.auditDate = new Date().toISOString().split("T")[0];
    }
    // Concrete shared method
    getResults() {
        return [...this.results];
    }
    getFlaggedCount() {
        return this.results.filter((r) => r.flagged).length;
    }
}
// ─── Custom Type Guards ─────────────────────────────────────
// Runtime type-checking functions for data validation
export function isProduct(value) {
    if (typeof value !== "object" || value === null)
        return false;
    const obj = value;
    return (typeof obj.id === "number" &&
        typeof obj.sku === "string" &&
        typeof obj.name === "string" &&
        typeof obj.category === "string" &&
        typeof obj.price === "number" &&
        typeof obj.stock === "number" &&
        typeof obj.sold === "number" &&
        typeof obj.supplier === "string" &&
        typeof obj.lastAudited === "string");
}
export function isValidStock(value) {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
export function isValidPrice(value) {
    return typeof value === "number" && Number.isFinite(value) && value > 0;
}
// ─── Helper: Derive stock status from quantity ──────────────
export function getStockStatus(stock) {
    if (stock === 0)
        return "out-of-stock";
    if (stock <= 10)
        return "low-stock";
    return "in-stock";
}
//# sourceMappingURL=types.js.map