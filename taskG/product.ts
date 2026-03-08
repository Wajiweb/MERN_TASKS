
export type Category = "Electronics"|"Furniture"
export class Product {
      id :number;
       name : string;
      price: number;
    category: Category;
        

    constructor(id:number,name:string, price:number, category:Category) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.category = category;
        
    }

static applyDiscount(price:number, discountpercentage:number):number{
    return price -(price * discountpercentage);
}
}
  