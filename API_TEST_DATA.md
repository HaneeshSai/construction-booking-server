# API Testing Guide - Construction Booking Server

## Base URL
```
http://localhost:4000
```

---

## 🧪 CUSTOMER APIs

### 1. Register Customer
**Endpoint:** `POST /customer/register`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123",
  "phone": "9876543210",
  "fullName": "John Doe"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Account Created Successfullly",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxx123456",
    "email": "john.doe@example.com",
    "phone": "9876543210",
    "fullName": "John Doe",
    "createdAt": "2026-01-28T09:47:08.000Z",
    "updatedAt": "2026-01-28T09:47:08.000Z"
  }
}
```

**Additional Test Cases:**
```json
// Test Case 2
{
  "email": "jane.smith@example.com",
  "password": "securePass456",
  "phone": "9123456789",
  "fullName": "Jane Smith"
}

// Test Case 3
{
  "email": "mike.wilson@example.com",
  "password": "mikePass789",
  "phone": "9988776655",
  "fullName": "Mike Wilson"
}
```

---

### 2. Login Customer
**Endpoint:** `POST /customer/loginwithpassword`

**Request Body (with email):**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Request Body (with phone):**
```json
{
  "phone": "9876543210",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login Successfull",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxx123456",
    "email": "john.doe@example.com",
    "phone": "9876543210",
    "fullName": "John Doe"
  }
}
```

---

### 3. Get Dashboard (No Auth Required)
**Endpoint:** `GET /customer/getdashboard`

**No Request Body**

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "topRentals": [...],
    "equipmentCategories": [...],
    "recentJobs": [],
    "popularEquipment": [...],
    "stats": {
      "availableEquipment": 0,
      "totalVendors": 0,
      "customerJobs": 0,
      "customerReviews": 0
    }
  }
}
```

---

### 4. Add Address (Requires Auth)
**Endpoint:** `POST /customer/address`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Request Body:**
```json
{
  "address": {
    "name": "Home",
    "street": "123 MG Road",
    "city": "Bangalore",
    "district": "Bangalore Urban",
    "state": "Karnataka",
    "pincode": "560001",
    "phone": "9876543210"
  }
}
```

**Additional Test Cases:**
```json
// Office Address
{
  "address": {
    "name": "Office",
    "street": "456 Tech Park, Whitefield",
    "city": "Bangalore",
    "district": "Bangalore Urban",
    "state": "Karnataka",
    "pincode": "560066",
    "phone": "9876543211"
  }
}

// Construction Site Address
{
  "address": {
    "name": "Construction Site - Phase 1",
    "street": "Plot No 789, Electronic City",
    "city": "Bangalore",
    "district": "Bangalore Urban",
    "state": "Karnataka",
    "pincode": "560100",
    "phone": "9876543212"
  }
}
```

---

### 5. Get All Addresses (Requires Auth)
**Endpoint:** `GET /customer/addresses`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 6. Update Address (Requires Auth)
**Endpoint:** `PUT /customer/address/:addressId`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Request Body:**
```json
{
  "address": {
    "name": "Home (Updated)",
    "street": "123 MG Road, Apt 5B",
    "city": "Bangalore",
    "district": "Bangalore Urban",
    "state": "Karnataka",
    "pincode": "560001",
    "phone": "9876543210"
  }
}
```

---

### 7. Delete Address (Requires Auth)
**Endpoint:** `DELETE /customer/address/:addressId`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 8. Create Job (Requires Auth)
**Endpoint:** `POST /customer/job`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Request Body:**
```json
{
  "jobType": "Excavation",
  "terrainType": "Rocky",
  "jobLocationImageFile": "https://example.com/site-image.jpg",
  "deliveryDate": "2026-02-15T10:00:00.000Z",
  "additionalDetails": "Need excavator for foundation work. Site has rocky terrain.",
  "addressId": "YOUR_ADDRESS_ID_HERE",
  "equipmentId": "YOUR_EQUIPMENT_ID_HERE"
}
```

