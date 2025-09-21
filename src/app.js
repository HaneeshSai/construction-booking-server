import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import customerRoutes from "./routes/customer.routes.js";
import vendorRoutes from "./routes/vendor.routes.js";
import commonRoutes from "./routes/common.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Test API
app.get("/health", (req, res) => {
  res.json({ status: "success", message: "Server is running 🚀" });
});

// Routes
app.use("/customer", customerRoutes);
app.use("/vendor", vendorRoutes);
app.use("/common", commonRoutes);
app.use("/api/admin", adminRoutes);

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin-portal.html"));
});

export default app;
