import bcrypt from "bcryptjs";
import prisma from "./src/utils/prismaClient.js";

async function fixVendorPasswords() {
  try {
    console.log("🔍 Checking all vendor passwords...\n");

    const vendors = await prisma.vendor.findMany();

    if (vendors.length === 0) {
      console.log("No vendors found in database.");
      return;
    }

    let fixedCount = 0;
    let alreadyHashedCount = 0;

    for (const vendor of vendors) {
      const isHashed =
        vendor.password.startsWith("$2a$") ||
        vendor.password.startsWith("$2b$");

      if (!isHashed) {
        console.log(`❌ Found unhashed password for: ${vendor.email}`);
        console.log(`   Plain text: ${vendor.password}`);

        // Hash the password
        const hashedPassword = await bcrypt.hash(vendor.password, 10);

        // Update in database
        await prisma.vendor.update({
          where: { id: vendor.id },
          data: { password: hashedPassword },
        });

        console.log(`✅ Fixed! Hashed password for: ${vendor.email}`);
        console.log(`   You can now login with password: ${vendor.password}\n`);
        fixedCount++;
      } else {
        console.log(`✅ Already hashed: ${vendor.email}`);
        alreadyHashedCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log(`Total vendors: ${vendors.length}`);
    console.log(`Already hashed: ${alreadyHashedCount}`);
    console.log(`Fixed: ${fixedCount}`);
    console.log("=".repeat(60));

    if (fixedCount > 0) {
      console.log("\n✨ Passwords have been fixed! Try logging in again.");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixVendorPasswords();
