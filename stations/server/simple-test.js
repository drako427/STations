const http = require('http');

// Simple test
const testData = JSON.stringify({ access_code: 'TSA-001' });

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/station-login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('Response status:', res.statusCode);
        console.log('Response data:', data);
    });
});

req.write(testData);
req.end();
