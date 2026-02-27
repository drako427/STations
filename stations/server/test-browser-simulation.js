// Test exact browser behavior simulation
const testBrowserSimulation = async () => {
    console.log('🌐 Testing browser simulation...');
    
    try {
        // Step 1: OPTIONS preflight (what browser does first)
        console.log('\n1️⃣ Testing OPTIONS preflight...');
        const optionsResponse = await fetch('http://localhost:5000/api/auth/naked-login', {
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://10.0.5.21:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        });
        
        console.log(`OPTIONS Status: ${optionsResponse.status}`);
        console.log(`OPTIONS Origin Header: ${optionsResponse.headers.get('Access-Control-Allow-Origin')}`);
        
        // Step 2: Actual POST request
        console.log('\n2️⃣ Testing POST request...');
        const postResponse = await fetch('http://localhost:5000/api/auth/naked-login', {
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
        
        console.log(`POST Status: ${postResponse.status}`);
        console.log(`POST Origin Header: ${postResponse.headers.get('Access-Control-Allow-Origin')}`);
        
        if (postResponse.ok) {
            const data = await postResponse.json();
            console.log('✅ Browser simulation successful!');
            console.log(`Token: ${data.token.substring(0, 50)}...`);
        } else {
            console.log('❌ Browser simulation failed');
            const errorText = await postResponse.text();
            console.log(`Error: ${errorText.substring(0, 200)}...`);
        }
        
    } catch (error) {
        console.error('❌ Browser simulation error:', error.message);
    }
};

testBrowserSimulation();
