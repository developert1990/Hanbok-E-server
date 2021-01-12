
import mongoose, { Document } from 'mongoose';


export interface productsInfoType extends Document {
    name: string;
    image: string;
    brand: string;
    category: string;
    description: string;
    price: number;
    countInStock: number;
    rating: number;
    numReviews: number;
    reviews: reviewType[];
}

export interface reviewType {
    name: string;
    comment: string;
    rating: number;
}

const reviewSchema = new mongoose.Schema({
    //name: { type: String, required: true, unique: true }, 이렇게 해주니까 duplicate key 에러가 reviews.name 에서 발생해서 sparse:true 를 해주면 null 은 제외하고 unique가 적용됨 참고(https://stackoverflow.com/questions/24430220/e11000-duplicate-key-error-index-in-mongodb-mongoose)
    name: { type: String, required: true, unique: true, sparse: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
}, {
    timestamps: true,
});

export const productSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, sparse: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    countInStock: { type: Number, required: true },
    rating: { type: Number, required: true },
    numReviews: { type: Number, required: true },
    reviews: [reviewSchema]
}, {
    timestamps: true,
});

export const Product = mongoose.model("Product", productSchema);
export const Review = mongoose.model("Review", reviewSchema);
// export default Product;