
const https = require('https');

// CREDENTIALS (ONE X)
const authToken = 'LP-C64B42C3-MM|dc09cd86-6311-4730-8819-55bba6736620|e68bd67be0597380af9a9c5bcad53b36425308575a6e009f78416d46254fbcd5382494c4bdba79af3ebc3f5b206c333efb1d62852abfd04b48b0ad74a53593ca';
const collectionUuid = 'Dc-E5317E6652-Lx';

// EXACT COPY FROM DOCS (with our credentials)
const payload = {
  "collection_uuid": collectionUuid,
  "amount": 119.00,
  "invoice_ref": "INV023312312",
  "redirect_url": "https://www.yourdomain.com/return-page",
  "callback_url": "https://www.yourdomain.com/api-callback-url",
  "full_name": "puteri balqis",
  "email": "puteri.balqis@gmail.com",
  "phone_number": "0112459822"
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

console.log('Sending EXACT DOCS payload...');
const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('Response:', body);
    });
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
