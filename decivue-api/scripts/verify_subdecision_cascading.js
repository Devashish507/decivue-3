// Node 18+ has global fetch

const BASE_URL = 'http://localhost:5000/api/decisions';

async function verifySubDecisionCompletion() {
    console.log('--- Starting Sub-Decision Completion Verification ---');

    try {
        // 1. Get all decisions to find a parent and child
        const resp = await fetch(BASE_URL);
        const data = await resp.json();

        console.log(`Total decisions found: ${data.data.length}`);
        data.data.forEach(d => {
            console.log(`- ${d.title}: Children: ${d.children?.length || 0}`);
        });

        const mainDecision = data.data.find(d => d.children && d.children.length > 0);

        if (!mainDecision) {
            console.log('No decision with sub-decisions found. Run seed script first.');
            return;
        }

        const subDecision = mainDecision.children[0];
        console.log(`Found Parent: ${mainDecision.title} (ID: ${mainDecision.id})`);
        console.log(`Initial Parent Progress: ${mainDecision.progress_percentage}%`);
        console.log(`Found Sub-Decision: ${subDecision.title} (ID: ${subDecision.id})`);

        // 2. Mark Sub-Decision as Completed
        console.log('\nMarking sub-decision as Completed...');
        const updateResp = await fetch(`${BASE_URL}/sub-decision/${subDecision.id}/progress`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'Completed',
                completion_percentage: 100
            })
        });

        const updateResult = await updateResp.json();
        if (!updateResult.success) {
            throw new Error(`Failed to update progress: ${updateResult.message}`);
        }
        console.log('Progress update call successful.');

        // 3. Fetch Parent again to verify cascading
        console.log('\nVerifying parent progress update...');
        const parentResp = await fetch(`${BASE_URL}/${mainDecision.id}`);
        const parentData = await parentResp.json();
        const updatedParent = parentData.data;

        console.log(`New Parent Progress: ${updatedParent.progress_percentage}%`);
        console.log(`New Parent Confidence: ${updatedParent.current_confidence}`);
        console.log(`New Parent Health: ${updatedParent.calculated_health?.score}`);

        if (updatedParent.progress_percentage > mainDecision.progress_percentage) {
            console.log('\u2705 SUCCESS: Parent progress correctly increased.');
        } else if (mainDecision.progress_percentage === 100) {
            console.log('\u2139 INFO: Parent was already at 100%.');
        } else {
            console.log('\u274C FAILURE: Parent progress did not increase.');
        }

        console.log('\n--- Verification Complete ---');

    } catch (err) {
        console.error('\u274C Error during verification:', err.message);
    }
}

verifySubDecisionCompletion();
