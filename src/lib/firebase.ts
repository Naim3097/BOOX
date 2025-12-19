import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGVM9gdOLwh6_LjRxu_IweWUBNP2V_kzU",
  authDomain: "boox-b315f.firebaseapp.com",
  projectId: "boox-b315f",
  storageBucket: "boox-b315f.firebasestorage.app",
  messagingSenderId: "128377649250",
  appId: "1:128377649250:web:dee8cad5440a0cd14cf93b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
