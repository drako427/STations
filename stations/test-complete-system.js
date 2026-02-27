// Complete system test
const testCompleteSystem = async () => {
    console.log('🧪 COMPLETE SYSTEM TEST\n');
    
    try {
        // Test 1: DPO Login
        console.log('1️⃣ Testing DPO Login...');
        const dpoResponse = await fetch('http://localhost:5000/api/auth/naked-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://10.0.5.21:3000'
            },
            body: JSON.stringify({
                username: 'dpo',
                password: 'admin',
                role: 'dpo'
            })
        });
        
        if (dpoResponse.ok) {
            const dpoData = await dpoResponse.json();
            console.log('✅ DPO Login Successful');
            const dpoToken = dpoData.token;
            
            // Test 2: Fetch Stations with DPO token
            console.log('\n2️⃣ Testing Stations Fetch with DPO token...');
            const stationsResponse = await fetch('http://localhost:5000/api/stations', {
                headers: {
                    'Authorization': `Bearer ${dpoToken}`,
                    'Origin': 'http://10.0.5.21:3000'
                }
            });
            
            if (stationsResponse.ok) {
                const stationsData = await stationsResponse.json();
                console.log(`✅ Stations Fetch Successful - Found ${stationsData.length} stations`);
                
                // Test 3: Station Login
                console.log('\n3️⃣ Testing Station Login...');
                const stationResponse = await fetch('http://localhost:5000/api/station-login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Origin': 'http://10.0.5.21:3000'
                    },
                    body: JSON.stringify({
                        access_code: 'TSA-001'
                    })
                });
                
                if (stationResponse.ok) {
                    const stationData = await stationResponse.json();
                    console.log('✅ Station Login Successful');
                    const stationToken = stationData.token;
                    
                    // Test 4: Dashboard with Station token
                    console.log('\n4️⃣ Testing Dashboard with Station token...');
                    const dashboardResponse = await fetch('http://localhost:5000/api/dashboard', {
                        headers: {
                            'Authorization': `Bearer ${stationToken}`,
                            'Origin': 'http://10.0.5.21:3000'
                        }
                    });
                    
                    if (dashboardResponse.ok) {
                        const dashboardData = await dashboardResponse.json();
                        console.log('✅ Dashboard Fetch Successful');
                        console.log(`   Station Name: ${dashboardData.station?.station_name || 'N/A'}`);
                        console.log(`   Total Suspects: ${dashboardData.totalSuspects || 0}`);
                    } else {
                        console.log('❌ Dashboard Fetch Failed');
                    }
                } else {
                    console.log('❌ Station Login Failed');
                }
            } else {
                console.log('❌ Stations Fetch Failed');
            }
        } else {
            console.log('❌ DPO Login Failed');
        }
        
        console.log('\n🎉 COMPLETE SYSTEM TEST FINISHED');
        
    } catch (error) {
        console.error('❌ System Test Error:', error.message);
    }
};

testCompleteSystem();
