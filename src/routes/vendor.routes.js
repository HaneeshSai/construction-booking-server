import { Router } from "express";
import {
  loginwithpassword,
  registerVendor,
} from "../controllers/vendor.controller.js";

const router = Router();

router.post("/register", registerVendor);
router.post("/loginwithpassword", loginwithpassword);

export default router;
