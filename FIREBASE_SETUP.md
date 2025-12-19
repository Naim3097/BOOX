# One X Home Booking - Firebase Backend Setup Guide

This guide will walk you through setting up Google Firebase (Firestore) to make your application fully functional and live.

## Phase 1: Create a Firebase Project

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and log in with your Google account.
2.  Click **"Create a project"** (or "Add project").
3.  Enter a project name (e.g., `onex-booking`).
4.  Disable Google Analytics (not needed for this stage) and click **"Create project"**.
5.  Wait for the project to be ready and click **"Continue"**.

## Phase 2: Register the App

1.  In the project overview page, click the **Web icon** (`</>`) to add a web app.
2.  Register the app with a nickname (e.g., `One X Web`).
3.  (Optional) Check "Also set up Firebase Hosting" if you want to host it there later.
4.  Click **"Register app"**.
5.  **IMPORTANT:** You will see a code block with `firebaseConfig`. **Copy this configuration object**. You will need it for the next step. It looks like this:
    ```javascript
    const firebaseConfig = {
      apiKey: "AIzaSy...",
      authDomain: "...",
      projectId: "...",
      storageBucket: "...",
      messagingSenderId: "...",
      appId: "..."
    };
    ```
6.  Click **"Continue to console"**.

## Phase 3: Setup Firestore Database

1.  In the left sidebar, click on **"Build"** -> **"Firestore Database"**.
2.  Click **"Create database"**.
3.  **Location:** Choose a location closest to your users (e.g., `nam5 (us-central)` or `eur3 (europe-west)`).
4.  **Security Rules:** Select **"Start in test mode"**.
    *   *Note: This allows anyone to read/write for 30 days. This is fine for development. We will secure this later.*
5.  Click **"Create"**.

## Phase 4: Connect React App to Firebase

Now we need to install the Firebase SDK and configure it in your code.

### 1. Install Firebase
Open your terminal in VS Code and run:
```bash
npm install firebase
```

### 2. Create Configuration File
Create a new file `src/lib/firebase.ts` and paste the following code. **Replace the values with the ones you copied in Phase 2.**

```typescript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// REPLACE WITH YOUR ACTUAL CONFIG FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

## Phase 5: Update Application Logic

We need to replace the "Mock Data" with real database calls.

### 1. Update `src/components/booking/BookingForm.tsx` (Saving Data)
You will need to modify the `handleSubmit` function to save to Firestore.

```typescript
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore'; 

// Inside your component...
const handleSubmit = async () => {
  try {
    await addDoc(collection(db, "bookings"), {
      ...data,
      status: 'pending',
      createdAt: new Date()
    });
    console.log('Booking saved!');
    nextStep(); // Go to success screen
  } catch (e) {
    console.error("Error adding document: ", e);
    alert("Error saving booking. Please try again.");
  }
};
```

### 2. Update `src/pages/AdminDashboard.tsx` (Reading Data)
You will need to fetch data using `useEffect`.

```typescript
import { useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';

// Inside AdminDashboard component...
useEffect(() => {
  // Real-time listener for bookings
  const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const bookingsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp to JS Date
      date: doc.data().date?.toDate(), 
    }));
    setBookings(bookingsData);
  });

  return () => unsubscribe();
}, []);

// Update status function
const updateStatus = async (id: string, newStatus: string) => {
  const bookingRef = doc(db, "bookings", id);
  await updateDoc(bookingRef, { status: newStatus });
};
```

## Phase 6: Deploy (Go Live)

The easiest way to host this for free is using **Firebase Hosting**.

1.  Install Firebase tools globally:
    ```bash
    npm install -g firebase-tools
    ```
2.  Login to Firebase:
    ```bash
    firebase login
    ```
3.  Initialize the project:
    ```bash
    firebase init
    ```
    *   Select **Hosting: Configure files for Firebase Hosting...**
    *   Select **Use an existing project** (choose the one you created).
    *   What do you want to use as your public directory? **dist**
    *   Configure as a single-page app? **Yes**
    *   Set up automatic builds and deploys with GitHub? **No** (for now)
4.  Build your app:
    ```bash
    npm run build
    ```
5.  Deploy:
    ```bash
    firebase deploy
    ```

You will get a URL (e.g., `https://onex-booking.web.app`) where your app is live!
