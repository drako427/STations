const http = require('http');

// Test DPO login endpoint
const testDPOLogin = () => {
    const loginData = JSON.stringify({ 
        username: 'dpo', 
        password: 'admin', 
        role: 'dpo' 
    });
    
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/naked-login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(loginData)
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const result = JSON.parse(data);
                console.log(`✅ DPO login status: ${res.statusCode}`);
                
                if (res.statusCode === 200) {
                    console.log(`🎫 DPO login successful!`);
                    console.log(`   Username: ${result.user.username}`);
                    console.log(`   Role: ${result.user.role}`);
                    console.log(`   Token: ${result.token.substring(0, 50)}...`);
                } else {
                    console.log('❌ DPO login failed');
                    console.log(`   Error: ${result.error || 'Unknown error'}`);
                }
            } catch (e) {
                console.log('❌ Failed to parse DPO login JSON');
                console.log('   Raw response:', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error('❌ DPO login request error:', e.message);
    });

    req.write(loginData);
    req.end();
};

console.log('🔓 Testing DPO Login...\n');

testDPOLogin();
