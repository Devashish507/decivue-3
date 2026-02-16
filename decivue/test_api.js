fetch('http://localhost:5000/api/decisions')
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            console.error('API returned error:', data);
            return;
        }

        console.log(`\n✅ API is working! Found ${data.data.length} decisions\n`);

        if (data.data.length === 0) {
            console.log('⚠️  No decisions in database. Run: node direct_seed.js');
            return;
        }

        console.log('First decision:');
        const first = data.data[0];
        console.log(`  ID: ${first.id}`);
        console.log(`  Title: ${first.title}`);
        console.log(`  URL: http://localhost:5174/decisions/${first.id}`);
        console.log(`\n✅ Copy the URL above and paste it in your browser!\n`);
    })
    .catch(err => {
        console.error('❌ API Error:', err.message);
        console.log('Make sure backend is running on port 5000');
    });
