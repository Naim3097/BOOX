# Firestore Database Creation Guide

You are correct to ask! While the **code** is ready to create the collection automatically, the **Database Instance** must be manually created in the Firebase Console first. If you haven't done this, the app will fail to connect.

## Step 1: Create the Database
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project (**boox-b315f**).
3.  In the left sidebar, click **Build** -> **Firestore Database**.
4.  Click the **Create Database** button.
5.  **Location**: Select a location close to your users (e.g., `nam5 (us-central)` or similar).
6.  **Security Rules**: Start in **Test mode** (or Production mode, but you must update the rules as per `FIRESTORE_RULES.md`).
7.  Click **Enable**.

## Step 2: Verify "bookings" Collection
You do **NOT** need to manually create the "bookings" collection.
- Firestore is "schemaless".
- When the first user clicks "Confirm Booking", Firestore will automatically create the `bookings` collection and the document inside it.

## Troubleshooting
If you have created the database and updated the rules, but it still fails:
1.  Check the browser console (F12) for specific error codes (e.g., `permission-denied`, `not-found`).
2.  Ensure your `firebaseConfig` in `src/lib/firebase.ts` matches exactly what is in your Project Settings.
