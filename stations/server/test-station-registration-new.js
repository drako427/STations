// Test station registration with access code
const testStationRegistration = async () => {
    try {
        console.log('🏢 Testing Station Registration...\n');
        
        const response = await fetch('http://localhost:5000/api/stations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Test New Station',
                code: 'TNS-123456789',
                location: 'Test Location',
                sector: 'Test Sector',
                jurisdiction_type: 'local',
                phone: '123-456-7890',
                email: 'test@station.com',
                address: '123 Test Street'
            })
        });
        
        console.log(`Response status: ${response.status}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Station Registration Successful!');
            console.log(`   Message: ${data.message}`);
            console.log(`   Station Name: ${data.station.station_name}`);
            console.log(`   Station Code: ${data.station.station_code}`);
            console.log(`   Access Code: ${data.access_code}`);
            console.log(`   Station ID: ${data.station.station_id}`);
        } else {
            const errorData = await response.json();
            console.log('❌ Station Registration Failed');
            console.log(`   Error: ${errorData.error || 'Unknown error'}`);
        }
        
    } catch (error) {
        console.error('❌ Station Registration Error:', error.message);
    }
};

testStationRegistration();
