import { Router } from "express";
import {
  addEquipment,
  getListings,
  getVendorDashboard,
  getVendorProfile,
  loginwithpassword,
  registerVendor,
} from "../controllers/vendor.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerVendor);
router.post("/loginwithpassword", loginwithpassword);

router.post("/add-equipment", authenticate, addEquipment);

router.get("/dashboard", authenticate, getVendorDashboard);

router.get("/profile", authenticate, getVendorProfile);

router.get("/listings", authenticate, getListings);

export default router;
