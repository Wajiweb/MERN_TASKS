export function addtocart(cart, product) {
    return[...cart,{...product}];
}
export function removefromcart(cart, productId) {
    return cart.filter(item => item.id !== productId);
}
export function deepcloneCart(cart) {
    return structuredClone(cart);
}
export function summary(cart) { 
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const jsonString = JSON.stringify(cart, null, 2);

    return `
    Total Items: ${cart.length}
    Total Price: RS${total}
    data:
    ${jsonString}
    
    `;
}

