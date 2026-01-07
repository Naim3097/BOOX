const https = require('https');

const authToken = 'LP-C64B42C3-MM|dc09cd86-6311-4730-8819-55bba6736620|e68bd67be0597380af9a9c5bcad53b36425308575a6e009f78416d46254fbcd5382494c4bdba79af3ebc3f5b206c333efb1d62852abfd04b48b0ad74a53593ca';
const collectionUuid = 'Dc-E5317E6652-Lx';

const amounts = [0.20, 1.00, 5.00];

async function generateLinks() {
    console.log("Generating Payment Links for Debugging...\n");

    for (const amount of amounts) {
        await createBill(amount);
    }
}

function createBill(amount) {
    return new Promise((resolve) => {
        const payload = JSON.stringify({
            collection_uuid: collectionUuid,
            amount: amount,
            invoice_ref: `DEBUG-${Date.now()}-${Math.floor(amount)}`,
            redirect_url: 'https://boox.vercel.app/payment/success',
            callback_url: 'https://boox.vercel.app/api/payment-webhook',
            full_name: 'Debug User',
            email: 'debug@example.com',
            phone_number: '0123456789'
        });

        const options = {
            hostname: 'api.leanx.io',
            path: '/api/v1/merchant/create-bill-page',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': authToken,
                'Content-Length': payload.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    if (json.response_code === 2000) {
                        console.log(`[RM ${amount.toFixed(2)}] Success: ${json.data.redirect_url}`);
                    } else {
                        console.log(`[RM ${amount.toFixed(2)}] Search Failed: ${json.description}`);
                    }
                } catch (e) {
                    console.log(`[RM ${amount.toFixed(2)}] Error: ${e.message}`);
                }
                resolve();
            });
        });
        
        req.write(payload);
        req.end();
    });
}

generateLinks();
