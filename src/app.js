import express from "express";
import cors from "cors";
import customerRoutes from "./routes/customer.routes.js";
import vendorRoutes from "./routes/vendor.routes.js";
import commonRoutes from "./routes/common.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Test API
app.get("/health", (req, res) => {
  res.json({ status: "success", message: "Server is running 🚀" });
});

// Routes
app.use("/customer", customerRoutes);
app.use("/vendor", vendorRoutes);
app.use("/common", commonRoutes);

export default app;
