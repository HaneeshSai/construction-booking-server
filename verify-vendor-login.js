import bcrypt from "bcryptjs";
import prisma from "./src/utils/prismaClient.js";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function verifyLogin() {
  try {
    console.log("\n🔍 Vendor Login Verification Tool");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    const email = await question("Enter vendor email: ");
    const password = await question("Enter password: ");

    console.log("\n⏳ Checking credentials...\n");

    // Find vendor
    const vendor = await prisma.vendor.findFirst({
      where: {
        email: email.trim(),
      },
    });

    if (!vendor) {
      console.log("❌ No vendor found with email:", email);
      console.log("\n💡 Available vendors:");
      const allVendors = await prisma.vendor.findMany({
        select: { email: true, companyName: true },
      });
      allVendors.forEach((v) => {
        console.log(`   - ${v.email} (${v.companyName})`);
      });
      rl.close();
      return;
    }

    console.log("✅ Vendor found!");
    console.log(`   Company: ${vendor.companyName}`);
    console.log(`   Email: ${vendor.email}`);
    console.log(`   Coordinator: ${vendor.coordinatorName}`);

    // Check password
    const isMatch = await bcrypt.compare(password, vendor.password);

    console.log("\n🔐 Password Verification:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    if (isMatch) {
      console.log("✅ PASSWORD CORRECT!");
      console.log("\n✨ Login should work with these credentials:");
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
    } else {
      console.log("❌ PASSWORD INCORRECT!");
      console.log("\n⚠️  The password you entered does not match the database.");
      console.log("\n💡 Possible issues:");
      console.log("   1. Wrong password");
      console.log("   2. Extra spaces in password");
      console.log("   3. Case sensitivity (Password123 vs password123)");
      console.log("   4. Password was changed after registration");
      console.log("\n🔧 To reset password, run:");
      console.log("   node reset-vendor-password.js");
    }

    console.log("\n📊 Database Info:");
    console.log(`   Stored hash: ${vendor.password.substring(0, 30)}...`);
    console.log(`   Hash length: ${vendor.password.length} characters`);
    console.log(
      `   Hash type: ${vendor.password.startsWith("$2a$") ? "bcrypt" : "unknown"}`
    );
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

verifyLogin();
