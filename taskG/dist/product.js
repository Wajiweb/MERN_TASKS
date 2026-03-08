export class Product {
    constructor(id, name, price, category) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.category = category;
    }
    static applyDiscount(price, discountpercentage) {
        return price - (price * discountpercentage);
    }
}
