import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const userSchema = new mongoose.Schema({
    role: { type: String, default: 'USER' },
    email: String,
    firstName: String,
    password: { type: String, select: true }
}, { strict: false });
const User = mongoose.model('User', userSchema);

async function run() {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    
    // Check for a normal user
    let user = await User.findOne({ role: 'USER' });
    if (!user) {
        console.log("No normal USER found. Creating a new normal user...");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('user123', salt);
        
        user = new User({
            role: 'USER',
            email: 'user@example.com',
            firstName: 'Passenger',
            password: hashedPassword
        });
        await user.save();
        console.log("Created new normal user: user@example.com / user123");
    } else {
        console.log("Found existing normal user:", user.email);
        console.log("Resetting password to 'user123'...");
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash('user123', salt);
        await user.save();
        console.log("Password reset successfully. You can login with: " + user.email + " / user123");
    }
    process.exit(0);
}
run().catch(console.error);
