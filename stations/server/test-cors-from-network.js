// Test CORS from network IP like browser
const testCORSFromNetwork = async () => {
    try {
        console.log('🌐 Testing CORS from network IP (like browser)...');
        
        // Simulate exact browser request from network IP
        const response = await fetch('http://localhost:5000/api/auth/naked-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://10.0.5.21:3000' // This is what browser sends
            },
            body: JSON.stringify({
                username: 'dpo',
                password: 'admin',
                role: 'dpo'
            })
        });
        
        console.log(`Response status: ${response.status}`);
        console.log('Response headers:');
        console.log(`  Access-Control-Allow-Origin: ${response.headers.get('Access-Control-Allow-Origin')}`);
        console.log(`  Access-Control-Allow-Methods: ${response.headers.get('Access-Control-Allow-Methods')}`);
        console.log(`  Access-Control-Allow-Headers: ${response.headers.get('Access-Control-Allow-Headers')}`);
        console.log(`  Access-Control-Allow-Credentials: ${response.headers.get('Access-Control-Allow-Credentials')}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ CORS from network IP successful!');
            console.log(`Token: ${data.token.substring(0, 50)}...`);
        } else {
            console.log('❌ CORS from network IP failed');
            const errorText = await response.text();
            console.log(`Error: ${errorText.substring(0, 200)}...`);
        }
        
    } catch (error) {
        console.error('❌ CORS from network IP error:', error.message);
    }
};

testCORSFromNetwork();
