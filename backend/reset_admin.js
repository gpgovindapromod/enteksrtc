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
    
    // Check for admin
    let admin = await User.findOne({ role: 'ADMIN' });
    if (!admin) {
        console.log("No ADMIN found. Creating a new admin user...");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        admin = new User({
            role: 'ADMIN',
            email: 'admin@enteksrtc.com',
            firstName: 'Admin',
            password: hashedPassword
        });
        await admin.save();
        console.log("Created new ADMIN user: admin@enteksrtc.com / admin123");
    } else {
        console.log("Found existing ADMIN user:", admin.email);
        console.log("If you do not know the password, we will reset it now to 'admin123'...");
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash('admin123', salt);
        await admin.save();
        console.log("Password reset successfully. You can login with: " + admin.email + " / admin123");
    }
    process.exit(0);
}
run().catch(console.error);
