import { Product } from "./product.js";
export type Readonly<T>={
    readonly [P in keyof T]:T[P];
}

export function addtocart(cart:Product[], product:Product):Product[] {
    return[...cart,{...product}];
}
export function removefromcart(cart:Product[], productId:number):Product[] {
    return cart.filter(item => item.id !== productId);
}
export function deepcloneCart(cart:Product[]):Product[]  {
    return structuredClone(cart);
}
export function updateProduct(
    product:Product,
    updates:Partial<Pick<Product, 'name' | 'price'>>
):Product{
    return{ ...product,...updates};

}

export function summary(cart:Product[]):string {  
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    return `
    Total Items: ${cart.length}
    Total Price: RS${total}
    data:
    ${JSON.stringify(CaretPosition,null,2)}
    `;
}

