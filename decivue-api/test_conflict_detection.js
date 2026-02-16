/**
 * Test Script: Automatic Conflict Detection System
 * Uses built-in http module (no external dependencies)
 * 
 * Usage: node test_conflict_detection.js
 * Requires: API server running on localhost:3001
 */

const http = require('http');

const BASE = 'http://localhost:3000';

function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE);
        const payload = body ? JSON.stringify(body) : null;
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode >= 400) {
                        reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || data}`));
                    } else {
                        resolve(parsed);
                    }
                } catch (e) {
                    reject(new Error(`Failed to parse response (HTTP ${res.statusCode}): ${data.substring(0, 200)}`));
                }
            });
        });

        req.on('error', (err) => {
            reject(new Error(`Connection error: ${err.message} — Is the API server running on port 3000?`));
        });

        if (payload) req.write(payload);
        req.end();
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
    console.log('=== Conflict Detection System Test ===\n');
    let decisionA_id = null;
    let decisionB_id = null;

    try {
        // Step 1: Create Decision A with confidence = 63
        console.log('1) Creating Decision A (confidence: 63)...');
        const resA = await request('POST', '/api/decisions', {
            title: 'TEST_CONFLICT_A_' + Date.now(),
            context: 'Test decision for conflict detection',
            decision_type: 'strategic',
            initial_confidence: 63,
            current_confidence: 63,
            risk_level: 'Medium',
            impact_level: 'Medium',
            lifecycle_state: 'Active'
        });

        if (!resA.success) throw new Error('Failed to create Decision A: ' + resA.message);
        decisionA_id = resA.data.id;
        console.log('   Created Decision A:', decisionA_id);
        console.log('   Confidence:', resA.data.current_confidence);

        await sleep(500);

        // Step 2: Create Decision B with confidence = 75 (conflicts with 63)
        console.log('\n2) Creating Decision B (confidence: 75 - should conflict with 63)...');
        const resB = await request('POST', '/api/decisions', {
            title: 'TEST_CONFLICT_B_' + Date.now(),
            context: 'Test decision for conflict detection - conflicting',
            decision_type: 'operational',
            initial_confidence: 75,
            current_confidence: 75,
            risk_level: 'Medium',
            impact_level: 'Medium',
            lifecycle_state: 'Active'
        });

        if (!resB.success) throw new Error('Failed to create Decision B: ' + resB.message);
        decisionB_id = resB.data.id;
        console.log('   Created Decision B:', decisionB_id);
        console.log('   Confidence:', resB.data.current_confidence);

        await sleep(500);

        // Step 3: Check conflicts for Decision B
        console.log('\n3) Fetching conflicts for Decision B...');
        const conflictsB = await request('GET', `/api/decisions/${decisionB_id}/conflicts`);
        console.log('   Conflicts found:', conflictsB.count);
        if (conflictsB.data && conflictsB.data.length > 0) {
            conflictsB.data.forEach(c => {
                console.log('   -> Conflicts with:', c.conflictingDecision.title, '(confidence:', c.conflictingDecision.confidence + ')');
                console.log('      Notes:', c.notes);
            });
        }

        // Step 4: Check conflicts for Decision A
        console.log('\n4) Fetching conflicts for Decision A...');
        const conflictsA = await request('GET', `/api/decisions/${decisionA_id}/conflicts`);
        console.log('   Conflicts found:', conflictsA.count);

        // Step 5: Reload decisions to check confidence reduction
        console.log('\n5) Checking confidence after health recalculation...');
        const reloadA = await request('GET', `/api/decisions/${decisionA_id}`);
        const reloadB = await request('GET', `/api/decisions/${decisionB_id}`);
        console.log('   Decision A confidence:', reloadA.data.current_confidence, '(initial: 63)');
        console.log('   Decision B confidence:', reloadB.data.current_confidence, '(initial: 75)');

        // Validate results
        console.log('\n=== Test Results ===');
        const conflictsDetected = conflictsB.count > 0;
        const biDirectional = conflictsA.count > 0;

        console.log('Conflict auto-detected:', conflictsDetected ? 'PASS' : 'FAIL');
        console.log('Bi-directional conflict:', biDirectional ? 'PASS' : 'FAIL');

        if (conflictsDetected && biDirectional) {
            console.log('\nALL TESTS PASSED!');
        } else {
            console.log('\nSOME TESTS FAILED - check the output above');
        }

    } catch (error) {
        console.error('\nTest Error:', error.message);
    } finally {
        // Cleanup
        console.log('\nCleaning up test data...');
        try {
            if (decisionA_id) await request('DELETE', `/api/decisions/${decisionA_id}`);
            if (decisionB_id) await request('DELETE', `/api/decisions/${decisionB_id}`);
            console.log('   Test data cleaned up');
        } catch (cleanupErr) {
            console.error('   Cleanup failed:', cleanupErr.message);
        }
    }
}

runTest();
