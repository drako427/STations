const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/properties',
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
            console.log('✅ Properties Data Received:');
            console.log(`   Found ${jsonData.length} properties`);
            jsonData.forEach(property => {
                console.log(`   🔹 ${property.name} - ${property.status} - $${property.value}`);
            });
        } catch (e) {
            console.log('❌ Failed to parse JSON');
        }
    });
});

req.on('error', (e) => {
    console.error('❌ Request error:', e.message);
});

req.end();

console.log('🔍 Testing /api/properties endpoint...');
