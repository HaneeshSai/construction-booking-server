import { Router } from "express";
import {
  getDashboard,
  getMachineById,
  getMachinesByCategory,
  loginWithPassword,
  registerCustomer,
} from "../controllers/customer.controller.js";

const router = Router();

router.post("/register", registerCustomer);

router.post("/loginwithpassword", loginWithPassword);

router.get("/getdashboard", getDashboard);

router.get("/get-machines-by-category/:category", getMachinesByCategory);

router.get("/get-machine-by-id/:id", getMachineById);

export default router;
