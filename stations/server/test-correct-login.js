const http = require('http');

// Test with correct station code
const testCorrectLogin = () => {
    const loginData = JSON.stringify({ access_code: 'TSA-001' });
    
    const loginOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/station-login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(loginData)
        }
    };

    const loginReq = http.request(loginOptions, (loginRes) => {
        let loginData = '';
        loginRes.on('data', (chunk) => {
            loginData += chunk;
        });
        
        loginRes.on('end', () => {
            try {
                const loginResult = JSON.parse(loginData);
                console.log(`✅ Station login status: ${loginRes.statusCode}`);
                
                if (loginRes.statusCode === 200) {
                    console.log(`🎫 Token received for: ${loginResult.user.stationName}`);
                    console.log(`   Station ID: ${loginResult.user.stationId}`);
                    console.log(`   Role: ${loginResult.user.role}`);
                } else {
                    console.log('❌ Station login failed');
                    console.log(`   Error: ${loginResult.error || 'Unknown error'}`);
                }
            } catch (e) {
                console.log('❌ Failed to parse login JSON');
            }
        });
    });

    loginReq.on('error', (e) => {
        console.error('❌ Login request error:', e.message);
    });

    loginReq.write(loginData);
    loginReq.end();
};

console.log('🔑 Testing Station Login with TSA-001...\n');

testCorrectLogin();
