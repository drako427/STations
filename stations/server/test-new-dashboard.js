const http = require('http');

// Test dashboard endpoint with new format
const testDashboard = () => {
    // First login as station to get token
    const loginData = JSON.stringify({ access_code: 'ACC002' });
    
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
        let loginResponse = '';
        loginRes.on('data', (chunk) => {
            loginResponse += chunk;
        });
        
        loginRes.on('end', () => {
            try {
                const loginResult = JSON.parse(loginResponse);
                
                if (loginRes.statusCode === 200) {
                    console.log('✅ Station login successful!');
                    
                    // Now test dashboard with token
                    const dashboardOptions = {
                        hostname: 'localhost',
                        port: 5000,
                        path: '/api/dashboard',
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${loginResult.token}`,
                            'Content-Type': 'application/json'
                        }
                    };

                    const dashboardReq = http.request(dashboardOptions, (dashboardRes) => {
                        let dashboardResponse = '';
                        dashboardRes.on('data', (chunk) => {
                            dashboardResponse += chunk;
                        });
                        
                        dashboardRes.on('end', () => {
                            try {
                                const dashboardResult = JSON.parse(dashboardResponse);
                                console.log(`📊 Dashboard status: ${dashboardRes.statusCode}`);
                                
                                if (dashboardRes.statusCode === 200) {
                                    console.log('✅ Dashboard data received!');
                                    console.log('🏢 Station:', dashboardResult.station ? dashboardResult.station.station_name : 'None');
                                    console.log('📈 Stats count:', dashboardResult.stats ? dashboardResult.stats.length : 0);
                                    if (dashboardResult.stats && dashboardResult.stats[0]) {
                                        console.log('📊 First stat:', dashboardResult.stats[0]);
                                    }
                                } else {
                                    console.log('❌ Dashboard failed:', dashboardResult.error || 'Unknown error');
                                }
                            } catch (e) {
                                console.log('❌ Failed to parse dashboard JSON');
                                console.log('Raw response:', dashboardResponse);
                            }
                        });
                    });

                    dashboardReq.on('error', (e) => {
                        console.error('❌ Dashboard request error:', e.message);
                    });

                    dashboardReq.end();
                    
                } else {
                    console.log('❌ Station login failed:', loginResult.error || 'Unknown error');
                }
            } catch (e) {
                console.log('❌ Failed to parse login JSON');
                console.log('Raw response:', loginResponse);
            }
        });
    });

    loginReq.on('error', (e) => {
        console.error('❌ Login request error:', e.message);
    });

    loginReq.write(loginData);
    loginReq.end();
};

console.log('🔍 Testing station dashboard...\n');

testDashboard();
