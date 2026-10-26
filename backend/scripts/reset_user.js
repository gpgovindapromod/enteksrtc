import 'dotenv/config';
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import User from '../database/models/User.js';

async function run() {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    
    const targetEmail = (process.argv[2] || process.env.RESET_USER_EMAIL || '').toLowerCase().trim();
    const newPassword = process.argv[3] || process.env.RESET_USER_PASSWORD || 'user123';

    if (!targetEmail) {
        console.error('Usage: node reset_user.js <email> [newPassword]');
        process.exit(1);
    }

    let user = await User.findOne({ email: targetEmail });
    if (!user) {
        user = await User.findOne({ role: 'USER' });
    }

    if (!user) {
        console.log(`No user found. Creating new user: ${targetEmail}...`);
        user = new User({
            role: 'USER',
            email: targetEmail,
            firstName: 'Passenger',
            password: newPassword,
            isVerified: true,
            isActive: true
        });
        await user.save();
        console.log(`Created new user: ${targetEmail} / ${newPassword}`);
    } else {
        console.log(`Found user: ${user.email} (${user.firstName} ${user.lastName || ''})`);
        console.log(`Resetting password to '${newPassword}'...`);
        user.password = newPassword;
        user.isActive = true;
        await user.save();
        console.log(`Password reset successfully. You can login with: ${user.email} / ${newPassword}`);
    }

    // Verify password comparison works
    const testUser = await User.findOne({ email: user.email }).select('+password');
    const isMatch = await testUser.comparePassword(newPassword);
    console.log(`Verification check: comparePassword('${newPassword}') -> ${isMatch ? 'PASSED' : 'FAILED'}`);

    await mongoose.disconnect();
    process.exit(0);
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});

