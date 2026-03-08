
import { Product,Category } from "./product.js";

export function getUniqueCategories<T extends Product>(cart:T[]) {
    const categories = cart.map(item => item.category);
    return [...new Set(categories)];
}
export function groupByCategory(
  cart: Product[]
): Record<Category, Product[]> {
  const grouped: Record<Category, Product[]> = {
    Electronics: [],
    Furniture: []
  };

    for (const item of cart) {
       
        grouped[item.category].push(item);
    }
    return grouped;
}

export function deepcloneCart(cart:Product[]):Product[]  {
    return JSON.parse(JSON.stringify(cart));
}

