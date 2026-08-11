import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        const mongoDbName = process.env.MONGO_DB_NAME;

        if (!mongoUri) {
            throw new Error("MongoDB connection URI is missing. Set MONGO_URI or MONGODB_URI in backend/.env");
        }

        const conn = await mongoose.connect(mongoUri, mongoDbName ? { dbName: mongoDbName } : {});

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

export default connectDB;