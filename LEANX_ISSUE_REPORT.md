# Lean.x Integration Issue Report
**Date:** December 25, 2025
**Status:** 🔴 Blocked
**Error Code:** `5699`
**Error Description:** `INVALID_UUID`

## 1. Issue Summary
The integration with Lean.x Payment Gateway is currently blocked. All API requests to the production endpoint (`https://api.leanx.dev/api/v1/...`) are failing with the error `INVALID_UUID`.

This error persists regardless of the input parameters, suggesting a fundamental issue with the provided **Auth Token** or the **Merchant Account** status.

## 2. Diagnosis Steps Taken

We performed extensive debugging to isolate the cause:

### A. UUID Format Testing
We hypothesized the `collection_uuid` format might be incorrect. We tested the following variations against the `create-bill-page` endpoint:
1.  **Exact Value:** `Dc-E5317E6652-Lx` (As provided in documentation)
2.  **Uppercase:** `DC-E5317E6652-LX` (Standard format for some systems)
3.  **Standard UUID:** `dc09cd86-6311-4730-8819-55bba6736620` (Extracted from the Auth Token)
4.  **Prefix:** `LP-C64B42C3-MM`

**Result:** All attempts failed with `INVALID_UUID`.

### B. Integrity Check
We verified the `collection_uuid` string for hidden characters (like zero-width spaces) by logging character codes.
*   **Result:** The string is clean. No hidden characters found.

### C. Endpoint Isolation (Critical Finding)
We ran a direct script to hit the `list-payment-services` endpoint.
*   **Endpoint:** `/merchant/list-payment-services`
*   **Requirement:** This endpoint **does not** require a `collection_uuid`, only the `auth-token`.
*   **Result:** **FAILED** with `INVALID_UUID`.

```json
{
  "response_code": 5699,
  "description": "FAILED",
  "breakdown_errors": "INVALID_UUID"
}
```

## 3. Conclusion & Root Cause
Since the API rejects requests even for endpoints that do not require a Collection UUID, the error `INVALID_UUID` is likely referring to the **User UUID** or **Merchant UUID** embedded within or associated with the **Auth Token**.

**The provided Auth Token is invalid or inactive for the Production environment.**

## 4. Required Actions
Please contact Lean.x Support with the following information:

1.  **Account Status:** Verify that the merchant account is **Active** and approved for Production use.
2.  **Token Validity:** Report that the Auth Token `LP-C64...` returns `INVALID_UUID` for the `list-payment-services` endpoint.
3.  **Environment:** Confirm if these keys are for `api.leanx.dev` (Production) or a different environment (Sandbox/UAT).

## 5. Technical Details for Support
*   **API Endpoint:** `https://api.leanx.dev/api/v1/merchant/list-payment-services`
*   **Method:** `POST`
*   **Auth Token Used:** `LP-C64B42C3-MM|dc09cd86-6311-4730-8819-55bba6736620|...`
*   **Response:**
    ```json
    {
      "response_code": 5699,
      "description": "FAILED",
      "breakdown_errors": "INVALID_UUID"
    }
    ```
