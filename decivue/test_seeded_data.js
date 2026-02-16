console.log('Testing decision details with seeded data...\n');

// Test with the first decision from seed data
fetch('http://localhost:5000/api/decisions')
    .then(res => res.json())
    .then(data => {
        if (data.success && data.data.length > 0) {
            const firstDecision = data.data[0];
            console.log(`Found ${data.data.length} decisions`);
            console.log(`\nTesting with: "${firstDecision.title}"`);
            console.log(`ID: ${firstDecision.id}\n`);

            // Now fetch the details
            return fetch(`http://localhost:5000/api/decisions/${firstDecision.id}`);
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            console.log('✅ Decision Details API Working!');
            console.log('\nDecision Info:');
            console.log('- Title:', data.data.title);
            console.log('- Confidence:', data.data.current_confidence + '%');
            console.log('- Health:', data.data.calculated_health?.status);
            console.log('- Lifecycle:', data.data.lifecycle_state);
            console.log('- Assumptions:', data.data.assumptions?.length || 0);
            console.log('- History Events:', data.data.history?.length || 0);
            console.log('- Last Reviewed:', data.data.last_reviewed_at || 'Never');
            console.log('- Next Review:', data.data.review_due_date || 'Not set');
        } else {
            console.log('❌ Error:', data.message);
        }
    })
    .catch(err => console.error('❌ Error:', err.message));
