// Firebase Authentication Service
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithRedirect,
    getRedirectResult,
    GoogleAuthProvider,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';

const googleProvider = new GoogleAuthProvider();

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email, password, displayName) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
            await updateProfile(result.user, { displayName });
        }
        return { user: result.user, error: null };
    } catch (error) {
        console.error('Sign up error:', error.code, error.message);
        return { user: null, error: getErrorMessage(error.code) };
    }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return { user: result.user, error: null };
    } catch (error) {
        console.error('Sign in error:', error.code, error.message);
        return { user: null, error: getErrorMessage(error.code) };
    }
};

/**
 * Sign in with Google (using redirect for better mobile support)
 */
export const signInWithGoogle = async () => {
    try {
        await signInWithRedirect(auth, googleProvider);
        // Page will redirect — result handled by checkRedirectResult()
        return { user: null, error: null };
    } catch (error) {
        console.error('Google sign-in error:', error.code, error.message);
        return { user: null, error: getErrorMessage(error.code) };
    }
};

/**
 * Check for redirect result (call on app load)
 */
export const checkRedirectResult = async () => {
    try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
            return { user: result.user, error: null };
        }
        return { user: null, error: null };
    } catch (error) {
        console.error('Redirect result error:', error.code, error.message);
        return { user: null, error: getErrorMessage(error.code) };
    }
};

/**
 * Sign out
 */
export const logOut = async () => {
    try {
        await signOut(auth);
        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { error: null };
    } catch (error) {
        return { error: getErrorMessage(error.code) };
    }
};

/**
 * Listen for auth state changes
 */
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

/**
 * Get user-friendly error messages
 */
const getErrorMessage = (errorCode) => {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'This email is already registered. Try signing in instead.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/operation-not-allowed':
            return 'This sign-in method is not enabled. Please enable it in Firebase Console.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/invalid-credential':
            return 'Invalid email or password. Please try again.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        case 'auth/popup-closed-by-user':
            return 'Sign-in was cancelled. Please try again.';
        case 'auth/popup-blocked':
            return 'Sign-in popup was blocked by your browser. Please allow popups.';
        case 'auth/unauthorized-domain':
            return 'This domain is not authorized for sign-in. Check Firebase Console.';
        case 'auth/account-exists-with-different-credential':
            return 'An account already exists with this email using a different sign-in method.';
        default:
            return `Sign-in error (${errorCode || 'unknown'}). Please try again.`;
    }
};
