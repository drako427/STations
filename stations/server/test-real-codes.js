const http = require('http');

// Test actual access codes from database
const testRealCodes = async () => {
    const accessCodes = ['DPO001', 'ACC002'];
    
    for (const code of accessCodes) {
        console.log(`\n🔓 Testing access code: ${code}`);
        
        const loginData = JSON.stringify({ access_code: code });
        
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

        try {
            const result = await new Promise((resolve, reject) => {
                const req = http.request(options, (res) => {
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    
                    res.on('end', () => {
                        try {
                            const parsed = JSON.parse(data);
                            resolve({ status: res.statusCode, data: parsed });
                        } catch (e) {
                            resolve({ status: res.statusCode, data: data });
                        }
                    });
                });

                req.on('error', reject);
                req.write(loginData);
                req.end();
            });
            
            if (result.status === 200) {
                console.log(`✅ SUCCESS: ${result.data.station.station_name}`);
            } else {
                console.log(`❌ FAILED: ${result.data.error || 'Unknown error'}`);
                if (result.data.hint) {
                    console.log(`💡 Hint: ${result.data.hint}`);
                }
            }
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}`);
        }
    }
};

console.log('🔍 Testing REAL access codes from database...\n');

testRealCodes().then(() => {
    console.log('\n🎯 Test complete!');
    process.exit(0);
}).catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});
