export interface IProduct {
    id: number;
    sku: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    sold: number;
    supplier: string;
    lastAudited: string;
}
export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";
export interface IAuditResult {
    productId: number;
    sku: string;
    name: string;
    status: StockStatus;
    flagged: boolean;
    reason: string;
    auditedAt: string;
}
export interface IInventoryStats {
    totalProducts: number;
    totalValue: number;
    totalSold: number;
    averagePrice: number;
    topSellers: IProduct[];
    lowStockAlerts: IProduct[];
    outOfStock: IProduct[];
    categoryBreakdown: Record<string, number>;
}
export interface GenericTable<T> {
    columns: Array<keyof T>;
    data: T[];
    renderRow(item: T): string;
    renderHeader(): string;
}

export type ProductUpdate = Partial<Pick<IProduct, "price" | "stock">>;
export type ProductSummary = Pick<IProduct, "id" | "sku" | "name" | "stock" | "price">;
export type SupplierMap = Record<string, IProduct[]>;
export interface IAuditCounter {
    increment(type: "audited" | "flagged" | "skipped"): void;
    getCount(type: "audited" | "flagged" | "skipped"): number;
    getCounts(): { audited: number; flagged: number; skipped: number };
    reset(): void;
}
export abstract class AuditBase {
    protected results: IAuditResult[] = [];
    protected readonly auditDate: string;

    constructor() {
        this.auditDate = new Date().toISOString().split("T")[0];
    }
    abstract runAudit(products: IProduct[]): IAuditResult[];
    abstract generateReport(): string;
    getResults(): IAuditResult[] {
        return [...this.results];
    }

    getFlaggedCount(): number {
        return this.results.filter((r) => r.flagged).length;
    }
}
export function isProduct(value: unknown): value is IProduct {
    if (typeof value !== "object" || value === null) return false;
    const obj = value as Record<string, unknown>;
    return (
        typeof obj.id === "number" &&
        typeof obj.sku === "string" &&
        typeof obj.name === "string" &&
        typeof obj.category === "string" &&
        typeof obj.price === "number" &&
        typeof obj.stock === "number" &&
        typeof obj.sold === "number" &&
        typeof obj.supplier === "string" &&
        typeof obj.lastAudited === "string"
    );
}

export function isValidStock(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function isValidPrice(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value) && value > 0;
}
export function getStockStatus(stock: number): StockStatus {
    if (stock === 0) return "out-of-stock";
    if (stock <= 10) return "low-stock";
    return "in-stock";
}
