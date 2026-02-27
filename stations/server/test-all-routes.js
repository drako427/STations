const http = require('http');

const testRoute = (path, method = 'GET') => {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    path,
                    method,
                    status: res.statusCode,
                    data: data.substring(0, 100) + (data.length > 100 ? '...' : '')
                });
            });
        });

        req.on('error', (e) => {
            resolve({
                path,
                method,
                status: 'ERROR',
                data: e.message
            });
        });

        if (method === 'POST') {
            req.write(JSON.stringify({ test: 'data' }));
        }
        
        req.end();
    });
};

async function testAllRoutes() {
    console.log('🔍 Testing all routes...\n');
    
    const routes = [
        { path: '/api', method: 'GET' },
        { path: '/api/health', method: 'GET' },
        { path: '/api/stations', method: 'GET' },
        { path: '/api/auth/naked-login', method: 'POST' },
        { path: '/api/station-login', method: 'POST' }
    ];
    
    for (const route of routes) {
        const result = await testRoute(route.path, route.method);
        console.log(`${result.method} ${result.path} -> ${result.status}`);
        if (result.status === 200) {
            console.log(`   ✅ SUCCESS: ${result.data}`);
        } else {
            console.log(`   ❌ ERROR: ${result.data}`);
        }
        console.log('');
    }
}

testAllRoutes();
