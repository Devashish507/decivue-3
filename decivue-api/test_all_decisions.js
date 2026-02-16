const http = require('http');

// Test all decisions
const listOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/decisions',
    method: 'GET'
};

console.log('Testing all decision details endpoints...\n');

const listReq = http.request(listOptions, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.success && json.data.length > 0) {
                console.log(`Found ${json.data.length} decisions\n`);

                // Test each decision's details endpoint
                json.data.forEach((decision, index) => {
                    setTimeout(() => {
                        const detailOptions = {
                            hostname: 'localhost',
                            port: 5000,
                            path: `/api/decisions/${decision.id}`,
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
                                        console.log(`✅ ${index + 1}. "${decision.title}"`);
                                        console.log(`   ID: ${decision.id}`);
                                        console.log(`   Assumptions: ${detailJson.data.assumptions?.length || 0}`);
                                        console.log(`   History: ${detailJson.data.history?.length || 0}`);
                                        console.log(`   Signals: ${detailJson.data.signals?.length || 0}\n`);
                                    } else {
                                        console.log(`❌ ${index + 1}. "${decision.title}"`);
                                        console.log(`   Error: ${detailJson.message}\n`);
                                    }
                                } catch (e) {
                                    console.log(`❌ ${index + 1}. "${decision.title}"`);
                                    console.log(`   Parse Error: ${e.message}\n`);
                                }
                            });
                        });

                        detailReq.on('error', (e) => {
                            console.log(`❌ ${index + 1}. "${decision.title}"`);
                            console.log(`   Request Error: ${e.message}\n`);
                        });

                        detailReq.end();
                    }, index * 100); // Stagger requests
                });
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
