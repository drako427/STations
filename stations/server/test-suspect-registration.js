const http = require('http');

// Test suspect registration
const testSuspectRegistration = () => {
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
                    
                    // Now test suspect registration with token
                    const suspectData = JSON.stringify({
                        full_name: 'John Doe',
                        date_of_birth: '1990-01-15',
                        crime_committed: 'Theft',
                        location_of_crime: 'Downtown Mall',
                        place_of_arrest: 'City Center',
                        date_of_arrest: '2026-01-15',
                        nationality: 'Local',
                        physical_description: 'Male, 6ft, brown hair',
                        risk_level: 'medium',
                        is_national: false
                    });
                    
                    const suspectOptions = {
                        hostname: 'localhost',
                        port: 5000,
                        path: '/api/suspects',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${loginResult.token}`,
                            'Content-Length': Buffer.byteLength(suspectData)
                        }
                    };

                    const suspectReq = http.request(suspectOptions, (suspectRes) => {
                        let suspectData = '';
                        suspectRes.on('data', (chunk) => {
                            suspectData += chunk;
                        });
                        
                        suspectRes.on('end', () => {
                            try {
                                const suspectResult = JSON.parse(suspectData);
                                console.log(`✅ Suspect registration status: ${suspectRes.statusCode}`);
                                
                                if (suspectRes.statusCode === 201) {
                                    console.log(`🔍 New Suspect Created:`);
                                    console.log(`   ID: ${suspectResult.suspect_id}`);
                                    console.log(`   Name: ${suspectResult.suspect.name}`);
                                    console.log(`   Crime: ${suspectResult.suspect.crime_type}`);
                                    console.log(`   Station: ${suspectResult.suspect.station_id}`);
                                    console.log(`   Risk Level: ${suspectResult.suspect.risk_level}`);
                                } else {
                                    console.log('❌ Suspect registration failed');
                                    console.log(`   Error: ${suspectResult.error || 'Unknown error'}`);
                                }
                            } catch (e) {
                                console.log('❌ Failed to parse suspect registration JSON');
                                console.log('   Raw response:', suspectData);
                            }
                        });
                    });

                    suspectReq.on('error', (e) => {
                        console.error('❌ Suspect registration request error:', e.message);
                    });

                    suspectReq.write(suspectData);
                    suspectReq.end();
                    
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

console.log('🧪 Testing Suspect Registration...\n');

testSuspectRegistration();
