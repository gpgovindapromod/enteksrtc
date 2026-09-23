import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
import Depot from "./models/Depot.js";
import User from "./models/User.js";

dotenv.config({ path: "../.env" });

const seedMockDepots = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for Depot seeding");

        const depotsToSeed = [
            {
                depotCode: "TVM01",
                depotName: "Trivandrum Central Depot",
                address: "Thampanoor",
                city: "Trivandrum",
                district: "Thiruvananthapuram",
                state: "Kerala",
                pincode: "695001",
                phone: "04712323886",
                email: "tvm.depot@example.com",
                totalPlatforms: 15,
                isActive: true
            },
            {
                depotCode: "EKM01",
                depotName: "Ernakulam KSRTC Stand",
                address: "Rajaji Road",
                city: "Ernakulam",
                district: "Ernakulam",
                state: "Kerala",
                pincode: "682035",
                phone: "04842372033",
                email: "ekm.depot@example.com",
                totalPlatforms: 12,
                isActive: true
            }
        ];

        for (const d of depotsToSeed) {
            let depot = await Depot.findOne({ depotCode: d.depotCode });
            if (!depot) {
                depot = new Depot(d);
                await depot.save();
                console.log(`Created depot: ${d.depotCode}`);
            } else {
                console.log(`Depot already exists: ${d.depotCode}`);
            }
        }

        // Link users
        const tvmDepot = await Depot.findOne({ depotCode: "TVM01" });
        const ekmDepot = await Depot.findOne({ depotCode: "EKM01" });

        if (tvmDepot) {
            const res1 = await User.updateOne({ email: "tvm.master@example.com" }, { $set: { depotId: tvmDepot._id } });
            console.log("Linked TVM master to depot.", res1.modifiedCount ? "Updated" : "No change");
        }
        if (ekmDepot) {
            const res2 = await User.updateOne({ email: "ekm.master@example.com" }, { $set: { depotId: ekmDepot._id } });
            console.log("Linked EKM master to depot.", res2.modifiedCount ? "Updated" : "No change");
        }

        console.log("Depot seeding completed!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding mock depots:", error);
        process.exit(1);
    }
};

seedMockDepots();
