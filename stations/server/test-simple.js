const { default: fetch } = require('node-fetch');

async function testSimple() {
    try {
        console.log('🔍 Testing simple endpoint...');
        
        const response = await fetch('http://localhost:5000/api');
        const data = await response.json();
        console.log('✅ Response status:', response.status);
        console.log('✅ Response data:', data);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testSimple();
