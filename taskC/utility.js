export function getUniqueCategories(cart) {
    const categories = cart.map(item => item.category);
    return [...categories];
}
export function groupByCategory(cart) {
    const groupedmap = new Map();
    for (const item of cart) {
        if (!groupedmap.has(item.category)) {
            groupedmap.set(item.category, []);
        }
        groupedmap.get(item.category).push(item);
    }
            return groupedmap;
        }
        

