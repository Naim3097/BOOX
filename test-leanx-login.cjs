
const https = require('https');

const email = 'sales@nexovadigital.com';
const password = 'xTf0Yh';

const paths = [
    '/api/v1/auth/login',
    '/api/v1/login',
    '/api/v1/user/login',
    '/login'
];

async function tryLogin(path) {
    console.log(`\nTesting Login Endpoint: ${path}`);
    
    const payload = {
        email: email,
        password: password
    };
    
    // Also try username just in case
    const payload2 = {
        username: email,
        password: password
    };

    const data = JSON.stringify(payload);

    const options = {
        hostname: 'portal.leanx.dev', // UPDATED HOST
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                if (res.statusCode < 400 && body.length > 0) {
                     console.log('SUCCESS! Response:', body.substring(0, 500));
                } else {
                     // Check if it's a 404 (Endpoint not found) or 401 (Auth failed)
                     if (res.statusCode === 404) {
                         console.log('Endpoint not found.');
                     } else {
                         console.log('Response:', body.substring(0, 200));
                     }
                }
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
    for (const path of paths) {
        await tryLogin(path);
    }
}

run();
