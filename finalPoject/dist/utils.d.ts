import { IProduct, IInventoryStats } from "./types.js";
export declare function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void;
export declare function throttle<T extends (...args: any[]) => void>(fn: T, limit: number): (...args: Parameters<T>) => void;
export declare function deduplicateBySku(products: IProduct[]): IProduct[];
export declare function getUniqueCategories(products: IProduct[]): string[];
export declare function computeStats(products: IProduct[]): IInventoryStats;
export declare function exportToJSON(data: unknown, filename?: string): void;
