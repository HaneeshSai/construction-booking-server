import { Router } from "express";
import prisma from "../utils/prismaClient.js";

const router = Router();

router.get("/record/:model", async (req, res) => {
  try {
    const { model } = req.params;
    const { page = 1, limit = 10, search = "" } = req.query;

    const modelName = model.toLowerCase();
    const validModels = [
      "customer",
      "vendor",
      "address",
      "equipment",
      "job",
      "jobapplication",
      "review",
    ];

    if (!validModels.includes(modelName)) {
      return res.status(400).json({ error: "Invalid model" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build include object based on model
    let include = {};
    switch (modelName) {
      case "customer":
        include = { addresses: true, jobs: true, reviews: true };
        break;
      case "vendor":
        include = {
          equipment: true,
          addresses: true,
          jobApplications: true,
          reviews: true,
        };
        break;
      case "equipment":
        include = { vendor: true, reviews: true };
        break;
      case "job":
        include = {
          customer: true,
          address: true,
          equipement: true,
          applications: true,
          reviews: true,
        };
        break;
      case "jobapplication":
        include = { job: true, vendor: true };
        break;
      case "review":
        include = { customer: true, vendor: true, equipment: true, job: true };
        break;
    }

    // Build search conditions
    let where = {};
    if (search) {
      switch (modelName) {
        case "customer":
          where = {
            OR: [
              { email: { contains: search, mode: "insensitive" } },
              { fullName: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          };
          break;
        case "vendor":
          where = {
            OR: [
              { companyName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { coordinatorName: { contains: search, mode: "insensitive" } },
            ],
          };
          break;
        case "equipment":
          where = {
            OR: [
              { machineType: { contains: search, mode: "insensitive" } },
              { machineName: { contains: search, mode: "insensitive" } },
              { machineModel: { contains: search, mode: "insensitive" } },
            ],
          };
          break;
      }
    }

    const [records, total] = await Promise.all([
      prisma[modelName].findMany({
        skip,
        take: parseInt(limit),
        where,
        include,
        orderBy: { createdAt: "desc" },
      }),
      prisma[modelName].count({ where }),
    ]);

    res.json({
      records,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

// GET single record by ID
router.get("/record/:model/:id", async (req, res) => {
  try {
    const { model, id } = req.params;
    const modelName = model.toLowerCase();

    const validModels = [
      "customer",
      "vendor",
      "address",
      "equipment",
      "job",
      "jobapplication",
      "review",
    ];
    if (!validModels.includes(modelName)) {
      return res.status(400).json({ error: "Invalid model" });
    }

    let include = {};
    switch (modelName) {
      case "customer":
        include = { addresses: true, jobs: true, reviews: true };
        break;
      case "vendor":
        include = {
          equipment: true,
          addresses: true,
          jobApplications: true,
          reviews: true,
        };
        break;
      case "equipment":
        include = { vendor: true, reviews: true };
        break;
      case "job":
        include = {
          customer: true,
          address: true,
          equipement: true,
          applications: true,
          reviews: true,
        };
        break;
      case "jobapplication":
        include = { job: true, vendor: true };
        break;
      case "review":
        include = { customer: true, vendor: true, equipment: true, job: true };
        break;
    }

    const record = await prisma[modelName].findUnique({
      where: { id },
      include,
    });

    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json(record);
  } catch (error) {
    console.error("Error fetching record:", error);
    res.status(500).json({ error: "Failed to fetch record" });
  }
});

// CREATE new record
router.post("/record/:model", async (req, res) => {
  try {
    const { model } = req.params;
    const modelName = model.toLowerCase();
    const data = req.body;

    const validModels = [
      "customer",
      "vendor",
      "address",
      "equipment",
      "job",
      "jobapplication",
      "review",
    ];
    if (!validModels.includes(modelName)) {
      return res.status(400).json({ error: "Invalid model" });
    }

    // Convert string dates to Date objects where needed
    if (data.invoiceDate) data.invoiceDate = new Date(data.invoiceDate);
    if (data.deliveryDate) data.deliveryDate = new Date(data.deliveryDate);

    // Convert string numbers to appropriate types
    if (data.rating) data.rating = parseInt(data.rating);
    if (data.dailyPrice) data.dailyPrice = parseFloat(data.dailyPrice);
    if (data.weeklyPrice) data.weeklyPrice = parseFloat(data.weeklyPrice);
    if (data.monthlyPrice) data.monthlyPrice = parseFloat(data.monthlyPrice);
    if (data.vendorPrice) data.vendorPrice = parseFloat(data.vendorPrice);
    if (data.isRtoRegistered !== undefined)
      data.isRtoRegistered =
        data.isRtoRegistered === "true" || data.isRtoRegistered === true;

    const record = await prisma[modelName].create({
      data,
    });

    res.status(201).json(record);
  } catch (error) {
    console.error("Error creating record:", error);
    res
      .status(500)
      .json({ error: "Failed to create record", details: error.message });
  }
});

// UPDATE record by ID
router.put("/record/:model/:id", async (req, res) => {
  try {
    const { model, id } = req.params;
    const modelName = model.toLowerCase();
    const data = req.body;

    const validModels = [
      "customer",
      "vendor",
      "address",
      "equipment",
      "job",
      "jobapplication",
      "review",
    ];
    if (!validModels.includes(modelName)) {
      return res.status(400).json({ error: "Invalid model" });
    }

    // Convert string dates to Date objects where needed
    if (data.invoiceDate) data.invoiceDate = new Date(data.invoiceDate);
    if (data.deliveryDate) data.deliveryDate = new Date(data.deliveryDate);

    // Convert string numbers to appropriate types
    if (data.rating) data.rating = parseInt(data.rating);
    if (data.dailyPrice) data.dailyPrice = parseFloat(data.dailyPrice);
    if (data.weeklyPrice) data.weeklyPrice = parseFloat(data.weeklyPrice);
    if (data.monthlyPrice) data.monthlyPrice = parseFloat(data.monthlyPrice);
    if (data.vendorPrice) data.vendorPrice = parseFloat(data.vendorPrice);
    if (data.isRtoRegistered !== undefined)
      data.isRtoRegistered =
        data.isRtoRegistered === "true" || data.isRtoRegistered === true;

    const record = await prisma[modelName].update({
      where: { id },
      data,
    });

    res.json(record);
  } catch (error) {
    console.error("Error updating record:", error);
    res
      .status(500)
      .json({ error: "Failed to update record", details: error.message });
  }
});

// DELETE record by ID
router.delete("/record/:model/:id", async (req, res) => {
  try {
    const { model, id } = req.params;
    const modelName = model.toLowerCase();

    const validModels = [
      "customer",
      "vendor",
      "address",
      "equipment",
      "job",
      "jobapplication",
      "review",
      "file",
    ];
    if (!validModels.includes(modelName)) {
      return res.status(400).json({ error: "Invalid model" });
    }

    await prisma[modelName].delete({
      where: { id },
    });

    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    console.error("Error deleting record:", error);
    res
      .status(500)
      .json({ error: "Failed to delete record", details: error.message });
  }
});

// Get dashboard stats
router.get("/stats/dashboard", async (req, res) => {
  try {
    const [
      customerCount,
      vendorCount,
      equipmentCount,
      jobCount,
      recentJobs,
      recentCustomers,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.vendor.count(),
      prisma.equipment.count(),
      prisma.job.count(),
      prisma.job.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: true, equipement: true },
      }),
      prisma.customer.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.json({
      stats: {
        customers: customerCount,
        vendors: vendorCount,
        equipment: equipmentCount,
        jobs: jobCount,
      },
      recentJobs,
      recentCustomers,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

export default router;
