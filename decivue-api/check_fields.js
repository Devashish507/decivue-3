const http = require('http');

// Test all decisions and check for missing fields
const listOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/decisions',
    method: 'GET'
};

console.log('Checking for missing fields in decisions...\n');

const listReq = http.request(listOptions, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.success && json.data.length > 0) {
                json.data.forEach((decision, index) => {
                    console.log(`${index + 1}. "${decision.title}"`);
                    console.log(`   ID: ${decision.id}`);

                    // Check for potential issues
                    const issues = [];

                    if (!decision.title) issues.push('Missing title');
                    if (!decision.context) issues.push('Missing context');
                    if (!decision.lifecycle_state) issues.push('Missing lifecycle_state');
                    if (!decision.current_confidence) issues.push('Missing current_confidence');
                    if (!decision.risk_level) issues.push('Missing risk_level');
                    if (!decision.impact_level) issues.push('Missing impact_level');
                    if (!decision.calculated_health) issues.push('Missing calculated_health');
                    if (!decision.calculated_health?.status) issues.push('Missing health status');

                    if (issues.length > 0) {
                        console.log(`   ⚠️  Issues: ${issues.join(', ')}`);
                    } else {
                        console.log(`   ✅ All required fields present`);
                    }
                    console.log('');
                });
            }
        } catch (e) {
            console.log('❌ Failed to parse response:', e.message);
        }
    });
});

listReq.on('error', (e) => {
    console.error('❌ Request failed:', e.message);
});

listReq.end();
