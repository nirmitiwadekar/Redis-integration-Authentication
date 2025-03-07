const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db"); 
const categoryRoutes = require("./src/routes/category-routes"); 
const serviceRoutes = require("./src/routes/service-routes"); 

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

app.use("/api/categories", categoryRoutes);
app.use("/api/services", serviceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
