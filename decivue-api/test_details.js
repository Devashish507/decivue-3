const http = require('http');

// First, get the list of decisions to find a valid ID
const listOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/decisions',
    method: 'GET'
};

console.log('Step 1: Getting list of decisions...\n');

const listReq = http.request(listOptions, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.success && json.data.length > 0) {
                const firstDecision = json.data[0];
                console.log(`✅ Found ${json.data.length} decisions`);
                console.log(`\nStep 2: Testing details for: "${firstDecision.title}"`);
                console.log(`ID: ${firstDecision.id}\n`);

                // Now test the details endpoint
                const detailOptions = {
                    hostname: 'localhost',
                    port: 5000,
                    path: `/api/decisions/${firstDecision.id}`,
                    method: 'GET'
                };

                const detailReq = http.request(detailOptions, (detailRes) => {
                    let detailData = '';

                    detailRes.on('data', (chunk) => {
                        detailData += chunk;
                    });

                    detailRes.on('end', () => {
                        try {
                            const detailJson = JSON.parse(detailData);
                            if (detailJson.success) {
                                console.log('✅ Decision Details API Working!\n');
                                console.log('Response includes:');
                                console.log('- Title:', detailJson.data.title);
                                console.log('- Context:', detailJson.data.context ? 'Yes' : 'No');
                                console.log('- Assumptions:', detailJson.data.assumptions?.length || 0);
                                console.log('- History:', detailJson.data.history?.length || 0);
                                console.log('- Parent:', detailJson.data.parent ? detailJson.data.parent.title : 'None');
                                console.log('- Health Status:', detailJson.data.calculated_health?.status);
                                console.log('- Health Score:', detailJson.data.calculated_health?.score);
                            } else {
                                console.log('❌ Details API Error:', detailJson.message);
                            }
                        } catch (e) {
                            console.log('❌ Failed to parse details response:', e.message);
                            console.log('Response:', detailData.substring(0, 200));
                        }
                    });
                });

                detailReq.on('error', (e) => {
                    console.error('❌ Details request failed:', e.message);
                });

                detailReq.end();
            } else {
                console.log('❌ No decisions found');
            }
        } catch (e) {
            console.log('❌ Failed to parse list response:', e.message);
        }
    });
});

listReq.on('error', (e) => {
    console.error('❌ List request failed:', e.message);
});

listReq.end();
