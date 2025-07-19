import { initializeApp, cert, getApp, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}");

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set");
}

let adminApp: App; // Explicitly type adminApp as App
try {
  // Try to get the existing 'admin' app
  adminApp = getApp('admin');
} catch {
  // Initialize a new 'admin' app if it doesn't exist
  adminApp = initializeApp({
    credential: cert(serviceAccount),
  }, 'admin');
}

export { adminApp }; // Export the app instance
export const adminAuth = getAuth(adminApp);