**Additional Test Cases:**
```json
// Construction Job
{
  "jobType": "Construction",
  "terrainType": "Plain",
  "jobLocationImageFile": "https://example.com/construction-site.jpg",
  "deliveryDate": "2026-02-20T08:00:00.000Z",
  "additionalDetails": "Building construction project. Need crane for 2 weeks.",
  "addressId": "YOUR_ADDRESS_ID_HERE",
  "equipmentId": "YOUR_EQUIPMENT_ID_HERE"
}

// Road Work
{
  "jobType": "Road Work",
  "terrainType": "Mixed",
  "jobLocationImageFile": "https://example.com/road-work.jpg",
  "deliveryDate": "2026-03-01T07:00:00.000Z",
  "additionalDetails": "Highway expansion project. Need bulldozer and roller.",
  "addressId": "YOUR_ADDRESS_ID_HERE",
  "equipmentId": "YOUR_EQUIPMENT_ID_HERE"
}
```

---

### 9. Get All Bookings (Requires Auth)
**Endpoint:** `GET /customer/bookings`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 10. Get Booking Details with Vendor (Requires Auth)
**Endpoint:** `GET /customer/booking-detail/:bookingId/:vendorId`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Example:**
```
GET /customer/booking-detail/clxxx123456/clyyy789012
```

---

### 11. Accept Application
**Endpoint:** `POST /customer/accept-application`

**Request Body:**
```json
{
  "id": "APPLICATION_ID_HERE"
}
```

---

### 12. Get Profile (Requires Auth)
**Endpoint:** `GET /customer/profile`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 13. Get Machines by Category
**Endpoint:** `GET /customer/get-machines-by-category/:category`

**Example:**
```
GET /customer/get-machines-by-category/Excavator
```

---

### 14. Get Machine by ID
**Endpoint:** `GET /customer/get-machine-by-id/:id`

**Example:**
```
GET /customer/get-machine-by-id/clxxx123456
```

---

## 🏗️ VENDOR APIs

### 1. Register Vendor
**Endpoint:** `POST /vendor/register`

**Request Body:**
```json
{
  "companyName": "ABC Construction Equipment Pvt Ltd",
  "GST": "29ABCDE1234F1Z5",
  "PAN": "ABCDE1234F",
  "email": "vendor@abcequipment.com",
  "coordinatorName": "Rajesh Kumar",
  "coordinatorNumber": "9123456780",
  "password": "vendorPass123"
}
```

**Additional Test Cases:**
```json
// Test Case 2
{
  "companyName": "XYZ Heavy Machinery Rentals",
  "GST": "27XYZAB5678G2H6",
  "PAN": "XYZAB5678G",
  "email": "contact@xyzmachinery.com",
  "coordinatorName": "Priya Sharma",
  "coordinatorNumber": "9876543220",
  "password": "xyzPass456"
}

// Test Case 3
{
  "companyName": "Prime Equipment Solutions",
  "GST": "29PRIME9012H3I7",
  "PAN": "PRIME9012H",
  "email": "info@primeequip.com",
  "coordinatorName": "Amit Patel",
  "coordinatorNumber": "9988776650",
  "password": "primePass789"
}
```

---

### 2. Login Vendor
**Endpoint:** `POST /vendor/loginwithpassword`

**Request Body (with email):**
```json
{
  "email": "vendor@abcequipment.com",
  "password": "vendorPass123"
}
```

**Request Body (with phone):**
```json
{
  "phone": "9123456780",
  "password": "vendorPass123"
}
```

---

### 3. Add Equipment (Requires Auth)
**Endpoint:** `POST /vendor/add-equipment`

**Headers:**
```
Authorization: Bearer YOUR_VENDOR_TOKEN_HERE
```

**Request Body:**
```json
{
  "data": {
    "machineType": "Excavator",
    "machineName": "Hydraulic Excavator",
    "machineModel": "CAT 320D",
    "ownershipType": "Owned",
    "address": "Bangalore, Karnataka",
    "nameOfManufacturer": "Caterpillar",
    "invoiceNumber": "INV-2024-001",
    "invoiceDate": "2024-01-15T00:00:00.000Z",
    "isRtoRegistered": true,
    "registrationNumber": "KA-01-AB-1234",
    "registeredState": "Karnataka",
    "insuranceValidity": "2026-12-31",
    "purchaseYear": "2024",
    "fuelType": "Diesel",
    "rcFile": "https://example.com/rc-file.pdf",
    "invoiceFile": "https://example.com/invoice.pdf",
    "frontImageFile": "https://example.com/excavator-front.jpg",
    "sideImageFile": "https://example.com/excavator-side.jpg",
    "engineImageFile": "https://example.com/excavator-engine.jpg",
    "controlPanelFile": "https://example.com/excavator-panel.jpg",
    "insuranceFile": "https://example.com/insurance.pdf",
    "dailyPrice": 15000,
    "weeklyPrice": 90000,
    "monthlyPrice": 350000
  }
}
```

