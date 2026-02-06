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

async function debugPassword() {
  try {
    console.log("\n🔍 Vendor Password Debug Tool");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    const email = await question("Enter vendor email: ");

    console.log("\n⏳ Fetching vendor data...\n");

    // Find vendor
    const vendor = await prisma.vendor.findFirst({
      where: {
        email: email.trim(),
      },
    });

    if (!vendor) {
      console.log("❌ No vendor found with email:", email);
      rl.close();
      await prisma.$disconnect();
      return;
    }

    console.log("✅ Vendor found!");
    console.log(`   Company: ${vendor.companyName}`);
    console.log(`   Email: ${vendor.email}`);
    console.log(`   Coordinator: ${vendor.coordinatorName}\n`);

    console.log("🔐 Password Information:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Stored hash: ${vendor.password}`);
    console.log(`Hash length: ${vendor.password.length} characters`);
    console.log(`Hash starts with: ${vendor.password.substring(0, 10)}`);
    console.log(
      `Is bcrypt hash: ${vendor.password.startsWith("$2a$") || vendor.password.startsWith("$2b$") ? "YES ✅" : "NO ❌"}`
    );

    if (
      !vendor.password.startsWith("$2a$") &&
      !vendor.password.startsWith("$2b$")
    ) {
      console.log("\n⚠️  WARNING: Password is NOT hashed!");
      console.log("This means the password was stored in plain text.");
      console.log("The login will fail because bcrypt.compare expects a hash.\n");
      console.log("🔧 To fix this, the password needs to be hashed.");
      console.log("Would you like to hash it now? (y/n)");

      const answer = await question("> ");

      if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
        const plainPassword = vendor.password;
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        await prisma.vendor.update({
          where: { id: vendor.id },
          data: { password: hashedPassword },
        });

        console.log("\n✅ Password has been hashed!");
        console.log(`New hash: ${hashedPassword.substring(0, 30)}...`);
        console.log(`\n✨ You can now login with password: ${plainPassword}`);
      }
    } else {
      console.log("\n✅ Password is properly hashed.\n");

      const testPassword = await question(
        "Enter password to test (or press Enter to skip): "
      );

      if (testPassword) {
        console.log("\n⏳ Testing password...");
        const isMatch = await bcrypt.compare(testPassword, vendor.password);

        if (isMatch) {
          console.log("✅ PASSWORD MATCHES! Login should work.");
        } else {
          console.log("❌ PASSWORD DOES NOT MATCH!");
          console.log("\n💡 Possible issues:");
          console.log("   1. Wrong password");
          console.log("   2. Extra spaces");
          console.log("   3. Case sensitivity");
          console.log("\n🔧 Would you like to set a new password? (y/n)");

          const resetAnswer = await question("> ");

          if (
            resetAnswer.toLowerCase() === "y" ||
            resetAnswer.toLowerCase() === "yes"
          ) {
            const newPassword = await question("Enter new password: ");
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await prisma.vendor.update({
              where: { id: vendor.id },
              data: { password: hashedPassword },
            });

            console.log("\n✅ Password has been updated!");
            console.log(`✨ You can now login with password: ${newPassword}`);
          }
        }
      }
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

debugPassword();
