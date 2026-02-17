const http = require('http');
const fs = require('fs');

const logFile = 'diagnosis.txt';
const log = (msg) => fs.appendFileSync(logFile, msg + '\n');

// Clear log
fs.writeFileSync(logFile, '');

log('Starting diagnosis...');

const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/decisions/test-id/team-map',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
}, (res) => {
    log(`Response Status: ${res.statusCode}`);
    if (res.statusCode === 404) {
        log('Error: 404 Not Found - Route missing or path incorrect.');
    } else if (res.statusCode === 200 || res.statusCode === 201) {
        log('Success: Route exists!');
    } else {
        log(`Unexpected status: ${res.statusCode}`);
    }
});

req.on('error', (e) => {
    log(`Connection Error: ${e.message}`);
    if (e.code === 'ECONNREFUSED') {
        log('Server is NOT running on port 3000.');
    }
});

req.write(JSON.stringify({ teamId: 1 }));
req.end();
