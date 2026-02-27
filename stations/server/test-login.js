const http = require('http');

// Test naked login endpoint
const testLogin = () => {
    const loginData = JSON.stringify({ username: 'dpo', password: 'admin', role: 'dpo' });
    
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

    console.log('🔑 Testing naked login endpoint...');
    console.log(`Request data: ${loginData}`);
    console.log(`Request URL: http://localhost:5000/api/auth/naked-login`);
    
    const req = http.request(options, (res) => {
        console.log(`Response status: ${res.statusCode}`);
        console.log('Response headers:', res.headers);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('Response body:', data);
            
            if (res.statusCode === 200) {
                try {
                    const result = JSON.parse(data);
                    console.log('✅ Login successful!');
                    console.log(`Token: ${result.token.substring(0, 50)}...`);
                } catch (e) {
                    console.log('❌ Failed to parse JSON response');
                }
            } else {
                console.log('❌ Login failed');
            }
        });
    });

    req.on('error', (e) => {
        console.error('❌ Request error:', e.message);
    });

    req.write(loginData);
    req.end();
};

testLogin();
