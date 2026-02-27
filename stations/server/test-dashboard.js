const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/dashboard',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    console.log(`✅ Response status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const jsonData = JSON.parse(data);
            console.log('✅ Dashboard Data Received:');
            console.log(`   Total Stations: ${jsonData.totalStations}`);
            console.log(`   Total Suspects: ${jsonData.totalSuspects}`);
            console.log(`   Total Cases: ${jsonData.totalCases}`);
            console.log(`   Active Cases: ${jsonData.activeCases}`);
            console.log(`   Wanted Suspects: ${jsonData.wantedSuspects}`);
            console.log(`   In Custody: ${jsonData.inCustodySuspects}`);
            
            if (jsonData.summary) {
                console.log('   Summary:');
                console.log(`     Stations by Type:`, jsonData.summary.stationsByType);
                console.log(`     Suspects by Status:`, jsonData.summary.suspectsByStatus);
                console.log(`     Cases by Type:`, jsonData.summary.casesByType);
            }
        } catch (e) {
            console.log('❌ Failed to parse JSON');
        }
    });
});

req.on('error', (e) => {
    console.error('❌ Request error:', e.message);
});

req.end();

console.log('🔍 Testing /api/dashboard endpoint...');
