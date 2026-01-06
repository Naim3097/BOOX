
const https = require('https');

// CREDENTIALS (ONE X)
const authToken = 'LP-C64B42C3-MM|dc09cd86-6311-4730-8819-55bba6736620|e68bd67be0597380af9a9c5bcad53b36425308575a6e009f78416d46254fbcd5382494c4bdba79af3ebc3f5b206c333efb1d62852abfd04b48b0ad74a53593ca';
const collectionUuid = 'Dc-E5317E6652-Lx';
const userUuid = 'dc09cd86-6311-4730-8819-55bba6736620';

const basePayload = {
    collection_uuid: collectionUuid,
    amount: 5.00,
    invoice_ref: 'TEST-VAR-' + Date.now(),
    redirect_url: 'https://boox.vercel.app/payment/success',
    callback_url: 'https://boox.vercel.app/api/payment-webhook',
    full_name: 'Test User',
    email: 'test@example.com',
    phone_number: '0123456789'
};

async function sendRequest(name, payloadOverride = {}, headerOverride = {}) {
    console.log(`\n--- Testing Variation: ${name} ---`);
    
    const payload = { ...basePayload, ...payloadOverride };
    const data = JSON.stringify(payload);

    const headers = {
        'Content-Type': 'application/json',
        'auth-token': authToken,
        'Content-Length': data.length,
        ...headerOverride
    };
    
    // Remove undefined headers
    Object.keys(headers).forEach(key => headers[key] === undefined && delete headers[key]);

    const options = {
        hostname: 'api.leanx.dev',
        path: '/api/v1/merchant/create-bill-page',
        method: 'POST',
        headers: headers
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    if (json.response_code === 2000) {
                        console.log('✅ SUCCESS!');
                    } else {
                        console.log(`❌ FAILED: ${json.breakdown_errors || json.description}`);
                    }
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
    // 1. Baseline
    await sendRequest('Baseline (Standard)');

    // 2. Header Variations
    await sendRequest('Header: Auth-Token (Caps)', {}, { 'Auth-Token': authToken, 'auth-token': undefined });
    await sendRequest('Header: User-Agent (Chrome)', {}, { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' });

    // 3. Payload Data Types
    await sendRequest('Payload: Amount as String', { amount: "5.00" });
    await sendRequest('Payload: Phone with +60', { phone_number: "+60123456789" });

    // 4. UUID Variations
    await sendRequest('UUID: User UUID as Collection UUID', { collection_uuid: userUuid });
    await sendRequest('UUID: Uppercase Collection UUID', { collection_uuid: collectionUuid.toUpperCase() });

    // 5. Minimal Payload (Maybe we are sending too much?)
    await sendRequest('Payload: Minimal (No email/phone)', { 
        email: undefined, 
        phone_number: undefined, 
        full_name: undefined 
    });
}

run();
