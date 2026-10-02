import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let firebaseApp;

const getServiceAccount = () => {
    const encodedServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;
    const serviceAccountJson = encodedServiceAccount
        ? Buffer.from(encodedServiceAccount, "base64").toString("utf8")
        : process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (!serviceAccountJson) {
        const error = new Error("Firebase Authentication is not configured. Contact support.");
        error.statusCode = 503;
        throw error;
    }

    try {
        const serviceAccount = JSON.parse(serviceAccountJson);

        if (
            !serviceAccount.project_id ||
            !serviceAccount.client_email ||
            !serviceAccount.private_key
        ) {
            throw new Error("Missing required service account fields.");
        }

        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
        return serviceAccount;
    } catch {
        const error = new Error(
            "Firebase service account configuration is invalid. Use a single-line JSON value or FIREBASE_SERVICE_ACCOUNT_JSON_BASE64."
        );
        error.statusCode = 503;
        throw error;
    }
};

const getFirebaseApp = () => {
    if (firebaseApp) {
        return firebaseApp;
    }

    firebaseApp = getApps()[0] || initializeApp({
        credential: cert(getServiceAccount())
    });

    return firebaseApp;
};

export const verifyFirebaseIdToken = async (idToken) => {
    if (!idToken || typeof idToken !== "string") {
        const error = new Error("Firebase ID token is required.");
        error.statusCode = 400;
        throw error;
    }

    try {
        return await getAuth(getFirebaseApp()).verifyIdToken(idToken);
    } catch (error) {
        console.error("Firebase ID token verification failed:", error.message || error);
        const authError = new Error("Phone verification failed or has expired. Please request a new OTP.");
        authError.statusCode = 401;
        throw authError;
    }
};
