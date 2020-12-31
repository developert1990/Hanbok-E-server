import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    orderItems: [{
        name: { type: String, required: true, },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },// MongoDB에 만들어준 스키마인 'Product' 의 objectId를 사용하기 위해서 이렇게 해줄수 있다.
    }],
    shippingAddress: {
        fullName: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String, required: true },
        lat: Number,
        lng: Number,
    },
    paymentMethod: { type: String, required: true },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'hanbokUser', required: true }, // MongoDB에 만들어준 스키마인 'User' 의 objectId를 사용하기 위해서 이렇게 해줄수 있다. _id를 통해서 유저의 아이디를 찾아서 새로운 넘버를 부여한다.
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

export default Order;