# Deploying to Vercel

Since your project is already on GitHub, deploying to Vercel is easy.

## Step 1: Import Project
1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Find your repository `Naim3097/BOOX` and click **Import**.

## Step 2: Configure Environment Variables (CRITICAL)
You **MUST** add your Firebase keys here, or the app will not work online.

1.  In the "Configure Project" screen, look for the **Environment Variables** section.
2.  Open your local `.env` file on your computer.
3.  Copy and paste each variable one by one into Vercel:

    | Name | Value |
    |------|-------|
    | `VITE_FIREBASE_API_KEY` | *(Paste your NEW key here)* |
    | `VITE_FIREBASE_AUTH_DOMAIN` | `boox-b315f.firebaseapp.com` |
    | `VITE_FIREBASE_PROJECT_ID` | `boox-b315f` |
    | `VITE_FIREBASE_STORAGE_BUCKET` | `boox-b315f.firebasestorage.app` |
    | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `128377649250` |
    | `VITE_FIREBASE_APP_ID` | `1:128377649250:web:dee8cad5440a0cd14cf93b` |

## Step 3: Deploy
1.  Click **Deploy**.
2.  Wait for the build to finish (about 1 minute).
3.  Your app is now live!

---

## ⚠️ SECURITY REMINDER
**Before you paste the API Key into Vercel:**
1.  Go to Google Cloud Console.
2.  **Regenerate your API Key** (as discussed).
3.  Use the **NEW** key in Vercel.
4.  Update your local `.env` file with the new key as well.