**Additional Equipment Examples:**

```json
// Bulldozer
{
  "data": {
    "machineType": "Bulldozer",
    "machineName": "Track Bulldozer",
    "machineModel": "Komatsu D65PX",
    "ownershipType": "Owned",
    "address": "Mumbai, Maharashtra",
    "nameOfManufacturer": "Komatsu",
    "invoiceNumber": "INV-2024-002",
    "invoiceDate": "2024-03-20T00:00:00.000Z",
    "isRtoRegistered": true,
    "registrationNumber": "MH-02-CD-5678",
    "registeredState": "Maharashtra",
    "insuranceValidity": "2027-03-20",
    "purchaseYear": "2024",
    "fuelType": "Diesel",
    "rcFile": "https://example.com/bulldozer-rc.pdf",
    "invoiceFile": "https://example.com/bulldozer-invoice.pdf",
    "frontImageFile": "https://example.com/bulldozer-front.jpg",
    "sideImageFile": "https://example.com/bulldozer-side.jpg",
    "engineImageFile": "https://example.com/bulldozer-engine.jpg",
    "controlPanelFile": "https://example.com/bulldozer-panel.jpg",
    "insuranceFile": "https://example.com/bulldozer-insurance.pdf",
    "dailyPrice": 18000,
    "weeklyPrice": 110000,
    "monthlyPrice": 420000
  }
}

// Crane
{
  "data": {
    "machineType": "Crane",
    "machineName": "Mobile Crane",
    "machineModel": "TATA LT 1090",
    "ownershipType": "Leased",
    "address": "Delhi, NCR",
    "nameOfManufacturer": "TATA",
    "invoiceNumber": "INV-2024-003",
    "invoiceDate": "2024-05-10T00:00:00.000Z",
    "isRtoRegistered": true,
    "registrationNumber": "DL-03-EF-9012",
    "registeredState": "Delhi",
    "insuranceValidity": "2027-05-10",
    "purchaseYear": "2024",
    "fuelType": "Diesel",
    "rcFile": "https://example.com/crane-rc.pdf",
    "invoiceFile": "https://example.com/crane-invoice.pdf",
    "frontImageFile": "https://example.com/crane-front.jpg",
    "sideImageFile": "https://example.com/crane-side.jpg",
    "engineImageFile": "https://example.com/crane-engine.jpg",
    "controlPanelFile": "https://example.com/crane-panel.jpg",
    "insuranceFile": "https://example.com/crane-insurance.pdf",
    "dailyPrice": 25000,
    "weeklyPrice": 150000,
    "monthlyPrice": 580000
  }
}

// Loader
{
  "data": {
    "machineType": "Loader",
    "machineName": "Wheel Loader",
    "machineModel": "JCB 432ZX",
    "ownershipType": "Owned",
    "address": "Pune, Maharashtra",
    "nameOfManufacturer": "JCB",
    "invoiceNumber": "INV-2024-004",
    "invoiceDate": "2024-06-15T00:00:00.000Z",
    "isRtoRegistered": false,
    "registrationNumber": null,
    "registeredState": "Maharashtra",
    "insuranceValidity": "2027-06-15",
    "purchaseYear": "2024",
    "fuelType": "Diesel",
    "rcFile": null,
    "invoiceFile": "https://example.com/loader-invoice.pdf",
    "frontImageFile": "https://example.com/loader-front.jpg",
    "sideImageFile": "https://example.com/loader-side.jpg",
    "engineImageFile": "https://example.com/loader-engine.jpg",
    "controlPanelFile": "https://example.com/loader-panel.jpg",
    "insuranceFile": "https://example.com/loader-insurance.pdf",
    "dailyPrice": 12000,
    "weeklyPrice": 75000,
    "monthlyPrice": 290000
  }
}
```

---

### 4. Get Vendor Dashboard (Requires Auth)
**Endpoint:** `GET /vendor/dashboard`

**Headers:**
```
Authorization: Bearer YOUR_VENDOR_TOKEN_HERE
```

---

### 5. Get Vendor Profile (Requires Auth)
**Endpoint:** `GET /vendor/profile`

