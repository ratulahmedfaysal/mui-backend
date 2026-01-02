const axios = require('axios');

async function checkReviews() {
    try {
        const res = await axios.get('http://localhost:5000/api/settings');
        console.log('Reviews:', JSON.stringify(res.data.reviews, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkReviews();
