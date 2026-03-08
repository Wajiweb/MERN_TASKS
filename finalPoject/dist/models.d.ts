import { IProduct } from "./types.js";
export declare function Product(this: any, id: number, sku: string, name: string, category: string, price: number, stock: number, sold: number, supplier: string, lastAudited: string): void;
export declare function Item(this: any, id: number, sku: string, name: string, category: string, price: number, stock: number, sold: number, supplier: string, lastAudited: string, warehouse: string, aisle: string): void;
export declare namespace Item {
    var prototype: any;
}
export declare function createProductFromData(data: IProduct): any;
