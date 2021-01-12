import mongoose, { Document } from 'mongoose';
import { productsInfoType, productSchema } from './productModel';

export interface userSchemaType extends Document {
    name: string,
    email: string,
    password: string,
    isAdmin: boolean,
    isSeller: boolean,
    cart: cartItemsType[],
}

export interface cartItemsType {
    name: string,
    image: string,
    price: number,
    countInStock: number,
    product: string,
    qty: number,
}

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
    isSeller: { type: Boolean, default: false, required: true },
    cart: [{ type: Object }]
}, {
    timestamps: true
});

const User = mongoose.model("hanbokUser", userSchema);
export default User;