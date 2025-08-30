import { Router } from "express";
import { getUploadUrl } from "../controllers/common.controller.js";

const router = Router();

router.post("/upload-file", getUploadUrl);

export default router;
