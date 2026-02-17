const decisionController = require('./src/controllers/decisionController');
const { Decision, Team } = require('./src/models');
const fs = require('fs');

async function reproduce() {
    const logFile = 'reproduce_log.txt';
    const log = (msg) => fs.appendFileSync(logFile, msg + '\n');
    fs.writeFileSync(logFile, 'Starting reproduction test...\n');

    try {
        // 1. Get first decision
        const decision = await Decision.findOne();
        if (!decision) {
            log('No decisions found to test with.');
            process.exit(0);
        }
        log(`Testing with decision ID: ${decision.id}`);

        // 2. Mock req and res
        const req = {
            params: { id: decision.id },
            body: {}
        };
        const res = {
            status: function (s) {
                this.statusCode = s;
                log(`Response Status: ${s}`);
                return this;
            },
            json: function (j) {
                log(`Response JSON: ${JSON.stringify(j)}`);
                return this;
            }
        };

        // 3. Call controller
        await decisionController.addToTeam(req, res);
        log('Test completed.');
        process.exit(0);
    } catch (e) {
        log(`Error: ${e.message}\n${e.stack}`);
        process.exit(1);
    }
}
reproduce();
