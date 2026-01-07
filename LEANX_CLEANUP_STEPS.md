# How to Fix Duplicate Payment Methods for One X

The duplication you see (2x FPX, 2x DuitNow, 3x Wallet) is because **multiple "Payment Providers" are enabled** in your Lean.x Dashboard for the same channel.

For example:
*   **Provider A** (e.g., PayNet) gives you *FPX* and *DuitNow*.
*   **Provider B** (e.g., Razer) *also* gives you *FPX* and *DuitNow*.
*   **Result on Payment Page:** You see duplicate buttons.

## The Solution (Must be done in Dashboard)

Since the payment page is hosted by Lean.x, we cannot "hide" these buttons with code. You must configure your account to only use **One Provider** per channel.

### Steps:

1.  Login to the **[Lean.x Merchant Portal](https://merchant.leanx.io)** (or `.dev` if you are testing there, but you are using `.io` Production keys).
2.  Navigate to **Settings** > **Payment Channels** (or **Collections**).
3.  Select your active collection: `One X Transmission Enterprise`.
4.  Look at the list of **Active Providers**. You likely have multiple turned on.
5.  **Disable** the redundant ones so that you have:
    *   **ONE** provider for **FPX / Online Banking**.
    *   **ONE** provider for **DuitNow QR**.
    *   **ONE** provider for **E-Wallet**.

### Recommended Setup
If available, try to consolidate. For example:
*   Enable **Razer Merchant Services** (often covers FPX + Credit Card + some Wallets).
*   Disable the others if Razer covers what you need.
*   *OR* Use **PayNet** for FPX/DuitNow and disable the rest.

Once you toggle these off in the dashboard, refresh your app and try the "Pay" button again. The Payment Page will immediately show only the allowed buttons.
