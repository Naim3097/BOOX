
const https = require('https');

const authToken = 'LP-C64B42C3-MM|dc09cd86-6311-4730-8819-55bba6736620|e68bd67be0597380af9a9c5bcad53b36425308575a6e009f78416d46254fbcd5382494c4bdba79af3ebc3f5b206c333efb1d62852abfd04b48b0ad74a53593ca';
const collectionUuid = 'Dc-E5317E6652-Lx';

const parts = authToken.split('|');

const candidates = [
    { name: 'EnvVar (Exact)', value: collectionUuid },
    { name: 'EnvVar (UpperCase)', value: collectionUuid.toUpperCase() },
    { name: 'AuthToken (Standard UUID)', value: parts[1] },
    { name: 'AuthToken (Prefix)', value: parts[0] }
];

const payloadTemplate = {
    amount: 5.00,
    invoice_ref: 'TEST-' + Date.now(),
    redirect_url: 'https://example.com/success',
    callback_url: 'https://example.com/webhook',
    full_name: 'Test User',
    email: 'test@example.com',
    phone_number: '0123456789'
};

async function testCandidate(candidate) {
    console.log(`\nTesting candidate: ${candidate.name} = ${candidate.value}`);
    
    const payload = {
        ...payloadTemplate,
        collection_uuid: candidate.value
    };

    const data = JSON.stringify(payload);

    const options = {
        hostname: 'api.leanx.dev',
        path: '/api/v1/merchant/create-bill-page',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': authToken,
            'Content-Length': data.length
        }
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    console.log(`Status: ${res.statusCode}`);
                    console.log('Response:', JSON.stringify(json, null, 2));
                    resolve(json);
                } catch (e) {
                    console.log('Raw Body:', body);
                    resolve(null);
                }
            });
        });

        req.on('error', (error) => {
            console.error('Error:', error);
            resolve(null);
        });

        req.write(data);
        req.end();
    });
}

async function run() {
    for (const candidate of candidates) {
        const result = await testCandidate(candidate);
        if (result && result.response_code === 2000) {
            console.log('!!! SUCCESS !!!');
            console.log(`Valid UUID is: ${candidate.value}`);
            break;
        }
    }
}

run();
