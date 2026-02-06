import { Router } from "express";
import {
  acceptApplication,
  addAddress,
  createJob,
  deleteAddress,
  getAddresses,
  getAllBookings,
  getBookingDetailsWithVendor,
  getDashboard,
  getMachineById,
  getMachinesByCategory,
  getProfile,
  loginWithPassword,
  registerCustomer,
  updateAddress,
} from "../controllers/customer.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerCustomer);

router.post("/loginwithpassword", loginWithPassword);

router.get("/getdashboard", getDashboard);

router.get("/get-machines-by-category/:category", getMachinesByCategory);

router.get("/get-machine-by-id/:id", getMachineById);

router.get("/addresses", authenticate, getAddresses);

router.post("/address", authenticate, addAddress);

router.put("/address/:addressId", authenticate, updateAddress);

router.delete("/address/:addressId", authenticate, deleteAddress);

router.post("/job", authenticate, createJob);

router.get("/bookings", authenticate, getAllBookings);

router.get(
  "/booking-detail/:bookingId/:vendorId",
  authenticate,
  getBookingDetailsWithVendor
);

router.post("/accept-application",authenticate, acceptApplication);

router.get("/profile", authenticate, getProfile);

export default router;
