const http = require('http');

// Test station dashboard
const testStationDashboard = () => {
    // First login as station to get token
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
                if (loginRes.statusCode === 200) {
                    console.log('✅ Station login successful');
                    console.log(`   Station: ${loginResult.user.stationName}`);
                    
                    // Now test dashboard with token
                    const dashboardOptions = {
                        hostname: 'localhost',
                        port: 5000,
                        path: '/api/dashboard',
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${loginResult.token}`
                        }
                    };

                    const dashboardReq = http.request(dashboardOptions, (dashboardRes) => {
                        let dashboardData = '';
                        dashboardRes.on('data', (chunk) => {
                            dashboardData += chunk;
                        });
                        
                        dashboardRes.on('end', () => {
                            try {
                                const dashboardResult = JSON.parse(dashboardData);
                                console.log(`✅ Station dashboard status: ${dashboardRes.statusCode}`);
                                
                                if (dashboardResult.station) {
                                    console.log(`🏢 Station Dashboard: ${dashboardResult.station.station_name}`);
                                    console.log(`   Code: ${dashboardResult.station.station_code}`);
                                    console.log(`   Location: ${dashboardResult.station.location}`);
                                    console.log(`   Total Suspects: ${dashboardResult.totalSuspects}`);
                                    console.log(`   Total Cases: ${dashboardResult.totalCases}`);
                                    console.log(`   Properties: ${dashboardResult.stats.find(s => s.name === 'Properties')?.value || 0}`);
                                } else {
                                    console.log('❌ No station information found');
                                }
                            } catch (e) {
                                console.log('❌ Failed to parse dashboard JSON');
                            }
                        });
                    });

                    dashboardReq.on('error', (e) => {
                        console.error('❌ Dashboard request error:', e.message);
                    });

                    dashboardReq.end();
                    
                } else {
                    console.log('❌ Station login failed');
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

// Test DPO dashboard
const testDPODashboard = () => {
    // First login as DPO to get token
    const loginData = JSON.stringify({ username: 'dpo', password: 'test', role: 'dpo' });
    
    const loginOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/naked-login',
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
                if (loginRes.statusCode === 200) {
                    console.log('✅ DPO login successful');
                    
                    // Now test dashboard with token
                    const dashboardOptions = {
                        hostname: 'localhost',
                        port: 5000,
                        path: '/api/dashboard',
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${loginResult.token}`
                        }
                    };

                    const dashboardReq = http.request(dashboardOptions, (dashboardRes) => {
                        let dashboardData = '';
                        dashboardRes.on('data', (chunk) => {
                            dashboardData += chunk;
                        });
                        
                        dashboardRes.on('end', () => {
                            try {
                                const dashboardResult = JSON.parse(dashboardData);
                                console.log(`✅ DPO dashboard status: ${dashboardRes.statusCode}`);
                                
                                if (!dashboardResult.station) {
                                    console.log('🏛️ DPO Dashboard (System-wide View)');
                                    console.log(`   Total Stations: ${dashboardResult.totalStations}`);
                                    console.log(`   Total Suspects: ${dashboardResult.totalSuspects}`);
                                    console.log(`   Total Cases: ${dashboardResult.totalCases}`);
                                    console.log(`   Active Cases: ${dashboardResult.activeCases}`);
                                } else {
                                    console.log('❌ Unexpected station information found for DPO');
                                }
                            } catch (e) {
                                console.log('❌ Failed to parse dashboard JSON');
                            }
                        });
                    });

                    dashboardReq.on('error', (e) => {
                        console.error('❌ Dashboard request error:', e.message);
                    });

                    dashboardReq.end();
                    
                } else {
                    console.log('❌ DPO login failed');
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

console.log('🧪 Testing Role-Based Dashboard...\n');

console.log('1️⃣ Testing Station Dashboard:');
testStationDashboard();

setTimeout(() => {
    console.log('\n2️⃣ Testing DPO Dashboard:');
    testDPODashboard();
}, 2000);
