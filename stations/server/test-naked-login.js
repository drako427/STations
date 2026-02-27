const { default: fetch } = require('node-fetch');

async function testNakedLogin() {
    try {
        console.log('🔍 Testing naked login endpoint...');
        
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
        
        if (response.ok && data.token) {
            console.log('🎉 Naked login working successfully!');
        } else {
            console.log('❌ Naked login failed:', data.error);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testNakedLogin();
