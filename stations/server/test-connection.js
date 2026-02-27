const http = require('http');

// Test connection to backend
const testConnection = () => {
    const testData = JSON.stringify({ username: 'test', password: 'test', role: 'dpo' });
    
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/naked-login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(testData)
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('✅ Backend connection successful!');
            console.log(`Status: ${res.statusCode}`);
            console.log(`Response: ${data.substring(0, 100)}...`);
        });
    });

    req.on('error', (e) => {
        console.error('❌ Backend connection failed:', e.message);
    });

    req.write(testData);
    req.end();
};

console.log('🔍 Testing backend connection...\n');

testConnection();
