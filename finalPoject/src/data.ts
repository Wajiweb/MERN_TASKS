import { IProduct, isProduct } from "./types.js";
export async function fetchProducts(url: string = "./data/products.json"): Promise<IProduct[]> {
    try {
        const response: Response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
        }

        const rawData: unknown = await response.json();
        if (!Array.isArray(rawData)) {
            throw new Error("Invalid data format: expected an array of products");
        }
        const validProducts: IProduct[] = [];
        const invalidItems: number[] = [];

        rawData.forEach((item: unknown, index: number) => {
            if (isProduct(item)) {
                validProducts.push(item);
            } else {
                invalidItems.push(index);
            }
        });

        if (invalidItems.length > 0) {
            console.warn(
                `Skipped ${invalidItems.length} invalid product entries at indices: [${invalidItems.join(", ")}]`
            );
        }

        console.log(`Loaded ${validProducts.length} valid products from ${url}`);
        return validProducts;
    } catch (error) {
        if (error instanceof TypeError) {
            console.error("Network error: Could not reach the server.", error.message);
        } else if (error instanceof SyntaxError) {
            console.error("Parse error: Invalid JSON response.", error.message);
        } else if (error instanceof Error) {
            console.error("Fetch error:", error.message);
        }

        return [];
    }
}
