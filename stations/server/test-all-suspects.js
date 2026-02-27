// Test the all suspects endpoint
const testAllSuspects = async () => {
    try {
        console.log('🔍 Testing All Suspects Endpoint...\n');
        
        // First login as station to get token
        const loginResponse = await fetch('http://localhost:5000/api/station-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_code: 'TSA-001' })
        });
        
        if (!loginResponse.ok) {
            throw new Error('Login failed');
        }
        
        const loginData = await loginResponse.json();
        console.log('✅ Station login successful');
        
        // Now test all suspects endpoint
        const suspectsResponse = await fetch('http://localhost:5000/api/suspects', {
            headers: {
                'Authorization': `Bearer ${loginData.token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`Suspects API Status: ${suspectsResponse.status}`);
        
        if (suspectsResponse.ok) {
            const suspectsData = await suspectsResponse.json();
            console.log(`✅ All Suspects Endpoint Working!`);
            console.log(`   Found ${suspectsData.length} suspects`);
            
            suspectsData.forEach((suspect, index) => {
                console.log(`   ${index + 1}. ${suspect.full_name || suspect.name} (${suspect.suspect_id})`);
            });
        } else {
            const errorText = await suspectsResponse.text();
            console.log('❌ All Suspects Endpoint Failed');
            console.log(`   Error: ${errorText}`);
        }
        
    } catch (error) {
        console.error('❌ Test Error:', error.message);
    }
};

testAllSuspects();
