const http = require('http');

// Test stations endpoint
const testStationsEndpoint = () => {
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
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const result = JSON.parse(data);
                console.log(`✅ Stations endpoint status: ${res.statusCode}`);
                
                if (res.statusCode === 200) {
                    console.log(`📊 Found ${result.length} stations`);
                    result.forEach((station, index) => {
                        console.log(`   ${index + 1}. ${station.station_name} (${station.station_code})`);
                    });
                } else {
                    console.log('❌ Stations endpoint failed');
                }
            } catch (e) {
                console.log('❌ Failed to parse stations JSON');
                console.log('   Raw response:', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error('❌ Stations request error:', e.message);
    });

    req.end();
};

console.log('📊 Testing Stations Endpoint...\n');

testStationsEndpoint();
