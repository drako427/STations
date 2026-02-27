const { default: fetch } = require('node-fetch');

async function testAuthEndpoint() {
    try {
        console.log('🔍 Testing auth endpoint...');
        
        const response = await fetch('http://localhost:5000/api/auth/naked-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'test@example.com'
            })
        });
        
        const data = await response.json();
        console.log('✅ Response status:', response.status);
        console.log('✅ Response data:', data);
        
        if (response.status === 500) {
            console.log('📋 Checking server logs for error...');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testAuthEndpoint();
