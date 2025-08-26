import bcrypt from "bcryptjs";
import prisma from "../utils/prismaClient.js";
import { generateToken } from "../utils/jwt.js";
const salt = process.env.BCRYPT_SALT;

export const registerVendor = async (req, res) => {
  try {
    const {
      companyName,
      GST,
      PAN,
      email,
      coordinatorName,
      coordinatorNumber,
      password,
    } = req.body;

    const existingUser = await prisma.vendor.findFirst({
      where: {
        OR: [{ email: email }, { coordinatorNumber: coordinatorNumber }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with these details already exists",
      });
    }

    const hashedPass = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_SALT) || 10
    );

    const user = await prisma.vendor.create({
      data: {
        companyName,
        GST,
        PAN,
        email,
        coordinatorName,
        coordinatorNumber,
        password: hashedPass,
      },
    });

    const token = generateToken({ id: user.id });

    return res.status(200).json({
      success: true,
      message: "Account Created Successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("Register Vendor Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const loginwithpassword = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    const user = await prisma.vendor.findFirst({
      where: {
        OR: [{ email: email }, { coordinatorNumber: phone }],
      },
    });

    if (!user) {
      console.log("User not found");
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      console.log("Incorrect Password");
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
