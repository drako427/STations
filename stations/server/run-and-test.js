const { spawn } = require('child_process');
const http = require('http');

// Start the server
console.log('🚀 Starting server...');
const server = spawn('node', ['working-server.js'], {
    stdio: 'pipe',
    cwd: __dirname
});

let serverOutput = '';
server.stdout.on('data', (data) => {
    const output = data.toString();
    serverOutput += output;
    console.log(output);
    
    // Wait for server to start, then test
    if (output.includes('STATIONS Backend running')) {
        console.log('⏳ Server started, testing endpoints...');
        
        setTimeout(() => {
            testStationsEndpoint();
        }, 1000);
    }
});

server.stderr.on('data', (data) => {
    console.error('Server error:', data.toString());
});

server.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
});

function testStationsEndpoint() {
    console.log('🔍 Testing /api/stations endpoint...');
    
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/stations',
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
            console.log('✅ Response received');
            try {
                const jsonData = JSON.parse(data);
                console.log(`✅ SUCCESS: Found ${jsonData.length} stations`);
                jsonData.forEach(station => {
                    console.log(`   🔹 ${station.station_code} - ${station.station_name}`);
                });
                
                console.log('\n🎉 STATIONS API is working!');
                console.log('📋 You can now use these station codes for login:');
                console.log('   CPS-001, NDP-002, ESS-003, WPP-004, SCC-005, FHQ-006');
                
                // Keep server running
                console.log('\n🔄 Server is still running. Press Ctrl+C to stop.');
                
            } catch (e) {
                console.log('❌ Failed to parse JSON:', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error('❌ Request error:', e.message);
    });

    req.end();
}
