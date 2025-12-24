
const https = require('https');

const authToken = 'LP-C64B42C3-MM|dc09cd86-6311-4730-8819-55bba6736620|e68bd67be0597380af9a9c5bcad53b36425308575a6e009f78416d46254fbcd5382494c4bdba79af3ebc3f5b206c333efb1d62852abfd04b48b0ad74a53593ca';

async function testSandbox() {
    console.log(`\nTesting Sandbox URL...`);
    
    const payload = {
        payment_type: "WEB_PAYMENT",
        payment_status: "active",
        payment_model_reference_id: 1
    };

    const data = JSON.stringify(payload);

    const options = {
        hostname: 'sandbox.leanx.dev',
        path: '/api/v1/merchant/list-payment-services',
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

testSandbox();
