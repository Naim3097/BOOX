# 🚀 Payment Integration Setup Guide

## Overview
This guide walks you through deploying the Lean.x payment integration to Vercel.

## ✅ What's Already Done

### 1. Backend APIs (3 files in `api/` folder)
- ✅ `api/create-payment.ts` - Creates payment sessions
- ✅ `api/payment-webhook.ts` - Receives payment confirmations
- ✅ `api/check-payment-status.ts` - Verifies transactions

### 2. Frontend Integration
- ✅ `BookingForm.tsx` - Payment flow integrated
- ✅ `PaymentSuccess.tsx` - Payment verification page
- ✅ Routes configured in `App.tsx`

### 3. Local Environment
- ✅ `.env` file has Lean.x credentials
- ✅ `firebase-admin` package installed

## 🔧 What You Need to Do

### Step 1: Add Environment Variables to Vercel

**CRITICAL:** The payment will NOT work until you add these to Vercel.

1. Go to https://vercel.com/dashboard
2. Select your project (`One X Home Booking`)
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar
5. Add the following variables **one by one**:

#### Payment Gateway Variables
```
Variable Name: LEANX_AUTH_TOKEN
Value: LP-C64B42C3-MM|dc09cd86-6311-4730-8819-55bba6736620|e68bd67be0597380af9a9c5bcad53b36425308575a6e009f78416d46254fbcd5382494c4bdba79af3ebc3f5b206c333efb1d62852abfd04b48b0ad74a53593ca
Environment: Production, Preview, Development (select all)
```

```
Variable Name: LEANX_COLLECTION_UUID
Value: Dc-E5317E6652-Lx
Environment: Production, Preview, Development (select all)
```

```
Variable Name: LEANX_HASH_KEY
Value: e68bd67be0597380af9a9c5bcad53b36425308575a6e009f78416d46254fbcd5382494c4bdba79af3ebc3f5b206c333efb1d62852abfd04b48b0ad74a53593ca
Environment: Production, Preview, Development (select all)
```

#### Firebase Admin Variables (For Webhook)

**Important:** You need to get these from Firebase Console first.

1. Go to https://console.firebase.google.com/
2. Select your project (`boox-b315f`)
3. Click the ⚙️ (Settings) icon → **Project settings**
4. Click **Service accounts** tab
5. Click **Generate new private key** button
6. Download the JSON file
7. Open the JSON file and copy the values:

```
Variable Name: FIREBASE_ADMIN_PRIVATE_KEY
Value: (Copy the entire "private_key" value from the JSON, including -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----)
Environment: Production, Preview, Development (select all)
```

```
Variable Name: FIREBASE_ADMIN_CLIENT_EMAIL
Value: (Copy the "client_email" value from the JSON, looks like: firebase-adminsdk-xxxxx@boox-b315f.iam.gserviceaccount.com)
Environment: Production, Preview, Development (select all)
```

6. Click **Save** after adding each variable

### Step 2: Redeploy Your Application

After adding environment variables, you MUST redeploy:

**Option A: Through Git (Recommended)**
```bash
git add .
git commit -m "Add payment integration"
git push
```

**Option B: Manual Redeploy in Vercel**
1. Go to the **Deployments** tab
2. Click the **...** menu on the latest deployment
3. Click **Redeploy**

### Step 3: Test the Payment Flow

#### 3.1 Create a Test Booking
1. Go to your live site: `https://your-domain.vercel.app`
2. Fill out the booking form completely
3. Click through all 4 steps
4. Click **Confirm Booking** on Step 4

#### 3.2 Verify Redirect
You should be redirected to Lean.x payment page. The URL should look like:
```
https://payment.leanx.dev/pay/xxxxx
```

#### 3.3 Complete Test Payment
1. Select a test bank (if available) or use a real bank for small amount testing
2. Complete the payment process
3. You should be redirected back to: `https://your-domain.vercel.app/payment/success`

#### 3.4 Verify in Firestore
1. Go to Firebase Console → Firestore Database
2. Find your booking in the `bookings` collection
3. Check these fields:
   - `status` should be `confirmed` (updated by webhook)
   - `paymentStatus` should be `SUCCESS`
   - `paymentInvoiceNo` should have the transaction ID
   - `paymentAmount` should match your payment

## 🐛 Troubleshooting

### Issue 1: "Payment gateway not configured" Error
**Cause:** Environment variables not set in Vercel
**Fix:** Complete Step 1 above and redeploy

### Issue 2: Payment succeeds but booking status not updated
**Cause:** Firebase Admin credentials not set or incorrect
**Fix:** 
1. Verify `FIREBASE_ADMIN_PRIVATE_KEY` and `FIREBASE_ADMIN_CLIENT_EMAIL` in Vercel
2. Make sure the private key includes the full `-----BEGIN PRIVATE KEY-----` header

### Issue 3: Redirect after payment goes to 404
**Cause:** The `/payment/success` route is not working
**Fix:** Check that you've deployed the latest code with the updated `App.tsx`

### Issue 4: Webhook not receiving data
**Cause:** Lean.x may not be calling the webhook URL
**Fix:** 
1. Check Vercel Functions logs (Vercel Dashboard → Functions)
2. Contact Lean.x support to verify webhook URL: `https://your-domain.vercel.app/api/payment-webhook`

## 📊 Monitoring

### Check Payment Logs
1. Vercel Dashboard → Your Project
2. Click **Functions** tab
3. View logs for:
   - `/api/create-payment`
   - `/api/payment-webhook`
   - `/api/check-payment-status`

### Check Firestore
Monitor real-time updates in Firebase Console → Firestore Database

## 🎯 Success Checklist

- [ ] All environment variables added to Vercel
- [ ] Application redeployed
- [ ] Test booking created successfully
- [ ] Redirected to Lean.x payment page
- [ ] Payment completed
- [ ] Redirected back to success page
- [ ] Booking status updated in Firestore to `confirmed`
- [ ] Success page shows correct transaction details

## 📞 Support

If you encounter issues:
1. Check Vercel function logs first
2. Verify all environment variables are set correctly
3. Test locally with `npm run dev` to isolate Vercel-specific issues
4. Contact Lean.x support if payment gateway returns errors

## 🔐 Security Notes

- ✅ Payment credentials are server-side only (never exposed to browser)
- ✅ Amount validation happens on the server
- ✅ HTTPS enforced by Vercel
- ✅ Webhook verifies payment before updating database
