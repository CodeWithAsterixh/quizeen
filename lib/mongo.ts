import mongoose from "mongoose";


const URI = process.env.MONGODB_URI;

if (!URI) throw new Error("please provide the MONGODB_URI");
export const connectToDatabase = async ()=>{
    try {
        await mongoose.connect(URI)
    } catch (error) {
        console.log(error)
    }
}