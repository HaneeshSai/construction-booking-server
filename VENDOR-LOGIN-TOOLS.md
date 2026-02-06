# Vendor Login Debugging Tools

These scripts help you debug and fix vendor login issues.

## Available Tools

### 1. 📋 List All Vendors
Shows all vendors in the database with their details.

```bash
node list-vendors.js
```

**Output:**
- Company name
- Email address
- Coordinator name
- Phone number
- Creation date

### 2. ✨ Create Test Vendor
Creates a test vendor account with known credentials.

```bash
node create-test-vendor.js
```

**Creates vendor with:**
- Email: `vendor@test.com`
- Password: `Vendor123`
- Company: Test Equipment Rentals
- Phone: 9999999999

**Use these credentials to login!**

### 3. 🔍 Verify Login Credentials
Interactive tool to test if your credentials are correct.

```bash
node verify-vendor-login.js
```

**What it does:**
1. Asks for email and password
2. Checks if vendor exists
3. Verifies password against database
4. Shows detailed debugging info
5. Tells you if login should work

### 4. 🗄️ Open Database GUI
View and edit database records directly.

```bash
npx prisma studio
```

Opens a web interface at http://localhost:5555

## Quick Start Guide

### Problem: "Incorrect Password" Error

**Step 1:** Check if vendor exists
```bash
node list-vendors.js
```

**Step 2:** Verify your credentials
```bash
node verify-vendor-login.js
# Enter your email and password when prompted
```

**Step 3:** If password is wrong, create a new test account
```bash
node create-test-vendor.js
```

**Step 4:** Login with test credentials
- Email: `vendor@test.com`
- Password: `Vendor123`

## Common Issues & Solutions

### Issue: "Vendor already exists"
**Solution:** The test vendor was already created. Use the existing credentials:
- Email: `vendor@test.com`
- Password: `Vendor123`

Or delete the vendor in Prisma Studio and run `create-test-vendor.js` again.

### Issue: "Password incorrect" in verify tool
**Solution:** You're using the wrong password. Either:
1. Remember the correct password from registration
2. Create a new test vendor with `create-test-vendor.js`
3. Reset password manually in Prisma Studio

### Issue: "No vendors found"
**Solution:** No vendors registered yet. Either:
1. Register via the app
2. Run `create-test-vendor.js` to create one

## Manual Password Reset

If you need to reset a vendor's password manually:

1. Generate a bcrypt hash:
```javascript
// In Node.js console or create a file
const bcrypt = require('bcryptjs');
const newPassword = 'YourNewPassword123';
const hash = bcrypt.hashSync(newPassword, 10);
console.log(hash);
```

2. Open Prisma Studio:
```bash
npx prisma studio
```

3. Find the vendor in the Vendor table
4. Replace the password field with the new hash
5. Save
6. Login with the new password

## Testing Workflow

### For Fresh Testing:

1. **Create test vendor:**
   ```bash
   node create-test-vendor.js
   ```

2. **Verify it was created:**
   ```bash
   node list-vendors.js
   ```

3. **Test login in app:**
   - Email: `vendor@test.com`
   - Password: `Vendor123`

4. **If login fails, verify credentials:**
   ```bash
   node verify-vendor-login.js
   ```

### For Existing Vendors:

1. **List all vendors:**
   ```bash
   node list-vendors.js
   ```

2. **Verify your credentials:**
   ```bash
   node verify-vendor-login.js
   # Enter your email and password
   ```

3. **If password is wrong:**
   - Try to remember the correct password
   - Or create a new test vendor
   - Or reset password in Prisma Studio

## Understanding the Error

The error "Incorrect Password" means:
- ✅ Backend is working correctly
- ✅ Vendor exists in database
- ❌ Password doesn't match

This is **NOT a bug** - it's the backend protecting the account!

## Need Help?

1. Run `node list-vendors.js` to see all vendors
2. Run `node verify-vendor-login.js` to test credentials
3. Check backend console logs for detailed errors
4. Open Prisma Studio to inspect database directly

## Pro Tips

- Always use the EXACT password from registration (case-sensitive)
- No extra spaces before or after password
- Test with simple passwords first (e.g., "Test123")
- Use the test vendor for development/testing
- Keep production passwords secure and complex
