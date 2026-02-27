// Create a test suspect
const createTestSuspect = async () => {
    try {
        console.log('👤 Creating Test Suspect...\n');
        
        // First login as station
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
        
        // Create a suspect
        const suspectData = JSON.stringify({
            full_name: 'John Doe Test Suspect',
            date_of_birth: '1990-01-01',
            crime_committed: 'Test Crime',
            location_of_crime: 'Test Location',
            place_of_arrest: 'Test Arrest Location',
            date_of_arrest: '2026-01-15',
            nationality: 'Test Nationality',
            physical_description: 'Test Description',
            risk_level: 'high',
            is_national: false
        });
        
        const createResponse = await fetch('http://localhost:5000/api/suspects', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${loginData.token}`,
                'Content-Type': 'application/json'
            },
            body: suspectData
        });
        
        console.log(`Create Suspect Status: ${createResponse.status}`);
        
        if (createResponse.ok) {
            const createData = await createResponse.json();
            console.log('✅ Test Suspect Created Successfully!');
            console.log(`   Name: ${createData.suspect.full_name}`);
            console.log(`   ID: ${createData.suspect.suspect_id}`);
            console.log(`   Risk: ${createData.suspect.risk_level}`);
        } else {
            const errorText = await createResponse.text();
            console.log('❌ Failed to create test suspect');
            console.log(`   Error: ${errorText}`);
        }
        
    } catch (error) {
        console.error('❌ Test Error:', error.message);
    }
};

createTestSuspect();
