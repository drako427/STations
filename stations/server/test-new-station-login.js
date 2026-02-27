const http = require('http');

const postData = JSON.stringify({
    access_code: 'STN-12345'
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
            if (res.statusCode === 200) {
                console.log('🎉 New station login successful!');
                console.log(`📋 Station name: ${jsonData.user.stationName}`);
            }
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

console.log('🔍 Testing new station login...');
