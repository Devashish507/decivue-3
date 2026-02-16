const API_URL = 'http://127.0.0.1:5000/api/decisions';

async function testWizardSubmission() {
    try {
        console.log('1. Creating a Parent Decision...');
        const parentRes = await fetch(`${API_URL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Test Parent Decision',
                context: 'Context for parent',
                decision_type: 'strategic',
                initial_confidence: 80
            })
        });
        const parentData = await parentRes.json();
        const parentId = parentData.data.id;
        console.log('Parent Created:', parentId);

        console.log('2. Creating a Sub-Decision via Wizard endpoint...');
        const wizardPayload = {
            basics: {
                title: 'Test Sub Decision via Wizard',
                description: 'Should have parent',
                initialConfidence: 50,
                parentDecisionId: parentId // Simulating what WizardStep1Basics sends
            },
            context: {
                parentDecisionId: parentId
            },
            type: { decisionType: 'operational' },
            relationships: [],
            reasoning: {}
        };

        const childRes = await fetch(`${API_URL}/wizard/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(wizardPayload)
        });
        const childData = await childRes.json();
        const child = childData.data;
        console.log('Child Created:', child.id);
        console.log('Child Parent ID:', child.parent_id);

        if (child.parent_id === parentId) {
            console.log('SUCCESS: Parent ID was correctly set.');
        } else {
            console.error('FAILURE: Parent ID mismatch. Expected:', parentId, 'Got:', child.parent_id);
        }

        console.log('3. Checking Library (getAllDecisions)...');
        const listRes = await fetch(`${API_URL}`);
        const listData = await listRes.json();
        const list = listData.data;
        const foundChild = list.find(d => d.id === child.id);

        if (foundChild) {
            console.error('FAILURE: Child decision found in main library list!');
            console.log('Found Child Details:', foundChild);
        } else {
            console.log('SUCCESS: Child decision NOT found in main library list.');
        }

        // 4. Cleanup
        await fetch(`${API_URL}/${parentId}`, { method: 'DELETE' });
        // cleanup child just in case cascade failed (though we implemented cascade)
        // await fetch(`${API_URL}/${child.id}`, { method: 'DELETE' });

    } catch (error) {
        console.error('Error:', error);
    }
}

testWizardSubmission();
