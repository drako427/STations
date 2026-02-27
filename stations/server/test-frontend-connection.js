// Test frontend-style fetch with CORS
const testFrontendConnection = async () => {
    try {
        console.log('🔍 Testing frontend-style fetch...');
        
        const response = await fetch('http://localhost:5000/api/auth/naked-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'dpo',
                password: 'admin', 
                role: 'dpo'
            })
        });
        
        console.log(`Response status: ${response.status}`);
        console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Frontend connection successful!');
            console.log(`Token received: ${data.token.substring(0, 50)}...`);
        } else {
            console.log('❌ Frontend connection failed');
            const errorData = await response.text();
            console.log(`Error: ${errorData}`);
        }
    } catch (error) {
        console.error('❌ Fetch error:', error.message);
    }
};

testFrontendConnection();
