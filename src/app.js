import express from "express";
import cors from "cors";
import customerRoutes from "./routes/customer.routes.js";
import vendorRoutes from "./routes/vendor.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/customer", customerRoutes);
app.use("/vendor", vendorRoutes);

export default app;
