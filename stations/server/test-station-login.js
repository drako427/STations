async function testStationLogin() {
    try {
        console.log('🔓 Testing station login...');
        
        const response = await fetch('http://localhost:5000/api/station-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ access_code: 'FHIS1RP' })
        });

        const data = await response.json();
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response data:', data);
        
        if (response.ok) {
            console.log('✅ Login successful');
            console.log('🔑 Token:', data.token ? 'exists' : 'missing');
            console.log('👤 User:', data.user ? 'exists' : 'missing');
            if (data.user) {
                console.log('👤 User data:', JSON.stringify(data.user, null, 2));
            }
        } else {
            console.log('❌ Login failed:', data.error);
        }
        
    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

testStationLogin();
