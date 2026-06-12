import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyACSwBVYfL0Lr2MFW6qyY6gP7ckEbULKQ4",
  authDomain: "gigpay-tracker.firebaseapp.com",
  projectId: "gigpay-tracker",
  storageBucket: "gigpay-tracker.firebasestorage.app",
  messagingSenderId: "1013657543752",
  appId: "1:1013657543752:web:c0d13774f9f6242305a47d",
  measurementId: "G-Z05QTYRFP5"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
