// Native fetch is available in Node 18+

const BASE_URL = 'http://localhost:5000/api/decisions';

async function verifyHealthEngine() {
    console.log('--- Starting Health Engine Verification ---');

    try {
        // 1. Get a decision to test (preferably one with sub-decisions)
        console.log('1. Fetching decisions...');
        const listRes = await fetch(BASE_URL);
        const listData = await listRes.json();

        if (!listData.success || listData.data.length === 0) {
            console.error('No decisions found to test.');
            return;
        }

        const decision = listData.data.find(d => d.children && d.children.length > 0) || listData.data[0];
        console.log(`Selected Decision: ${decision.title} (ID: ${decision.id})`);
        console.log(`Initial Health: ${decision.calculated_health?.score}, Status: ${decision.calculated_health?.status}`);

        // 2. Simulate Review
        console.log('\n2. Simulating Review...');
        const reviewRes = await fetch(`${BASE_URL}/${decision.id}/review-decision`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                notes: 'Verified by automated script.',
                status: 'Completed'
            })
        });
        const reviewData = await reviewRes.json();
        console.log('Review Response:', reviewData.message);
        if (reviewData.success) {
            console.log('New Health Score:', reviewData.data.score);
        } else {
            console.error('Review Failed:', reviewData);
        }

        // 3. Trigger Daily Update
        console.log('\n3. Triggering Daily Update...');
        const updateRes = await fetch(`${BASE_URL}/trigger/daily-update`, {
            method: 'POST'
        });
        const updateData = await updateRes.json();
        console.log('Update Response:', updateData.message);
        console.log('Updated Decisions Count:', updateData.results.length);

        // 4. Verify Final State
        console.log('\n4. Verifying Final State...');
        const finalRes = await fetch(`${BASE_URL}/${decision.id}`);
        const finalData = await finalRes.json();
        const finalDecision = finalData.data;

        console.log(`Final Health: ${finalDecision.calculated_health.score}`);
        console.log(`Final Status: ${finalDecision.calculated_health.status}`);
        console.log(`Time Status: ${finalDecision.calculated_health.time_status}`);
        console.log(`Last Reviewed: ${finalDecision.last_reviewed_at}`);

        if (finalDecision.calculated_health.score >= decision.calculated_health?.score) {
            console.log('PASS: Health score maintained or improved.');
        } else {
            console.log('NOTE: Health score decreased (expected if time decay > review boost).');
        }

    } catch (err) {
        console.error('Verification Error:', err);
    }
}



verifyHealthEngine();
