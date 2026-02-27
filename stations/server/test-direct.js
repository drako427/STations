const http = require('http');

const postData = JSON.stringify({
    username: 'test@example.com',
    password: 'password123',
    role: 'dpo'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/naked-login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    console.log(`✅ Response status: ${res.statusCode}`);
    console.log(`✅ Response headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('✅ Response data:', data);
        try {
            const jsonData = JSON.parse(data);
            console.log('✅ Parsed JSON:', jsonData);
        } catch (e) {
            console.log('❌ Failed to parse JSON');
        }
    });
});

req.on('error', (e) => {
    console.error('❌ Request error:', e.message);
});

req.write(postData);
req.end();

console.log('🔍 Sending request to /api/auth/naked-login...');
