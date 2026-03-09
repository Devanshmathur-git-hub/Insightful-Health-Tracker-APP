// Google Sign-In for Google Fit Access
// Uses expo-auth-session (works with Expo, no native compilation needed)

import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storeAccessToken, getStoredAccessToken } from './googleFitApiService';

// Your Google OAuth credentials
// Get these from Google Cloud Console: https://console.cloud.google.com/
const CLIENT_ID = ''; // Replace with your Google Cloud Client ID
const REDIRECT_URI = AuthSession.getRedirectUrl();

const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://www.googleapis.com/oauth2/v4/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

// ── Sign In with Google ───────────────────────────
export const signInWithGoogle = async () => {
    if (!CLIENT_ID) {
        console.error('❌ CLIENT_ID not configured. Set it in googleSignInService.js');
        return null;
    }

    try {
        const request = new AuthSession.AuthRequest({
            clientId: CLIENT_ID,
            scopes: [
                'https://www.googleapis.com/auth/fitness.activity.read',
                'profile',
                'email'
            ],
            redirectUrl: REDIRECT_URI,
            discovery,
            promptType: 'login',
        });

        const result = await request.promptAsync(discovery, { useProxy: false });

        if (result.type === 'success') {
            const { access_token } = result.params;
            console.log('✅ Google Sign-In successful');
            
            // Store the access token
            await storeAccessToken(access_token);
            
            // Also store refresh token if available
            if (result.params.refresh_token) {
                await AsyncStorage.setItem('google_fit_refresh_token', result.params.refresh_token);
            }
            
            return {
                success: true,
                accessToken: access_token,
            };
        } else if (result.type === 'cancel') {
            console.log('⚠️ Google Sign-In cancelled by user');
            return { success: false, error: 'User cancelled sign-in' };
        } else {
            console.log('⚠️ Google Sign-In error:', result);
            return { success: false, error: result.error?.message };
        }
    } catch (error) {
        console.error('❌ Error during Google Sign-In:', error.message);
        return { success: false, error: error.message };
    }
};

// ── Check if User is Authenticated ────────────────
export const isUserSignedIn = async () => {
    const token = await getStoredAccessToken();
    return !!token;
};

// ── Get Stored Token ──────────────────────────────
export const getStoredToken = async () => {
    return await getStoredAccessToken();
};

// ── Sign Out ──────────────────────────────────────
export const signOutGoogle = async () => {
    try {
        await AsyncStorage.removeItem('google_fit_access_token');
        await AsyncStorage.removeItem('google_fit_refresh_token');
        console.log('✅ Signed out from Google Fit');
        return true;
    } catch (error) {
        console.error('❌ Error signing out:', error.message);
        return false;
    }
};

// ── Initialize Google Sign-In ─────────────────────
export const initializeGoogleSignIn = async () => {
    try {
        const isSignedIn = await isUserSignedIn();
        if (isSignedIn) {
            console.log('✅ User already signed in to Google Fit');
            return true;
        } else {
            console.log('⚠️ User not signed in to Google Fit');
            return false;
        }
    } catch (error) {
        console.error('❌ Error initializing Google Sign-In:', error.message);
        return false;
    }
};
