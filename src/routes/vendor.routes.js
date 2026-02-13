import { Router } from "express";
import {
  addEquipment,
  applyToJob,
  getJobDetails,
  getListings,
  getMachineById,
  getVendorDashboard,
  getVendorProfile,
  loginwithpassword,
  loginWithGoogle,
  registerVendor,
} from "../controllers/vendor.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerVendor);
router.post("/loginwithpassword", loginwithpassword);
router.post("/loginwithgoogle", loginWithGoogle);

router.post("/add-equipment", authenticate, addEquipment);

router.get("/dashboard", authenticate, getVendorDashboard);

router.get("/profile", authenticate, getVendorProfile);

router.get("/listings", authenticate, getListings);

router.get("/machine/:id", getMachineById);

router.get("/job-details/:jobId", authenticate, getJobDetails);

router.post("/apply-to-job", authenticate, applyToJob);

export default router;
