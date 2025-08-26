import { Router } from "express";
import {
  getDashboard,
  loginWithPassword,
  registerCustomer,
} from "../controllers/customer.controller.js";

const router = Router();

router.post("/register", registerCustomer);

router.post("/loginwithpassword", loginWithPassword);

router.get("/getdashboard", getDashboard);

export default router;
