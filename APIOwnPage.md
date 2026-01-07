# Lean.x Integration: "API Own Page" (Direct Bank Selection)

This guide covers the advanced integration method where the Merchant Application (Your App) hosts the **Bank Selection Page**, maintaining full control over the user interface before redirecting only for the final authentication.

---

## 1. Authentication
All API requests require an **Auth Token** in the header.
*   **Header Name:** `auth-token`
*   **Source:** Retrieve from your Lean.x Portal Dashboard -> API Page.

```json
{
    "auth-token": "LP-0D7C06DE-MM|..."
}
```

---

## 2. Integration Flow

### Step 1: Get Payment Service List
Fetch the available banks/payment methods (e.g., Maybank2u, CIMB Clicks, E-Wallets) to display on your own frontend.

*   **Endpoint:** `POST https://api.leanx.io/api/v1/merchant/list-payment-services`
*   **Body:**
    ```json
    {
      "payment_type": "WEB_PAYMENT",  // Options: WEB_PAYMENT (FPX), GLOBAL_CARD_PAYMENT, DIGITAL_PAYMENT (E-Wallet)
      "payment_status": "active",
      "payment_model_reference_id": 1 // 1 = B2C, 2 = B2B
    }
    ```
*   **Response (Simplified):** Returns a list of banks with `payment_service_id` (Important for Step 2).

### Step 2: Create Silent Bill
Once the user selects a bank (e.g., Maybank2u, ID: 16), call this endpoint to generate the payment link directly to that bank.

*   **Endpoint:** `POST https://api.leanx.io/api/v1/merchant/create-bill-silent`
*   **Body:**
    ```json
    {
        "collection_uuid": "CL-C0D7F54A90-LNP",
        "payment_service_id": 33, // Valid ID from Step 1
        "amount": 10.00,
        "invoice_ref": "INV202311280001",
        "full_name": "John Doe",
        "email": "johndoe@email.com",
        "phone_number": "0123456789",
        "redirect_url": "https://www.yourdomain.com/return-page",
        "callback_url": "https://www.yourdomain.com/api-callback-url"
    }
    ```
*   **Response:**
    ```json
    {
      "response_code": 2000,
      "data": {
        "redirect_url": "https://payment.leanx.io/process/..." // Direct link to bank login
      }
    }
    ```

### Step 3: Callback (Webhook)
Lean.x sends a POST request to your `callback_url` upon transaction completion.

*   **Format:** The payload is an encoded **JWT** string.
*   **Decoding:** You must use your **Hash Key** (from Dashboard) to verify and decode the JWT.
*   **Sample Decoded Payload:**
    ```json
    {
      "invoice_no": "BP1701155880uBMwB9q0",
      "invoice_status": "SUCCESS", // or FAILED / PENDING
      "amount": "456.20",
      "fpx_transaction_id": "2505061440020644"
    }
    ```

### Step 4: Check Transaction Status (Manual)
If the callback is missed, use this endpoint to verify the status.

*   **Endpoint:** `POST https://api.leanx.io/api/v1/merchant/manual-checking-transaction`
*   **Query Param:** `?invoice_no=BP-AD5112621A-LNP` (or your `invoice_ref`)
*   **Response:**
    ```json
    {
      "data": {
        "transaction_details": {
          "invoice_status": "SUCCESS",
          "amount": "15.00"
        }
      }
    }
    ```

---

## 3. Important Notes
1.  **Host URL:** Ensure you use `api.leanx.io` for Production.
2.  **JWT Decoding:** Security is handled via JWT. Do not trust the callback unless the signature matches your Hash Key.
