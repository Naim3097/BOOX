# Firestore Security Rules Setup

If your booking is getting "stuck" or failing, it is likely because your Firestore database is in **Locked Mode** (default for new projects). You need to allow your app to write to the database.

## How to Fix

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project (**boox-b315f**).
3.  In the left sidebar, click on **Build** -> **Firestore Database**.
4.  Click on the **Rules** tab at the top.
5.  **IMPORTANT: Delete ALL existing code in the editor window.**
6.  Paste the following code exactly:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow anyone to create a booking (needed for public booking form)
    match /bookings/{bookingId} {
      allow create: if true;
      allow read, update, delete: if true;
    }
    
    // Default deny for other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

7.  Click **Publish**.

## Why is this needed?
By default, Firestore blocks all access to your database to keep it secure. Since your booking form is public (customers don't log in), you need to explicitly allow "create" operations for the `bookings` collection.

**Note:** For a production app, you would typically restrict `read` and `update` access to only authenticated admins, but `create` must remain public for the booking form to work.
