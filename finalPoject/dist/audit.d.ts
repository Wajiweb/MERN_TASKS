import { IProduct, IAuditResult, IAuditCounter, AuditBase } from "./types.js";
export declare function createAuditCounter(): IAuditCounter;
export declare class AuditSession extends AuditBase {
    private counter;
    private lowStockThreshold;
    constructor(lowStockThreshold?: number);
    runAudit(products: IProduct[]): IAuditResult[];
    generateReport(): string;
    getCounter(): IAuditCounter;
}
