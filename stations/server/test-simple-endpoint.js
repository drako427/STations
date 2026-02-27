const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    console.log(`✅ Response status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('✅ Response data:', data);
    });
});

req.on('error', (e) => {
    console.error('❌ Request error:', e.message);
});

req.end();

console.log('🔍 Testing simple /api endpoint...');
