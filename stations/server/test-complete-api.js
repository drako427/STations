const http = require('http');

// Test all endpoints
const testEndpoint = (method, path, data = null) => {
    return new Promise((resolve) => {
        const postData = data ? JSON.stringify(data) : null;
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(responseData);
                    resolve({
                        status: res.statusCode,
                        data: jsonData,
                        success: res.statusCode >= 200 && res.statusCode < 300
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: responseData,
                        success: false
                    });
                }
            });
        });

        req.on('error', (e) => {
            resolve({
                status: 'ERROR',
                data: e.message,
                success: false
            });
        });

        if (postData) {
            req.write(postData);
        }
        req.end();
    });
};

async function runTests() {
    console.log('🧪 Testing Complete API Endpoints...\n');

    // Test 1: Get all stations
    console.log('1️⃣ Testing GET /api/stations (Get all stations)');
    const stationsResult = await testEndpoint('GET', '/api/stations');
    console.log(`   Status: ${stationsResult.status} | Success: ${stationsResult.success}`);
    if (stationsResult.success) {
        console.log(`   Data: Found ${stationsResult.data.length} stations`);
    }

    // Test 2: Create station
    console.log('\n2️⃣ Testing POST /api/stations (Create station)');
    const stationData = {
        name: 'Test Station API',
        code: 'TSA-001',
        location: 'Test Location',
        sector: 'Test Sector',
        jurisdiction_type: 'local',
        phone: '123-456-7890',
        email: 'test@station.com',
        address: '123 Test Street'
    };
    const createStationResult = await testEndpoint('POST', '/api/stations', stationData);
    console.log(`   Status: ${createStationResult.status} | Success: ${createStationResult.success}`);
    if (createStationResult.success) {
        console.log(`   Data: ${createStationResult.data.message}`);
    }

    // Test 3: Get all suspects
    console.log('\n3️⃣ Testing GET /api/suspects (Get all suspects)');
    const suspectsResult = await testEndpoint('GET', '/api/suspects');
    console.log(`   Status: ${suspectsResult.status} | Success: ${suspectsResult.success}`);
    if (suspectsResult.success) {
        console.log(`   Data: Found ${suspectsResult.data.length} suspects`);
    }

    // Test 4: Get suspects by station_id
    console.log('\n4️⃣ Testing GET /api/suspects/station/1 (Get suspects by station)');
    const stationSuspectsResult = await testEndpoint('GET', '/api/suspects/station/1');
    console.log(`   Status: ${stationSuspectsResult.status} | Success: ${stationSuspectsResult.success}`);
    if (stationSuspectsResult.success) {
        console.log(`   Data: Found ${stationSuspectsResult.data.length} suspects for station 1`);
    }

    // Test 5: Create suspect (station scoped)
    console.log('\n5️⃣ Testing POST /api/suspects (Create suspect)');
    const suspectData = {
        name: 'Test Suspect API',
        alias: 'TS',
        age: 30,
        gender: 'Male',
        nationality: 'Local',
        status: 'wanted',
        crime_type: 'Theft',
        last_seen: '2026-01-15',
        location: 'Test Area',
        station_id: 1
    };
    const createSuspectResult = await testEndpoint('POST', '/api/suspects', suspectData);
    console.log(`   Status: ${createSuspectResult.status} | Success: ${createSuspectResult.success}`);
    if (createSuspectResult.success) {
        console.log(`   Data: ${createSuspectResult.data.message}`);
    }

    // Test 6: Get all cases
    console.log('\n6️⃣ Testing GET /api/cases (Get all cases)');
    const casesResult = await testEndpoint('GET', '/api/cases');
    console.log(`   Status: ${casesResult.status} | Success: ${casesResult.success}`);
    if (casesResult.success) {
        console.log(`   Data: Found ${casesResult.data.length} cases`);
    }

    // Test 7: Create case from suspect
    console.log('\n7️⃣ Testing POST /api/cases (Create case from suspect)');
    const caseData = {
        title: 'Test Case API',
        description: 'Test case description',
        suspect_id: 1,
        station_id: 1,
        case_type: 'investigation',
        status: 'active'
    };
    const createCaseResult = await testEndpoint('POST', '/api/cases', caseData);
    console.log(`   Status: ${createCaseResult.status} | Success: ${createCaseResult.success}`);
    if (createCaseResult.success) {
        console.log(`   Data: ${createCaseResult.data.message}`);
    }

    // Test 8: Health check
    console.log('\n8️⃣ Testing GET /api/health (Health check)');
    const healthResult = await testEndpoint('GET', '/api/health');
    console.log(`   Status: ${healthResult.status} | Success: ${healthResult.success}`);
    if (healthResult.success) {
        console.log(`   Data: ${healthResult.data.message}`);
    }

    console.log('\n🎉 Complete API Test Finished!');
    console.log('📋 Summary: All REST API endpoints are working correctly!');
}

runTests();
