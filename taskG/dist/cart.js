export function addtocart(cart, product) {
    return [...cart, { ...product }];
}
export function removefromcart(cart, productId) {
    return cart.filter(item => item.id !== productId);
}
export function deepcloneCart(cart) {
    return structuredClone(cart);
}
export function updateProduct(product, updates) {
    return { ...product, ...updates };
}
export function summary(cart) {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    return `
    Total Items: ${cart.length}
    Total Price: RS${total}
    data:
    ${JSON.stringify(CaretPosition, null, 2)}
    `;
}
