import { IProduct, IInventoryStats } from "./types.js";
export function debounce<T extends (...args: any[]) => void>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return function (this: any, ...args: Parameters<T>): void {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn.apply(this, args);
            timeoutId = null;
        }, delay);
    };
}
export function throttle<T extends (...args: any[]) => void>(
    fn: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle = false;

    return function (this: any, ...args: Parameters<T>): void {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}
export function deduplicateBySku(products: IProduct[]): IProduct[] {
    const skuMap: Map<string, IProduct> = new Map();

    for (const product of products) {
        if (!skuMap.has(product.sku)) {
            skuMap.set(product.sku, product);
        }
    }

    console.log(
        ` Deduplication: ${products.length} → ${skuMap.size} unique products (removed ${products.length - skuMap.size} duplicates)`
    );

    return Array.from(skuMap.values());
}
export function getUniqueCategories(products: IProduct[]): string[] {
    const categorySet: Set<string> = new Set(products.map((p) => p.category));
    return Array.from(categorySet).sort();
}
export function computeStats(products: IProduct[]): IInventoryStats {
    const { totalValue, totalSold } = products.reduce(
        (acc, product) => {
            acc.totalValue += product.price * product.stock;
            acc.totalSold += product.sold;
            return acc;
        },
        { totalValue: 0, totalSold: 0 }
    );

    const averagePrice =
        products.reduce((sum, p) => sum + p.price, 0) / (products.length || 1);
    const topSellers = [...products].sort((a, b) => b.sold - a.sold).slice(0, 5);
    const lowStockAlerts = products.filter((p) => p.stock > 0 && p.stock <= 10);
    const outOfStock = products.filter((p) => p.stock === 0);
    const categoryBreakdown: Record<string, number> = products.reduce(
        (acc: Record<string, number>, p) => {
            acc[p.category] = (acc[p.category] || 0) + 1;
            return acc;
        },
        {}
    );

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
export function exportToJSON(data: unknown, filename: string = "inventory-export.json"): void {
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
        console.log(`Exported data to ${filename}`);
    } catch (error) {
        console.error("Export failed:", error);
    }
}
