const http = require('http');

const postData = JSON.stringify({
    access_code: 'CPS-001'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/station-login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
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

console.log('🔍 Sending station login request...');
