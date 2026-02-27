const http = require('http');

// Test station login endpoint
const testStationLogin = () => {
    const loginData = JSON.stringify({ 
        access_code: 'ACC001'  // Use the first station's access code
    });
    
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/station-login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(loginData)
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
                console.log(`✅ Station login status: ${res.statusCode}`);
                
                if (res.statusCode === 200) {
                    console.log(`🎫 Station login successful!`);
                    console.log(`   Station: ${result.station.station_name}`);
                    console.log(`   Token: ${result.token.substring(0, 50)}...`);
                } else {
                    console.log('❌ Station login failed');
                    console.log(`   Error: ${result.error || 'Unknown error'}`);
                }
            } catch (e) {
                console.log('❌ Failed to parse station login JSON');
                console.log('   Raw response:', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error('❌ Station login request error:', e.message);
    });

    req.write(loginData);
    req.end();
};

console.log('🔓 Testing Station Login...\n');

testStationLogin();
