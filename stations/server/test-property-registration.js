const http = require('http');

// Test property registration
const testPropertyRegistration = () => {
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
                    
                    // Now test property registration with token
                    const propertyData = JSON.stringify({
                        item_name: 'Test iPhone 15',
                        description: 'Black iPhone 15 Pro stolen from coffee shop',
                        category: 'Electronics',
                        estimated_value: '1200',
                        status: 'missing',
                        reported_date: '2026-01-15',
                        location: 'Downtown Coffee Shop'
                    });
                    
                    const propertyOptions = {
                        hostname: 'localhost',
                        port: 5000,
                        path: '/api/properties',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${loginResult.token}`,
                            'Content-Length': Buffer.byteLength(propertyData)
                        }
                    };

                    const propertyReq = http.request(propertyOptions, (propertyRes) => {
                        let propertyData = '';
                        propertyRes.on('data', (chunk) => {
                            propertyData += chunk;
                        });
                        
                        propertyRes.on('end', () => {
                            try {
                                const propertyResult = JSON.parse(propertyData);
                                console.log(`✅ Property registration status: ${propertyRes.statusCode}`);
                                
                                if (propertyRes.statusCode === 201) {
                                    console.log(`🏠 New Property Created:`);
                                    console.log(`   ID: ${propertyResult.property_id}`);
                                    console.log(`   Name: ${propertyResult.property.name}`);
                                    console.log(`   Category: ${propertyResult.property.category}`);
                                    console.log(`   Value: $${propertyResult.property.value}`);
                                    console.log(`   Status: ${propertyResult.property.status}`);
                                    console.log(`   Station: ${propertyResult.property.station_id}`);
                                } else {
                                    console.log('❌ Property registration failed');
                                    console.log(`   Error: ${propertyResult.error || 'Unknown error'}`);
                                }
                            } catch (e) {
                                console.log('❌ Failed to parse property registration JSON');
                                console.log('   Raw response:', propertyData);
                            }
                        });
                    });

                    propertyReq.on('error', (e) => {
                        console.error('❌ Property registration request error:', e.message);
                    });

                    propertyReq.write(propertyData);
                    propertyReq.end();
                    
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

console.log('🧪 Testing Property Registration...\n');

testPropertyRegistration();
