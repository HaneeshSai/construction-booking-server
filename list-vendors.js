import prisma from "./src/utils/prismaClient.js";

async function listVendors() {
  try {
    console.log("\n📋 All Vendors in Database");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    const vendors = await prisma.vendor.findMany({
      select: {
        id: true,
        email: true,
        companyName: true,
        coordinatorName: true,
        coordinatorNumber: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (vendors.length === 0) {
      console.log("❌ No vendors found in database");
      console.log("\n💡 To create a test vendor, run:");
      console.log("   node create-test-vendor.js");
      return;
    }

    console.log(`Found ${vendors.length} vendor(s):\n`);

    vendors.forEach((vendor, index) => {
      console.log(`${index + 1}. ${vendor.companyName}`);
      console.log(`   Email: ${vendor.email}`);
      console.log(`   Coordinator: ${vendor.coordinatorName}`);
      console.log(`   Phone: ${vendor.coordinatorNumber}`);
      console.log(`   ID: ${vendor.id}`);
      console.log(
        `   Created: ${vendor.createdAt.toLocaleDateString()} ${vendor.createdAt.toLocaleTimeString()}`
      );
      console.log("");
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n💡 To verify login credentials, run:");
    console.log("   node verify-vendor-login.js");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listVendors();
