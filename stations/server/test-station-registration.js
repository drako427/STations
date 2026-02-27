const http = require('http');

const stationData = {
    name: 'Test Police Station',
    code: 'STN-12345',
    location: 'Test Location',
    sector: 'Test Sector',
    jurisdiction_type: 'local',
    phone: '123-456-7890',
    email: 'test@station.com',
    address: '123 Test Street'
};

const postData = JSON.stringify(stationData);

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/stations',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token', // Mock token
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
            if (res.statusCode === 201) {
                console.log('🎉 Station registration successful!');
                console.log(`📋 New station code: ${jsonData.access_code}`);
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

console.log('🔍 Testing station registration...');
