import bcrypt from "bcryptjs";
import prisma from "../utils/prismaClient.js";
import { generateToken } from "../utils/jwt.js";
const salt = parseInt(process.env.BCRYPT_SALT) || 10;

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
    // Trim email and password to remove extra spaces
    const trimmedEmail = email?.trim();
    const trimmedPassword = password?.trim();

    if (trimmedPassword !== password) {
      console.log("⚠️  Password had extra spaces - trimmed");
    }



    // ✅ FIX: Build query conditions dynamically - only search by phone if it's provided
    const whereConditions = [];
    if (trimmedEmail) {
      whereConditions.push({ email: trimmedEmail });
    }
    if (phone && phone.trim() !== "") {
      whereConditions.push({ coordinatorNumber: phone });
    }

    const user = await prisma.vendor.findFirst({
      where: {
        OR: whereConditions.length > 0 ? whereConditions : [{ email: trimmedEmail }],
      },
    });

    if (!user) {
      console.log("❌ User not found");
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const match = await bcrypt.compare(trimmedPassword, user.password);

    if (!match) {
      console.log("❌ Incorrect Password");
      return res.status(401).json({
        success: false,
        message: "Incorrect Password",
      });
    }

    const token = generateToken({ id: user.id });

    console.log("✅ Login successful");
    return res
      .status(200)
      .json({ success: true, message: "Login Successfull", token, user });
  } catch (error) {
    console.log("❌ Login error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const loginWithGoogle = async (req, res) => {
  try {
    const { email, googleId, fullName } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({
        success: false,
        message: "Email and Google ID are required",
      });
    }

    // Check if vendor exists
    let vendor = await prisma.vendor.findUnique({
      where: { email },
    });

    if (vendor) {
      // Vendor exists - check if profile is complete
      if (!vendor.googleId) {
        vendor = await prisma.vendor.update({
          where: { id: vendor.id },
          data: { googleId },
        });
      }

      // Check if vendor has completed company details
      const isProfileComplete = vendor.companyName && vendor.GST && vendor.PAN;

      const token = generateToken({ id: vendor.id });

      return res.status(200).json({
        success: true,
        message: "Login Successful",
        token,
        user: vendor,
        needsCompanyDetails: !isProfileComplete,
      });
    } else {
      // New vendor - needs to complete company details
      // Create partial vendor account
      vendor = await prisma.vendor.create({
        data: {
          email,
          googleId,
          coordinatorName: fullName || "Google User",
          coordinatorNumber: "",
          companyName: "",
          GST: "",
          PAN: "",
          password: "",
        },
      });

      const token = generateToken({ id: vendor.id });

      return res.status(200).json({
        success: true,
        message: "Account created. Please complete your company details.",
        token,
        user: vendor,
        needsCompanyDetails: true,
      });
    }
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
    } = req.body;

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
        machineModel: true,
        frontImageFile: true,
        status: true,
        address: true,
        id: true,
      },
    });

    // Get all jobs that the vendor has already applied to
    const appliedJobIds = await prisma.jobApplication.findMany({
      where: {
        vendorId: req.user.id,
      },
      select: {
        jobId: true,
      },
    });

    const appliedJobIdsSet = new Set(appliedJobIds.map((app) => app.jobId));

    // Get live jobs that are active/pending and vendor hasn't applied to yet
    const liveJobs = await prisma.job.findMany({
      where: {
        status: {
          in: ["ACTIVE", "PENDING"], // Show both ACTIVE and PENDING jobs
        },
        id: {
          notIn: Array.from(appliedJobIdsSet), // Exclude jobs already applied to
        },
      },
      include: {
        equipement: {
          select: {
            machineModel: true,
            machineName: true,
            machineType: true,
            frontImageFile: true,
          },
        },
        customer: {
          select: {
            fullName: true,
            email: true,
          },
        },
        address: {
          select: {
            city: true,
            district: true,
            state: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Show newest jobs first
      },
      take: 20, // Limit to 20 most recent jobs
    });

    const appliedJobs = await prisma.jobApplication.findMany({
      where: {
        vendorId: req.user.id,
      },
      include: {
        job: {
          include: {
            equipement: {
              select: {
                machineModel: true,
                machineName: true,
                frontImageFile: true,
              },
            },
          },
        },
      },
    });

    return res
      .status(200)
      .json({ success: true, equipments, liveJobs, appliedJobs });
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
        frontImageFile: true,
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

export const getMachineById = async (req, res) => {
  try {
    const { id } = req.params;
    const machine = await prisma.equipment.findFirst({
      where: {
        id,
      },
    });

    return res.status(200).json({ success: true, machine });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const getJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { id: vendorId } = req.user;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    // Get job details with related equipment and customer info
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        equipement: {
          select: {
            id: true,
            machineType: true,
            machineName: true,
            machineModel: true,
            ownershipType: true,
            nameOfManufacturer: true,
            purchaseYear: true,
            fuelType: true,
            frontImageFile: true,
            sideImageFile: true,
            engineImageFile: true,
            controlPanelFile: true,
            dailyPrice: true,
            weeklyPrice: true,
            monthlyPrice: true,
            status: true,
            vendor: {
              select: {
                id: true,
                companyName: true,
                coordinatorName: true,
                coordinatorNumber: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        address: {
          select: {
            id: true,
            name: true,
            street: true,
            city: true,
            district: true,
            state: true,
            pincode: true,
            phone: true,
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if the vendor has already applied to this job
    const jobApplication = await prisma.jobApplication.findFirst({
      where: {
        jobId: jobId,
        vendorId: vendorId,
      },
      select: {
        id: true,
        vendorPrice: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Get total number of applications for this job
    const totalApplications = await prisma.jobApplication.count({
      where: { jobId: jobId },
    });

    // Format the response
    const response = {
      success: true,
      data: {
        job: {
          id: job.id,
          jobType: job.jobType,
          terrainType: job.terrainType,
          jobLocation: job.jobLocation,
          jobLocationImageFile: job.jobLocationImageFile,
          deliveryDate: job.deliveryDate,
          additionalDetails: job.additionalDetails,
          timePeriod: job.timePeriod,
          status: job.status,
          createdAt: job.createdAt,
          customer: job.customer,
          address: job.address,
        },
        equipment: job.equipement,
        hasApplied: !!jobApplication,
        application: jobApplication,
        totalApplications: totalApplications,
        canApply: !jobApplication && job.status === "ACTIVE", // Assuming ACTIVE means job is open for applications
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Additional API endpoint for applying to job
export const applyToJob = async (req, res) => {
  try {
    const { id: vendorId } = req.user;
    const { vendorPrice, additionalNotes, jobId } = req.body;

    if (!jobId || !vendorPrice) {
      return res.status(400).json({
        success: false,
        message: "Job ID and vendor price are required",
      });
    }

    // Check if job exists and is active
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, status: true },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "This job is no longer accepting applications",
      });
    }

    // Check if vendor has already applied
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        jobId: jobId,
        vendorId: vendorId,
      },
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to this job",
      });
    }

    // Create new job application
    const jobApplication = await prisma.jobApplication.create({
      data: {
        jobId: jobId,
        vendorId: vendorId,
        vendorPrice: parseFloat(vendorPrice),
        status: "PENDING",
      },
      select: {
        id: true,
        vendorPrice: true,
        status: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: jobApplication,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
