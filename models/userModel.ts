import mongoose, { Document } from 'mongoose';

export interface UserSchemaType extends Document {
    name: string;
    email: string;
    password: string;
    isAdmin?: boolean;
    isSeller?: boolean;
}

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
    isSeller: { type: Boolean, default: false, required: true },
}, {
    timestamps: true
});

const User = mongoose.model<UserSchemaType>("hanbokUser", userSchema);
export default User;