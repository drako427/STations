const fetch = require('node-fetch');

async function testPropertiesAPI() {
    try {
        console.log('🔍 Testing properties API...');
        
        // Test without authentication first
        const response = await fetch('http://localhost:5000/api/properties', {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers.raw());
        
        const text = await response.text();
        console.log('Response body:', text);
        
        // Test with fake token
        const responseWithToken = await fetch('http://localhost:5000/api/properties', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer fake-token'
            }
        });
        
        console.log('With fake token - Status:', responseWithToken.status);
        const textWithToken = await responseWithToken.text();
        console.log('With fake token - Body:', textWithToken);
        
    } catch (error) {
        console.error('❌ API test error:', error);
    }
}

testPropertiesAPI();
