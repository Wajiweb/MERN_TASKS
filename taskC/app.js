import {Product} from './product.js';
const module = await import('./cart.js');
const module2 = await import('./utility.js');

const laptop = new Product(1, 'Laptop', 50000, 'Electronics');
const phone = new Product(2, 'Phone', 20000, 'Electronics');
const desk = new Product(3, 'Desk', 15000, 'Furniture');

let cart = [];
cart = module.addtocart(cart, laptop);
cart = module.addtocart(cart, phone);
cart = module.addtocart(cart, desk);
cart = module.removefromcart(cart, 2);

const backupCart = module.deepcloneCart(cart);
backupCart[0].price = 5000;
console.log(`Original laptop price:RS ${cart[0].price}`);

console.log("catagories:", module2.getUniqueCategories(cart));
console.log("grouped by catagories:", module2.groupByCategory(cart));

const discountedPrice = Product.applyDiscount(laptop.price, 0.1);
console.log(`Discounted price of laptop: RS ${discountedPrice}`);
console.log(module.summary(cart));
