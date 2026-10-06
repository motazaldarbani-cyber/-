// انسخ القيم من: Firebase Console > Project settings > Your apps > Web app
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDUZs__Ykc6yglIc5KMv_Yu9QT8bIsdtLM",
  authDomain: "motaz-ec8dc.firebaseapp.com",
  projectId: "motaz-ec8dc",
  storageBucket: "motaz-ec8dc.firebasestorage.app",
  messagingSenderId: "938742515684",
  appId: "1:938742515684:web:ab37d46b3bff506ce7e9f1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// حساب الإدارة (لازم تسويه في Authentication بنفس الايميل). كلمة السر مش مكتوبة في الكود.
export const ADMIN_EMAIL = "admin@motaz-ec8dc.com";
