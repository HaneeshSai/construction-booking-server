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

export const addEquipment = async (req, res) => {
  try {
    // ✅ Check if vendor exists
    const existingUser = await prisma.vendor.findUnique({
      where: { id: req.user.id },
    });

    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized User" });
    }

    // ✅ Destructure only allowed fields (ignore vendor)
    const {
      machineType,
      machineName,
      machineModel,
      ownershipType,
      address,
      nameOfManufacturer,
      invoiceNumber,
      invoiceDate,
      isRtoRegistered,
      registrationNumber,
      registeredState,
      insuranceValidity,
      purchaseYear,
      fuelType,
      rcFile,
      invoiceFile,
      frontImageFile,
      sideImageFile,
      engineImageFile,
      controlPanelFile,
      insuranceFile,
      dailyPrice,
      weeklyPrice,
      monthlyPrice,
    } = req.body.data;

    // ✅ Create new equipment
    const newEquipment = await prisma.equipment.create({
      data: {
        machineType,
        machineModel,
        machineName,
        ownershipType,
        address,
        nameOfManufacturer,
        invoiceNumber,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : null,
        isRtoRegistered,
        registrationNumber: registrationNumber || null,
        registeredState,
        insuranceValidity: insuranceValidity ? String(insuranceValidity) : null,
        purchaseYear,
        fuelType,
        rcFile,
        invoiceFile,
        frontImageFile,
        sideImageFile,
        engineImageFile,
        controlPanelFile,
        insuranceFile,
        dailyPrice: parseFloat(dailyPrice),
        weeklyPrice: parseFloat(weeklyPrice),
        monthlyPrice: parseFloat(monthlyPrice),
        status: "PENDING",

        // ✅ always connect via vendorId
        vendorId: req.user.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Equipment Added Successfully",
      equipment: newEquipment, // <- optional but useful
    });
  } catch (error) {
    console.error("Add Equipment Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const getVendorDashboard = async (req, res) => {
  try {
    const equipments = await prisma.equipment.findMany({
      where: {
        vendorId: req.user.id,
      },
      select: {
        machineName: true,
        frontImageFile: true,
        machineModel: true,
        status: true,
        id: true,
      },
    });

    return res.status(200).json({ success: true, equipments });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const getVendorProfile = async (req, res) => {
  try {
    const profile = await prisma.vendor.findUnique({
      where: {
        id: req.user.id,
      },
      include: {
        equipment: true,
      },
    });

    return res.status(200).json({ success: true, profile });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const getListings = async (req, res) => {
  try {
    const listings = await prisma.equipment.findMany({
      where: {
        vendorId: req.user.id,
      },
      select: {
        machineModel: true,
        machineType: true,
        machineName: true,
        registrationNumber: true,
        status: true,
        dailyPrice: true,
        weeklyPrice: true,
        monthlyPrice: true,
        id: true,
      },
    });

    return res.status(200).json({ success: true, listings });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};
