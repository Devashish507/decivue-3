const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/decisions/?includeSubDecisions=true',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log(`Successfully parsed JSON. Data length: ${json.data ? json.data.length : 'N/A'}`);
            if (res.statusCode !== 200) console.log('Response Body:', data);
        } catch (e) {
            console.log('BODY:', data);
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
