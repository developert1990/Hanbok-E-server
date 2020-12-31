import { Document } from 'mongoose';
import { Request } from 'express';

export interface userFromDB extends Document {
    _id: string;
    password: string;
    name: string;
    email: string;
    isAdmin: boolean;
    isSeller: boolean;
    token: () => string;
}


// req에 express extends 한것
export interface CustomRequestExtendsUser extends Request {
    user?: string;
    name?: string;
}


export interface OrderType extends Document {
    orderItems: cartItemType[];
    shippingAddress: saveShippingAddressDataType;
    paymentMethod: string;
    itemsPrice: number;
    shippingPrice: number;
    taxPrice: number;
    totalPrice: number;
    isDelivered: boolean;
    createdAt: string;
    _id?: string;
    deliveredAt: number;
    isPaid: boolean;
    paidAt?: number;
    paymentResult: PaymentResultType;
}


export interface PaymentResultType {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
}