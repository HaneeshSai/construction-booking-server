import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Load environment variables before initializing Prisma
dotenv.config();

const prisma = new PrismaClient();

export default prisma;
