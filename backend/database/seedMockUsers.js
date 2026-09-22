import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config({ path: "../.env" });

const seedMockUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const mockUsers = [
            {
                firstName: "Admin",
                lastName: "User",
                email: "admin@example.com",
                phone: "1234567890",
                password: "password123",
                role: "ADMIN",
                isVerified: true,
                isActive: true
            },
            {
                firstName: "John",
                lastName: "Driver",
                email: "driver@example.com",
                phone: "1234567891",
                password: "password123",
                role: "DRIVER",
                isVerified: true,
                isActive: true,
                employeeId: "DRV-1001"
            },
            {
                firstName: "Mike",
                lastName: "Conductor",
                email: "conductor@example.com",
                phone: "1234567892",
                password: "password123",
                role: "CONDUCTOR",
                isVerified: true,
                isActive: true,
                employeeId: "CON-2001"
            },
            {
                firstName: "Sarah",
                lastName: "Staff",
                email: "staff@example.com",
                phone: "1234567893",
                password: "password123",
                role: "STAFF",
                isVerified: true,
                isActive: true,
                employeeId: "STF-3001"
            }
        ];

        for (const userData of mockUsers) {
            const existingUser = await User.findOne({ email: userData.email });
            if (!existingUser) {
                const user = new User(userData);
                await user.save();
                console.log(`Created ${userData.role} user: ${userData.email}`);
            } else {
                console.log(`${userData.role} user already exists: ${userData.email}`);
            }
        }

        console.log("Mock users seeding completed!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding mock users:", error);
        process.exit(1);
    }
};

seedMockUsers();
