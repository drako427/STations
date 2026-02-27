// Final comprehensive test
const testFinal = async () => {
    console.log('🚀 FINAL SYSTEM TEST\n');
    
    try {
        // Test DPO Login
        console.log('1️⃣ Testing DPO Login...');
        const dpoResponse = await fetch('http://localhost:5000/api/auth/naked-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'dpo', password: 'admin', role: 'dpo' })
        });
        
        if (!dpoResponse.ok) {
            throw new Error(`DPO Login Failed: ${dpoResponse.status}`);
        }
        
        const dpoData = await dpoResponse.json();
        console.log('✅ DPO Login Successful');
        console.log(`   Token: ${dpoData.token.substring(0, 30)}...`);
        
        // Test Stations Fetch
        console.log('\n2️⃣ Testing Stations Fetch...');
        const stationsResponse = await fetch('http://localhost:5000/api/stations', {
            headers: { 'Authorization': `Bearer ${dpoData.token}` }
        });
        
        if (!stationsResponse.ok) {
            throw new Error(`Stations Fetch Failed: ${stationsResponse.status}`);
        }
        
        const stationsData = await stationsResponse.json();
        console.log(`✅ Stations Fetch Successful - Found ${stationsData.length} stations`);
        
        // Test Station Login
        console.log('\n3️⃣ Testing Station Login...');
        const stationResponse = await fetch('http://localhost:5000/api/station-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_code: 'TSA-001' })
        });
        
        if (!stationResponse.ok) {
            throw new Error(`Station Login Failed: ${stationResponse.status}`);
        }
        
        const stationData = await stationResponse.json();
        console.log('✅ Station Login Successful');
        console.log(`   Token: ${stationData.token.substring(0, 30)}...`);
        
        // Test Dashboard
        console.log('\n4️⃣ Testing Dashboard...');
        const dashboardResponse = await fetch('http://localhost:5000/api/dashboard', {
            headers: { 'Authorization': `Bearer ${stationData.token}` }
        });
        
        if (!dashboardResponse.ok) {
            throw new Error(`Dashboard Fetch Failed: ${dashboardResponse.status}`);
        }
        
        const dashboardData = await dashboardResponse.json();
        console.log('✅ Dashboard Fetch Successful');
        console.log(`   Station Name: ${dashboardData.station?.station_name || 'N/A'}`);
        
        console.log('\n🎉 ALL TESTS PASSED! System is working perfectly.');
        
    } catch (error) {
        console.error('❌ Test Failed:', error.message);
    }
};

testFinal();
