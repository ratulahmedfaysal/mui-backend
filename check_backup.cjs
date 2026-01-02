const axios = require('axios');

async function testBackup() {
    try {
        // No auth header, should be 401/403
        const res = await axios.get('http://localhost:5000/api/database/backup');
        console.log('Response:', res.data);
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        }
    }
}

testBackup();
