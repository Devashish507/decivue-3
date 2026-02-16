console.log('Testing decision detail endpoint after all fixes...');
const decisionId = '018ab92d-c68d-42d5-bfa6-4a9f00cded16';
console.log('Fetching decision:', decisionId);

fetch(`http://localhost:5000/api/decisions/${decisionId}`)
    .then(res => {
        console.log('Response status:', res.status);
        return res.json();
    })
    .then(data => {
        console.log('Success:', data.success);
        if (data.success) {
            console.log('✅ Decision found!');
            console.log('Title:', data.data.title);
            console.log('Confidence:', data.data.current_confidence);
            console.log('Health Status:', data.data.calculated_health?.status);
            console.log('Health Score:', data.data.calculated_health?.score);
            console.log('Assumptions:', data.data.assumptions?.length || 0);
            console.log('History events:', data.data.history?.length || 0);
            console.log('Parent decision:', data.data.parent?.title || 'None');
            console.log('\nFull response:', JSON.stringify(data, null, 2));
        } else {
            console.log('❌ Error:', data.message);
        }
    })
    .catch(err => console.error('❌ Network error:', err.message));
