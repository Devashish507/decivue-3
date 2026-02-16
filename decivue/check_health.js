fetch('http://localhost:5000/api/decisions')
    .then(res => res.json())
    .then(data => {
        console.log(`Total decisions: ${data.data.length}\n`);

        const rootDecisions = data.data.filter(d => !d.parent_decision_id);
        console.log(`Root decisions: ${rootDecisions.length}\n`);

        console.log('Health Status Summary:');
        data.data.forEach(d => {
            const health = d.calculated_health;
            console.log(`${d.title}:`);
            console.log(`  Confidence: ${d.current_confidence}%`);
            console.log(`  Health: ${health?.status || 'N/A'} (score: ${health?.score || 'N/A'})`);
            console.log(`  Conflicts: ${health?.conflict_count || 0}\n`);
        });
    })
    .catch(err => console.error(err));
