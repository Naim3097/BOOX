
const https = require('https');

// CREDENTIALS (ONE X - ORIGINAL PRODUCTION)
const authToken = 'LP-C64B42C3-MM|dc09cd86-6311-4730-8819-55bba6736620|e68bd67be0597380af9a9c5bcad53b36425308575a6e009f78416d46254fbcd5382494c4bdba79af3ebc3f5b206c333efb1d62852abfd04b48b0ad74a53593ca';
const collectionUuid = 'Dc-E5317E6652-Lx';

const hosts = [
    'api.leanx.io',
    'api-production.leanx.io',
    'prod-api.leanx.io'
];

async function testHost(host) {
    console.log(`\nTesting Host: ${host}`);
    
    // Using List Services as it's the simplest GET/POST-like check
    const payload = {
       // list services often doesn't need body, but we'll send empty or minimal if needed.
       // The create-bill-page requires uuid. Let's try create-bill-page since we have the uuid.
        collection_uuid: collectionUuid,
        amount: 5.00,
        invoice_ref: 'TEST-PROD-IO-' + Date.now(),
        redirect_url: 'https://boox.vercel.app/payment/success',
        callback_url: 'https://boox.vercel.app/api/payment-webhook',
        full_name: 'Test Setup',
        email: 'test@example.com',
        phone_number: '0123456789'
    };

    const data = JSON.stringify(payload);

    const options = {
        hostname: host,
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
                console.log(`Status: ${res.statusCode}`);
                if(body.length < 500) console.log('Response:', body);
                else console.log('Response (Truncated):', body.substring(0, 500));
                resolve();
            });
        });

        req.on('error', (error) => {
            console.error('Error:', error.message);
            resolve();
        });

        req.write(data);
        req.end();
    });
}

async function run() {
    for (const host of hosts) {
        await testHost(host);
    }
}

run();
