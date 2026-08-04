import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";

import connectDB from "./database/db.js";

const PORT = process.env.PORT || 5011;

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});