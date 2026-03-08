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
    getCounts(): {
        audited: number;
        flagged: number;
        skipped: number;
    };
    reset(): void;
}
export declare abstract class AuditBase {
    protected results: IAuditResult[];
    protected readonly auditDate: string;
    constructor();
    abstract runAudit(products: IProduct[]): IAuditResult[];
    abstract generateReport(): string;
    getResults(): IAuditResult[];
    getFlaggedCount(): number;
}
export declare function isProduct(value: unknown): value is IProduct;
export declare function isValidStock(value: unknown): value is number;
export declare function isValidPrice(value: unknown): value is number;
export declare function getStockStatus(stock: number): StockStatus;
