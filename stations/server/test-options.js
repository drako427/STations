// Test OPTIONS preflight request
const testOptions = () => {
    console.log('🔍 Testing OPTIONS preflight...');
    
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/naked-login',
        method: 'OPTIONS',
        headers: {
            'Origin': 'http://10.0.5.21:3000',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
        }
    };

    const req = require('http').request(options, (res) => {
        console.log(`OPTIONS Response status: ${res.statusCode}`);
        console.log('OPTIONS Response headers:');
        console.log(`  Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin']}`);
        console.log(`  Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods']}`);
        console.log(`  Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers']}`);
        
        if (res.statusCode === 200) {
            console.log('✅ OPTIONS preflight successful!');
        } else {
            console.log('❌ OPTIONS preflight failed');
        }
    });

    req.on('error', (e) => {
        console.error('❌ OPTIONS request error:', e.message);
    });

    req.end();
};

testOptions();
