const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/stations',
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
        try {
            const jsonData = JSON.parse(data);
            console.log(`✅ Parsed JSON: Found ${jsonData.length} stations`);
            jsonData.forEach(station => {
                console.log(`   🔹 ${station.station_code} - ${station.station_name}`);
            });
        } catch (e) {
            console.log('❌ Failed to parse JSON');
        }
    });
});

req.on('error', (e) => {
    console.error('❌ Request error:', e.message);
});

req.end();

console.log('🔍 Fetching stations from /api/stations...');
