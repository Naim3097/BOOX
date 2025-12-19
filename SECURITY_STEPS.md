# Securing Your Firebase App

Since your API key was exposed in Git history, we need to invalidate it and create a new, restricted one.

## Step 1: Regenerate the Key
1.  Go to the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2.  Make sure you are in the project **boox-b315f**.
3.  Look for the **API Keys** section.
4.  Identify the key being used (often named "Browser key" or "Auto created key").
5.  **Delete** the old key (this stops anyone from using the leaked one).
6.  Click **+ CREATE CREDENTIALS** -> **API key**.
7.  Copy this **NEW** key.

## Step 2: Restrict the New Key (Crucial)
This makes the key useless to anyone who steals it, because it will only work on YOUR website.

1.  Click on the name of the **NEW** API key you just created to edit it.
2.  Under **Application restrictions**, select **Websites**.
3.  Under **Website restrictions**, click **Add**.
4.  Add these entries (Google is strict about formats):
    *   `http://localhost:5173/*`
    *   `https://*.vercel.app/*` (This covers all your Vercel deployments)
    *   *(Optional: Add your specific domain if you know it, e.g., `https://boox.vercel.app/*`)*
5.  Click **Save**.

## Step 3: Update Local Project
1.  Open your `.env` file in VS Code.
2.  Replace the value of `VITE_FIREBASE_API_KEY` with your **NEW** key.
3.  Save the file.

## Step 4: Update Vercel
1.  Go to your Vercel Project Settings -> Environment Variables.
2.  Find `VITE_FIREBASE_API_KEY`.
3.  Click **Edit** and paste the **NEW** key.
4.  **Save**.
5.  Go to **Deployments** and click **Redeploy** for the changes to take effect.
