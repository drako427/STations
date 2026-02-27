// Test CORS from network IP
const testNetworkCORS = async () => {
    try {
        console.log('🔍 Testing CORS from network IP...');
        
        const response = await fetch('http://localhost:5000/api/auth/naked-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://10.0.5.21:3000' // Simulate network IP origin
            },
            body: JSON.stringify({
                username: 'dpo',
                password: 'admin',
                role: 'dpo'
            })
        });
        
        console.log(`Response status: ${response.status}`);
        console.log('CORS headers:');
        console.log(`  Access-Control-Allow-Origin: ${response.headers.get('Access-Control-Allow-Origin')}`);
        console.log(`  Access-Control-Allow-Methods: ${response.headers.get('Access-Control-Allow-Methods')}`);
        console.log(`  Access-Control-Allow-Headers: ${response.headers.get('Access-Control-Allow-Headers')}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ CORS test successful!');
        } else {
            console.log('❌ CORS test failed');
        }
    } catch (error) {
        console.error('❌ CORS test error:', error.message);
    }
};

testNetworkCORS();
