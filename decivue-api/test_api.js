const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/decisions',
    method: 'GET'
};

console.log('Testing GET /api/decisions...\n');

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.success) {
                console.log(`✅ API Working! Found ${json.data.length} decisions`);
                console.log('\nFirst 3 decisions:');
                json.data.slice(0, 3).forEach((d, i) => {
                    console.log(`${i + 1}. ${d.title} (${d.current_confidence}% confidence, ${d.calculated_health?.status})`);
                });
            } else {
                console.log('❌ API returned error:', json.message);
            }
        } catch (e) {
            console.log('❌ Failed to parse response:', e.message);
            console.log('Raw response:', data.substring(0, 500));
        }
    });
});

req.on('error', (e) => {
    console.error('❌ Request failed:', e.message);
});

req.end();
