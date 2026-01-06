# 🕵️‍♂️ Lean.x Deep Analysis: Why "INVALID_UUID"?

**Observation:** Two independent merchant accounts (One X & NEXOVA) are failing with the exact same error (`INVALID_UUID`) when hitting the Production API.

**Conclusion:** It is statistically impossible that both accounts are "broken" in the exact same way. The issue is likely in **how we are sending the request** or **what the API expects**.

Here is the breakdown of every possible cause:

## 1. The "UUID" is not what we think it is
The error `INVALID_UUID` is vague. It could refer to:
*   **Collection UUID:** `Dc-E5...` (We verified this exists).
*   **User UUID:** The middle part of the Auth Token.
*   **Transaction UUID:** Maybe it expects a UUID for `invoice_ref`?
*   **Format:** Maybe it expects a standard 36-char UUID (e.g., `xxxxxxxx-xxxx...`) but we are sending the short "Lean.x ID" (`Dc-...`).

**Hypothesis:** The API documentation might be misleading. Maybe `collection_uuid` *must* be the standard UUID format, not the short code.

## 2. Data Type Mismatch
APIs can be picky.
*   **Amount:** We send `5` (number). Maybe it wants `"5.00"` (string)?
*   **Phone:** We send `0123456789`. Maybe it wants `+6012...`?

## 3. Header Case Sensitivity
*   We send `auth-token`.
*   Some servers strictly require `Auth-Token` (Capitalized).
*   Some servers require `Content-Type: application/json; charset=utf-8`.

## 4. The "Hidden" Requirement
*   **User-Agent:** Some security firewalls (Cloudflare/Caddy) block requests that look like bots (e.g., `node-fetch`). They might return a generic error or pass a mangled request to the backend.
*   **IP Address:** If Lean.x requires IP Whitelisting, our dynamic IPs (Vercel/Home) would fail. (Usually returns 403, but who knows).

## 5. The Endpoint URL
*   We use: `https://api.leanx.dev/api/v1/merchant/create-bill-page`
*   Is there a `v2`?
*   Is there a `www.`?

---

## 🧪 The "Variations" Test
I will now create a script that fires **10 different variations** of the request to see if ANY of them stick.

1.  **Standard:** As we have been doing.
2.  **String Amount:** `"5.00"` instead of `5`.
3.  **Capitalized Header:** `Auth-Token` instead of `auth-token`.
4.  **Browser User-Agent:** Pretend to be Chrome.
5.  **Empty Phone:** Maybe phone validation is failing?
6.  **Short Invoice Ref:** Simple string.
7.  **Standard UUID for Collection:** Try using the User UUID as the Collection UUID (just in case).
