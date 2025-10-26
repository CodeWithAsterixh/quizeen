import mongoose from "mongoose";


const URI = process.env.MONGODB_URI;

export const connectToDatabase = async () => {
        if (!URI) {
            // In test environments we may use an in-memory MongoDB and connect directly via mongoose.
            // If no MONGODB_URI is provided, skip connecting here.
            // This keeps connectToDatabase safe to call in serverless handlers while tests manage their own connection.
            if (process.env.NODE_ENV !== 'test') {
                console.warn('MONGODB_URI not provided; connectToDatabase will be a no-op');
            }
            return;
        }

    try {
        await mongoose.connect(URI);
    } catch (error) {
        console.log(error);
        throw error;
    }
};