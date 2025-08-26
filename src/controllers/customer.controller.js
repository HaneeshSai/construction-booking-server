import prisma from "../utils/prismaClient.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";
const salt = parseInt(process.env.BCRYPT_SALT) || 10;

export const registerCustomer = async (req, res) => {
  try {
    const { email, password, phone, fullName } = req.body;

    const existingUser = await prisma.customer.findFirst({
      where: {
        OR: [{ email: email }, { phone: phone }],
      },
    });

    if (existingUser)
      return res.status(400).json({
        success: false,
        message: "User with this details already exists",
      });

    const hashedPass = await bcrypt.hash(password, salt);
    const user = await prisma.customer.create({
      data: {
        email,
        password: hashedPass,
        fullName,
        phone,
      },
    });

    const token = generateToken({ id: user.id });

    return res.status(200).json({
      success: true,
      message: "Account Created Successfullly",
      token,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const loginWithPassword = async (req, res) => {
  try {
    const { email, password, phone } = req.body;

    const user = await prisma.customer.findFirst({
      where: {
        OR: [{ email: email }, { phone: phone }],
      },
    });

    if (!user) {
      console.log("user not found");
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      console.log("incorrect password");
      return res.status(500).json({
        success: false,
        message: "Incorrect Password",
      });
    }

    const token = generateToken({ id: user.id });

    return res
      .status(200)
      .json({ success: false, message: "Login Successfull", token, user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const topRentals = await prisma.equipment.findMany({
      where: {
        status: "AVAILABLE",
      },
      select: {
        machineType: true,
        machineModel: true,
        machineName: true,
        status: true,
        id: true,
        frontImageFile: true,
      },
      take: 5,
    });

    return res.status(200).json({ success: true, topRentals });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
