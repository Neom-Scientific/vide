// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDM8und6UO0xvBsB2dqGl-W-D42BWUYIkU",
  authDomain: "strivebiocorp-994ae.appspot.com",
  projectId: "strivebiocorp-994ae",
  storageBucket: "strivebiocorp-994ae.firebasestorage.app",
  messagingSenderId: "706553463911",
  appId: "1:706553463911:web:bed6f1fa64192c4537c0c2",
  measurementId: "G-Q6GX9SP17S"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// export const analytics = getAnalytics(app);
export const storage = getStorage(app);