const http = require('http');

// Get list of all decisions first
const listOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/decisions',
    method: 'GET'
};

console.log('=== Testing Decision Detail Endpoints ===\n');

const listReq = http.request(listOptions, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.success && json.data.length > 0) {
                console.log(`Total decisions found: ${json.data.length}\n`);

                let successCount = 0;
                let failCount = 0;
                const failedDecisions = [];

                // Test each decision sequentially
                const testDecision = (index) => {
                    if (index >= json.data.length) {
                        // All done
                        console.log('\n=== Summary ===');
                        console.log(`✅ Successful: ${successCount}`);
                        console.log(`❌ Failed: ${failCount}`);
                        if (failedDecisions.length > 0) {
                            console.log('\nFailed Decisions:');
                            failedDecisions.forEach(d => {
                                console.log(`  - "${d.title}" (ID: ${d.id})`);
                                console.log(`    Error: ${d.error}`);
                            });
                        }
                        return;
                    }

                    const decision = json.data[index];
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
                                    console.log(`✅ ${index + 1}/${json.data.length} "${decision.title}"`);
                                    successCount++;
                                } else {
                                    console.log(`❌ ${index + 1}/${json.data.length} "${decision.title}"`);
                                    console.log(`   Error: ${detailJson.message}`);
                                    failCount++;
                                    failedDecisions.push({
                                        title: decision.title,
                                        id: decision.id,
                                        error: detailJson.message
                                    });
                                }
                            } catch (e) {
                                console.log(`❌ ${index + 1}/${json.data.length} "${decision.title}"`);
                                console.log(`   Parse Error: ${e.message}`);
                                failCount++;
                                failedDecisions.push({
                                    title: decision.title,
                                    id: decision.id,
                                    error: `Parse error: ${e.message}`
                                });
                            }
                            // Test next decision
                            testDecision(index + 1);
                        });
                    });

                    detailReq.on('error', (e) => {
                        console.log(`❌ ${index + 1}/${json.data.length} "${decision.title}"`);
                        console.log(`   Request Error: ${e.message}`);
                        failCount++;
                        failedDecisions.push({
                            title: decision.title,
                            id: decision.id,
                            error: `Request error: ${e.message}`
                        });
                        // Test next decision
                        testDecision(index + 1);
                    });

                    detailReq.end();
                };

                // Start testing from first decision
                testDecision(0);
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
