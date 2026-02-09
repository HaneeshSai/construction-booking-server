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
      return res.status(401).json({
        success: false,
        message: "Incorrect Password",
      });
    }

    const token = generateToken({ id: user.id });

    return res
      .status(200)
      .json({ success: true, message: "Login Successfull", token, user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashboard = async (req, res) => {
  try {
    // Get customer ID from request (assuming it's available in req.user or req.params)
    const customerId = req.user?.id || req.params?.customerId;

    // Get top available rentals
    const topRentals = await prisma.equipment.findMany({
      where: {
        status: "AVAILABLE",
      },
      select: {
        id: true,
        machineType: true,
        machineModel: true,
        machineName: true,
        status: true,
        frontImageFile: true,
        dailyPrice: true,
        weeklyPrice: true,
        monthlyPrice: true,
        vendor: {
          select: {
            companyName: true,
            coordinatorName: true,
          },
        },
      },
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get equipment categories with counts
    const equipmentCategories = await prisma.equipment.groupBy({
      by: ["machineType"],
      where: {
        status: "AVAILABLE",
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    // Get customer's recent jobs if customerId is available
    let recentJobs = [];
    if (customerId) {
      recentJobs = await prisma.job.findMany({
        where: {
          customerId: customerId,
        },
        select: {
          id: true,
          jobType: true,
          status: true,
          deliveryDate: true,
          equipement: {
            select: {
              machineName: true,
              machineType: true,
              frontImageFile: true,
            },
          },
          address: {
            select: {
              city: true,
              district: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });
    }

    // Get popular equipment types
    // Get popular equipment types (with error handling)
    let popularEquipment = [];
    try {
      popularEquipment = await prisma.equipment.findMany({
        where: {
          status: "AVAILABLE",
        },
        select: {
          machineType: true,
          frontImageFile: true,
          dailyPrice: true,
        },
        distinct: ["machineType"],
        take: 6,
      });
    } catch (err) {
      console.warn("Failed to fetch popular equipment:", err.message);
      // Fallback or empty array
    }

    // Get statistics for dashboard
    const stats = await Promise.all([
      prisma.equipment.count({ where: { status: "AVAILABLE" } }),
      prisma.vendor.count(),
      customerId ? prisma.job.count({ where: { customerId } }) : 0,
      customerId ? prisma.review.count({ where: { customerId } }) : 0,
    ]);

    const dashboardData = {
      topRentals,
      equipmentCategories,
      recentJobs,
      popularEquipment,
      stats: {
        availableEquipment: stats[0],
        totalVendors: stats[1],
        customerJobs: stats[2],
        customerReviews: stats[3],
      },
    };

    return res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMachinesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    // Debug: Log what we are looking for
    console.log(`Getting machines for category (machineName): ${category}`);

    const machines = await prisma.equipment.findMany({
      where: {
        machineName: {
          equals: category,
          mode: "insensitive",
        },
      },
      select: {
        frontImageFile: true,
        machineModel: true,
        dailyPrice: true,
        address: true,
        purchaseYear: true,
        status: true,
        id: true,
      },
    });

    return res.status(200).json({ success: true, machines });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMachineById = async (req, res) => {
  try {
    const { id } = req.params;

    const machineDetail = await prisma.equipment.findUnique({
      where: {
        id,
      },
    });

    return res.status(200).json({ success: true, machineDetail });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const { id } = req.user;
    const addresses = await prisma.address.findMany({
      where: {
        customerId: id,
      },
    });

    return res.status(200).json({ success: true, addresses });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addAddress = async (req, res) => {
  try {
    const { address } = req.body;
    const { id } = req.user;
    const newAddress = await prisma.address.create({
      data: {
        name: address.name,
        street: address.street,
        city: address.city,
        district: address.district,
        state: address.state,
        pincode: address.pincode,
        phone: address.phone,
        customerId: id,
      },
    });

    return res
      .status(200)
      .json({ success: true, message: "Added Successfully", addressId: newAddress.id });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Add these to your existing address controller file

export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { address } = req.body;
    const { id } = req.user;

    // First check if the address belongs to the user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        customerId: id,
      },
    });

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found or you don't have permission to update it",
      });
    }

    const updatedAddress = await prisma.address.update({
      where: {
        id: addressId,
      },
      data: {
        name: address.name,
        street: address.street,
        city: address.city,
        district: address.district,
        state: address.state,
        pincode: address.pincode,
        phone: address.phone,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { id } = req.user;

    // First check if the address belongs to the user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: parseInt(addressId),
        customerId: id,
      },
    });

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found or you don't have permission to delete it",
      });
    }

    // Check if user has more than one address
    const addressCount = await prisma.address.count({
      where: {
        customerId: id,
      },
    });

    if (addressCount <= 1) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete the last address. You must have at least one delivery address.",
      });
    }

    await prisma.address.delete({
      where: {
        id: parseInt(addressId),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createJob = async (req, res) => {
  try {
    const { id } = req.user;

    const {
      jobType,
      terrainType,
      jobLocationImageFile,
      deliveryDate,
      additionalDetails,
      addressId,
      equipmentId,
    } = req.body;

    const newJob = await prisma.job.create({
      data: {
        jobType,
        terrainType,
        jobLocationImageFile,
        deliveryDate,
        additionalDetails,
        timePeriod: "8",
        customerId: id,
        equipmentId,
        addressId,
        status: "PENDING",
      },
    });

    return res
      .status(200)
      .json({ success: true, message: "Job Added Successfully", jobId: newJob.id });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const { id } = req.user;

    const bookings = await prisma.job.findMany({
      where: {
        customerId: id,
      },
      include: {
        equipement: {
          select: {
            id: true,
            machineModel: true,
            machineName: true,
            machineType: true,
            address: true,
            frontImageFile: true,
            sideImageFile: true,
            engineImageFile: true,
            dailyPrice: true,
            weeklyPrice: true,
            monthlyPrice: true,
            status: true,
            purchaseYear: true,
            vendor: {
              select: {
                id: true,
                companyName: true,
                coordinatorName: true,
                coordinatorNumber: true,
                email: true,
              },
            },
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
        applications: {
          include: {
            vendor: {
              select: {
                id: true,
                companyName: true,
                coordinatorName: true,
                coordinatorNumber: true,
                email: true,
                GST: true,
                PAN: true,
              },
            },
          },
          orderBy: [
            { vendorPrice: "asc" }, // Show cheapest first
            { createdAt: "asc" }, // Then by application time
          ],
        },
      },
      orderBy: {
        createdAt: "desc", // Show newest jobs first
      },
    });

    // Format the response to include application statistics
    const formattedBookings = bookings.map((job) => ({
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
      updatedAt: job.updatedAt,

      // Equipment details
      equipment: job.equipement,

      // Address details
      address: job.address,

      // Application details - All vendors who applied
      applications: job.applications.map((app) => ({
        id: app.id,
        vendorPrice: app.vendorPrice,
        status: app.status,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        vendor: app.vendor,
      })),

      // Application statistics
      applicationStats: {
        total: job.applications.length,
        pending: job.applications.filter((app) => app.status === "PENDING")
          .length,
        accepted: job.applications.filter((app) => app.status === "ACCEPTED")
          .length,
        rejected: job.applications.filter((app) => app.status === "REJECTED")
          .length,
        lowestPrice:
          job.applications.length > 0
            ? Math.min(...job.applications.map((app) => app.vendorPrice))
            : null,
        highestPrice:
          job.applications.length > 0
            ? Math.max(...job.applications.map((app) => app.vendorPrice))
            : null,
        averagePrice:
          job.applications.length > 0
            ? Math.round(
              job.applications.reduce(
                (sum, app) => sum + app.vendorPrice,
                0
              ) / job.applications.length
            )
            : null,
      },
    }));

    return res.status(200).json({
      success: true,
      bookings: formattedBookings,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching bookings",
    });
  }
};

export const getBookingDetailsWithVendor = async (req, res) => {
  try {
    const { id } = req.user; // Customer ID from auth middleware
    const { bookingId, vendorId } = req.params; // Get from URL params

    // Validate required parameters
    if (!bookingId || !vendorId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and Vendor ID are required",
      });
    }

    // Get the specific booking with all related data
    const booking = await prisma.job.findFirst({
      where: {
        id: bookingId,
        customerId: id, // Ensure the booking belongs to the authenticated customer
      },
      include: {
        // Equipment details
        equipement: {
          select: {
            id: true,
            machineModel: true,
            machineName: true,
            machineType: true,
            address: true,
            frontImageFile: true,
            sideImageFile: true,
            engineImageFile: true,
            dailyPrice: true,
            weeklyPrice: true,
            monthlyPrice: true,
            status: true,
            purchaseYear: true,
            nameOfManufacturer: true,
            fuelType: true,
            vendor: {
              select: {
                id: true,
                companyName: true,
                coordinatorName: true,
                coordinatorNumber: true,
                email: true,
              },
            },
          },
        },

        // Delivery address details
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

        // All applications for this job
        applications: {
          include: {
            vendor: {
              select: {
                id: true,
                companyName: true,
                coordinatorName: true,
                coordinatorNumber: true,
                email: true,
                GST: true,
                PAN: true,
              },
            },
          },
          orderBy: [
            { vendorPrice: "asc" }, // Show cheapest first
            { createdAt: "asc" }, // Then by application time
          ],
        },

        // Customer details (for verification)
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      console.log("booking not found");
      return res.status(404).json({
        success: false,
        message: "Booking not found or you don't have access to this booking",
      });
    }

    // Find the selected vendor application
    const selectedApplication = booking.applications.find(
      (app) => app.vendorId === vendorId
    );

    if (!selectedApplication) {
      console.log("Vendor not found");
      return res.status(404).json({
        success: false,
        message: "Vendor application not found for this booking",
      });
    }

    // Calculate pricing details
    const calculatePricingDetails = (application, booking) => {
      const vendorPrice = application.vendorPrice;
      const timePeriod = booking.timePeriod.toLowerCase();

      // Base calculations
      const rentalCharges = vendorPrice;
      const driverCharges = 3000; // Fixed driver charges
      const mobilizationAdvance = Math.round(vendorPrice * 0.2); // 20% of rental price
      const commission = Math.round(vendorPrice * 0.05); // 5% commission
      const platformFee = 25;
      const deliveryPartnerFee = 0; // Free delivery

      // Calculate taxes (GST 18% on rental + driver charges)
      const taxableAmount = rentalCharges + driverCharges;
      const gstRate = 0.18;
      const taxes = Math.round(taxableAmount * gstRate);

      // Total calculation
      const subtotal =
        rentalCharges +
        driverCharges +
        mobilizationAdvance +
        commission +
        platformFee +
        deliveryPartnerFee;
      const total = subtotal + taxes;

      return {
        rentalCharges,
        driverCharges,
        mobilizationAdvance,
        commission,
        platformFee,
        deliveryPartnerFee,
        taxes,
        subtotal,
        total,
        gstRate: gstRate * 100, // Convert to percentage
        timePeriod: booking.timePeriod,
      };
    };

    // Get all customer addresses for the address selection modal
    const customerAddresses = await prisma.address.findMany({
      where: {
        customerId: id,
      },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the response
    const bookingDetails = {
      // Booking information
      booking: {
        id: booking.id,
        jobType: booking.jobType,
        terrainType: booking.terrainType,
        jobLocation: booking.jobLocation,
        jobLocationImageFile: booking.jobLocationImageFile,
        deliveryDate: booking.deliveryDate,
        additionalDetails: booking.additionalDetails,
        timePeriod: booking.timePeriod,
        status: booking.status,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      },

      // Equipment information
      equipment: booking.equipement,

      // Selected vendor and application details
      selectedVendor: {
        ...selectedApplication.vendor,
        application: {
          id: selectedApplication.id,
          vendorPrice: selectedApplication.vendorPrice,
          status: selectedApplication.status,
          createdAt: selectedApplication.createdAt,
          updatedAt: selectedApplication.updatedAt,
        },
      },

      // Current delivery address
      deliveryAddress: booking.address,

      // All available addresses for the customer
      availableAddresses: customerAddresses,

      // Pricing breakdown
      pricing: calculatePricingDetails(selectedApplication, booking),

      // Application statistics (for reference)
      applicationStats: {
        total: booking.applications.length,
        pending: booking.applications.filter((app) => app.status === "PENDING")
          .length,
        accepted: booking.applications.filter(
          (app) => app.status === "ACCEPTED"
        ).length,
        rejected: booking.applications.filter(
          (app) => app.status === "REJECTED"
        ).length,
        lowestPrice: Math.min(
          ...booking.applications.map((app) => app.vendorPrice)
        ),
        highestPrice: Math.max(
          ...booking.applications.map((app) => app.vendorPrice)
        ),
        averagePrice: Math.round(
          booking.applications.reduce((sum, app) => sum + app.vendorPrice, 0) /
          booking.applications.length
        ),
      },

      // Customer information
      customer: booking.customer,
    };

    return res.status(200).json({
      success: true,
      data: bookingDetails,
    });
  } catch (error) {
    console.error("Error fetching booking details with vendor:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching booking details",
    });
  }
};

export const acceptApplication = async (req, res) => {
  try {
    const { id } = req.body;

    const application = await prisma.jobApplication.update({
      where: {
        id,
      },
      data: {
        status: "IN_PROGRESS",
      },
    });

    await prisma.job.update({
      where: {
        id: application.jobId,
      },
      data: {
        status: "IN_PROGRESS",
      },
    });

    return res
      .status(200)
      .json({ success: true, message: "Applied successfully", application });
  } catch (error) {
    console.log("Error Fetching Booking details with vendor", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { id } = req.user;

    // Fetch user profile with all related data
    const userProfile = await prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: {
          orderBy: { createdAt: "desc" },
        },
        jobs: {
          include: {
            equipement: {
              select: {
                machineType: true,
                machineName: true,
                machineModel: true,
                dailyPrice: true,
                weeklyPrice: true,
                monthlyPrice: true,
                status: true,
              },
            },
            address: true,
            applications: {
              include: {
                vendor: {
                  select: {
                    companyName: true,
                    coordinatorName: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        reviews: {
          include: {
            vendor: {
              select: {
                companyName: true,
              },
            },
            equipment: {
              select: {
                machineType: true,
                machineName: true,
              },
            },
            job: {
              select: {
                jobType: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    // Calculate some stats
    const totalJobs = userProfile.jobs.length;
    const completedJobs = userProfile.jobs.filter(
      (job) => job.status === "completed"
    ).length;
    const pendingJobs = userProfile.jobs.filter(
      (job) => job.status === "pending"
    ).length;
    const totalAddresses = userProfile.addresses.length;
    const totalReviews = userProfile.reviews.length;
    const averageRating =
      totalReviews > 0
        ? (
          userProfile.reviews.reduce(
            (sum, review) => sum + review.rating,
            0
          ) / totalReviews
        ).toFixed(1)
        : 0;

    // Prepare response data
    const profileData = {
      personalInfo: {
        id: userProfile.id,
        fullName: userProfile.fullName,
        email: userProfile.email,
        phone: userProfile.phone,
        memberSince: userProfile.createdAt,
      },
      stats: {
        totalJobs,
        completedJobs,
        pendingJobs,
        totalAddresses,
        totalReviews,
        averageRating,
      },
      addresses: userProfile.addresses,
      recentJobs: userProfile.jobs.slice(0, 5), // Last 5 jobs
      recentReviews: userProfile.reviews.slice(0, 3), // Last 3 reviews
    };

    return res.status(200).json({
      success: true,
      message: "Profile data fetched successfully",
      data: profileData,
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching profile data",
    });
  }
};
