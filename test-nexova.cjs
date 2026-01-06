
const https = require('https');

// NEW CREDENTIALS (NEXOVA SOLUTIONS)
const authToken = 'LP-D70DAABE-MM|03253b16-7eb7-4244-837e-0ace0343ae5c|c2d2fb521d1a09786cae63de912af1dcaaeb57adb61033f09c893685d499c8d2a904b5622256bb0bca2abf02e5ce671f6c5170a9339c58305739d12ea97a52b4';
const collectionUuid = 'Dc-94C881BE5B-Lx';

const candidates = [
    { name: 'NEXOVA Collection UUID', value: collectionUuid }
];

const payloadTemplate = {
    amount: 5.00,
    invoice_ref: 'TEST-NEXOVA-' + Date.now(),
    redirect_url: 'https://boox.vercel.app/payment/success',
    callback_url: 'https://boox.vercel.app/api/payment-webhook',
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
            'Content-Length': data.length,
            // SPOOFING PRODUCTION DOMAIN
            'Origin': 'https://boox.vercel.app',
            'Referer': 'https://boox.vercel.app/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
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
        await testCandidate(candidate);
    }
}

run();