**Headers:**
```
Authorization: Bearer YOUR_VENDOR_TOKEN_HERE
```

---

### 6. Get Listings (Requires Auth)
**Endpoint:** `GET /vendor/listings`

**Headers:**
```
Authorization: Bearer YOUR_VENDOR_TOKEN_HERE
```

---

### 7. Get Machine by ID
**Endpoint:** `GET /vendor/machine/:id`

**Example:**
```
GET /vendor/machine/clxxx123456
```

---

### 8. Get Job Details (Requires Auth)
**Endpoint:** `GET /vendor/job-details/:jobId`

**Headers:**
```
Authorization: Bearer YOUR_VENDOR_TOKEN_HERE
```

**Example:**
```
GET /vendor/job-details/clxxx123456
```

---

### 9. Apply to Job (Requires Auth)
**Endpoint:** `POST /vendor/apply-to-job`

**Headers:**
```
Authorization: Bearer YOUR_VENDOR_TOKEN_HERE
```

**Request Body:**
```json
{
  "jobId": "JOB_ID_HERE",
  "vendorPrice": 14500,
  "additionalNotes": "We can provide the equipment with experienced operator"
}
```

**Additional Test Cases:**
```json
// Lower Price Bid
{
  "jobId": "JOB_ID_HERE",
  "vendorPrice": 13000,
  "additionalNotes": "Competitive pricing with 24/7 support"
}

// Premium Service Bid
{
  "jobId": "JOB_ID_HERE",
  "vendorPrice": 16500,
  "additionalNotes": "Premium service with backup equipment and dedicated technician"
}
```

---

## 🔧 COMMON APIs

### 1. Get Upload URL
**Endpoint:** `POST /common/upload-file`

**Request Body:**
```json
{
  "fileName": "excavator-front.jpg",
  "fileType": "image/jpeg"
}
```

**Expected Response:**
```json
{
  "uploadUrl": "https://s3.amazonaws.com/...",
  "key": "uuid-generated-filename.jpg"
}
```

**Additional Test Cases:**
```json
// PDF Document
{
  "fileName": "invoice.pdf",
  "fileType": "application/pdf"
}

// PNG Image
{
  "fileName": "site-photo.png",
  "fileType": "image/png"
}
```

---

## 🔍 Testing Workflow

### Complete Customer Flow:
1. Register Customer → Save token
2. Login Customer → Verify token
3. Add Address → Save address ID
4. Get Addresses → Verify address created
5. Get Dashboard → See available equipment
6. Create Job → Save job ID
7. Get All Bookings → See created job
8. Get Profile → Verify customer data

### Complete Vendor Flow:
1. Register Vendor → Save token
2. Login Vendor → Verify token
3. Add Equipment → Save equipment ID (repeat for multiple equipment)
4. Get Listings → See all equipment
5. Get Dashboard → See live jobs
6. Get Job Details → View specific job
7. Apply to Job → Submit bid
8. Get Profile → Verify vendor data

### Integration Flow:
1. Customer creates job
2. Vendor applies to job
3. Customer views applications
4. Customer accepts application
5. Job status changes to IN_PROGRESS

---

## 📝 Notes

- Replace `YOUR_TOKEN_HERE` with actual JWT token from login/register response
- Replace `YOUR_ADDRESS_ID_HERE` with actual address ID from add address response
- Replace `YOUR_EQUIPMENT_ID_HERE` with actual equipment ID from vendor's equipment
- Replace `JOB_ID_HERE` with actual job ID from create job response
- Replace `APPLICATION_ID_HERE` with actual application ID

## ⚠️ Known Issues (From Bug Report)

1. Login endpoints return `success: false` even on successful login (Bug in code)
2. Address update/delete use `parseInt(addressId)` but IDs are strings (Will cause errors)
3. Accept application endpoint has no authentication
4. Job status "ACTIVE" is checked but never set (Jobs might not be available for applications)

---

## 🧪 Testing Tools

You can use:
- **Postman** - Import this as collection
- **Thunder Client** (VS Code Extension)
- **cURL** - Command line testing
- **REST Client** (VS Code Extension)

### Example cURL:
```bash
# Register Customer
curl -X POST http://localhost:4000/customer/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123",
    "phone": "9876543210",
    "fullName": "John Doe"
  }'

# Login Customer
curl -X POST http://localhost:4000/customer/loginwithpassword \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```
