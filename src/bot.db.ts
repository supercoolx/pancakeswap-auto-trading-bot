import mongoose from "mongoose";

const connectDB = () => {
    return mongoose.connect(process.env.MONGO_URL!).then(() => console.log('DB connected.'));
}

export default connectDB;