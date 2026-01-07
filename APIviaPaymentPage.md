# Lean.x Payment Gateway Integration Guide (General)

This guide provides a platform-agnostic overview of how to integrate the Lean.x (Nexova) Payment Gateway into any web application (Node.js, PHP, Python, etc.).

---

## 1. Prerequisites
Before starting, ensure you have a Merchant Account and the following credentials:

1.  **Auth Token:** Your secret API key (starts with `LP-...`).
2.  **Collection UUID:** The unique ID for your payment collection/form (starts with `Dc-...` or `CL-...`).
3.  **API Host:** The correct base URL for the API.

---

## 2. API Concepts
The integration follows a **Redirect Model**. You do not handle credit card data directly.

1.  **Initiation:** Your server sends booking/order details to Lean.x.
2.  **Redirect:** Lean.x returns a secure `redirect_url`. You send the user there.
3.  **Payment:** User enters details on the Lean.x secure page.
4.  **Completion:** 
    *   **User:** Is redirected back to your `redirect_url` (Success Page).
    *   **Server:** Receives a background webhook at your `callback_url`.

### API Environments
| Environment | Base URL | Notes |
| :--- | :--- | :--- |
| **Production** | `https://api.leanx.io` | Use for live payments. |
| **Legacy/Dev** | `https://api.leanx.dev` | *Note: Often unstable or deprecated.* |

---

## 3. Create Payment Session
### Endpoint
`POST /api/v1/merchant/create-bill-page`

### Headers
*   `Content-Type`: `application/json`
*   `auth-token`: `YOUR_AUTH_TOKEN`

### Request Body
```json
{
  "collection_uuid": "Dc-XXXXXX-Lx",
  "amount": 10.50,
  "invoice_ref": "ORDER-123",
  "full_name": "John Doe",
  "email": "customer@example.com",
  "phone_number": "0123456789",
  "redirect_url": "https://yourwebsite.com/payment/success",
  "callback_url": "https://yourwebsite.com/api/webhook"
}
```

### Success Response (200 OK)
```json
{
  "response_code": 2000,
  "description": "SUCCESS",
  "data": {
    "redirect_url": "https://payment.leanx.io/invoice?id=dp-XXXX",
    "bill_no": "dp-XXXX",
    "invoice_ref": "ORDER-123"
  }
}
```

---

## 4. Code Example (Node.js / TypeScript)

Here is a generic function to create a payment session:

```typescript
const LEANX_HOST = process.env.LEANX_API_HOST || 'https://api.leanx.io';
const AUTH_TOKEN = process.env.LEANX_AUTH_TOKEN;

async function createLeanxPayment(orderData: any) {
  const payload = {
    collection_uuid: process.env.LEANX_COLLECTION_UUID,
    amount: orderData.amount, // e.g., 50.00
    invoice_ref: orderData.orderId,
    full_name: orderData.customerName,
    email: orderData.email,
    phone_number: orderData.phone,
    redirect_url: `https://your-site.com/success`,
    callback_url: `https://your-site.com/api/webhook`
  };

  const response = await fetch(`${LEANX_HOST}/api/v1/merchant/create-bill-page`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'auth-token': AUTH_TOKEN
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (result.response_code === 2000) {
    return result.data.redirect_url; // Redirect the user here
  } else {
    throw new Error(`Payment API Failed: ${result.breakdown_errors}`);
  }
}
```

---

## 5. Common Errors & Troubleshooting

### Error: `INVALID_UUID` (Code 5699)
*   **Meaning:** The API rejected your credentials.
*   **Common Cause:** You are sending the credentials to the **wrong Host URL**.
*   **Solution:** Switch from `.dev` to `.io` (e.g., `https://api.leanx.io`).

### Error: `ENOTFOUND`
*   **Meaning:** The domain name does not exist.
*   **Solution:** Check for typos in the API Host URL.

### Redirected to 404 Page
*   **Meaning:** The `redirect_url` in the response works, but your Return URL is wrong.
*   **Solution:** Ensure the `redirect_url` you send in the payload is a valid page on your website.
