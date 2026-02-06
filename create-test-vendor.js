// Quick script to create a test vendor account
import fetch from 'node-fetch';

const testVendor = {
  companyName: "Test Equipment Rentals",
  email: "vendor@test.com",
  password: "Test123456",
  coordinatorName: "Test Coordinator",
  coordinatorNumber: "9999999999",
  GST: "22AAAAA0000A1Z5",
  PAN: "AAAAA0000A"
};

async function createTestVendor() {
  try {
    console.log('Creating test vendor account...');
    console.log('Email:', testVendor.email);
    console.log('Password:', testVendor.password);
    
    const response = await fetch('http://localhost:4000/vendor/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testVendor)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('\n✅ Test vendor created successfully!');
      console.log('\nLogin credentials:');
      console.log('Email: vendor@test.com');
      console.log('Password: Test123456');
      console.log('\nVendor ID:', data.user?.id);
    } else {
      console.log('\n❌ Failed to create vendor:', data.message);
      if (data.message.includes('already exists')) {
        console.log('\n✅ Account already exists! Use these credentials:');
        console.log('Email: vendor@test.com');
        console.log('Password: Test123456');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nMake sure the backend server is running on http://localhost:4000');
  }
}

createTestVendor();
