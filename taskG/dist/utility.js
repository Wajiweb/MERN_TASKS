export function getUniqueCategories(cart) {
    const categories = cart.map(item => item.category);
    return [...new Set(categories)];
}
export function groupByCategory(cart) {
    const grouped = {
        Electronics: [],
        Furniture: []
    };
    for (const item of cart) {
        grouped[item.category].push(item);
    }
    return grouped;
}
export function deepcloneCart(cart) {
    return JSON.parse(JSON.stringify(cart));
}
