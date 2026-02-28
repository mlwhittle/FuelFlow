// Google Fit Integration Service
import { gapi } from 'gapi-script';

// Google Cloud OAuth Client ID
// Get it from: https://console.cloud.google.com/apis/credentials
const GOOGLE_CLIENT_ID = '746511342566-rdtasvfndp8s997ff4lefkd5id2cu5so.apps.googleusercontent.com';

const SCOPES = [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/fitness.location.read'
].join(' ');

const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/fitness/v1/rest'];

let isInitialized = false;

/**
 * Initialize Google API client
 */
export const initGoogleFit = () => {
    return new Promise((resolve, reject) => {
        if (isInitialized) {
            resolve(true);
            return;
        }

        gapi.load('client:auth2', async () => {
            try {
                await gapi.client.init({
                    clientId: GOOGLE_CLIENT_ID,
                    scope: SCOPES,
                    discoveryDocs: DISCOVERY_DOCS,
                    ux_mode: 'popup',
                    plugin_name: 'FuelFlow'
                });

                isInitialized = true;
                console.log('Google Fit API initialized');
                resolve(true);
            } catch (error) {
                console.error('Error initializing Google Fit:', error);
                reject(error);
            }
        });
    });
};

/**
 * Check if user is signed in to Google
 */
export const isGoogleSignedIn = () => {
    if (!isInitialized) return false;
    const auth = gapi.auth2.getAuthInstance();
    return auth && auth.isSignedIn.get();
};

/**
 * Sign in to Google account
 */
export const signInGoogle = async () => {
    try {
        await initGoogleFit();
        const auth = gapi.auth2.getAuthInstance();

        if (!auth) {
            throw new Error('Google Auth not initialized');
        }

        // Sign in with explicit prompt
        const result = await auth.signIn({
            prompt: 'select_account'
        });

        console.log('Google sign-in successful:', result.getBasicProfile().getEmail());
        return true;
    } catch (error) {
        console.error('Error signing in to Google:', error);
        if (error.error === 'popup_closed_by_user') {
            throw new Error('Sign-in popup was closed. Please try again.');
        }
        throw error;
    }
};

/**
 * Sign out from Google account
 */
export const signOutGoogle = async () => {
    try {
        const auth = gapi.auth2.getAuthInstance();
        await auth.signOut();
        return true;
    } catch (error) {
        console.error('Error signing out from Google:', error);
        throw error;
    }
};

/**
 * Get user's Google profile
 */
export const getGoogleProfile = () => {
    if (!isGoogleSignedIn()) return null;

    const auth = gapi.auth2.getAuthInstance();
    const profile = auth.currentUser.get().getBasicProfile();

    return {
        name: profile.getName(),
        email: profile.getEmail(),
        imageUrl: profile.getImageUrl()
    };
};

/**
 * Sync data from Google Fit
 * @param {number} daysBack - Number of days to sync (default: 1)
 */
export const syncGoogleFit = async (daysBack = 1) => {
    try {
        if (!isGoogleSignedIn()) {
            throw new Error('Not signed in to Google');
        }

        const now = Date.now();
        const startTime = now - (daysBack * 24 * 60 * 60 * 1000);

        // Fetch step count
        const stepsData = await fetchGoogleFitData(
            'com.google.step_count.delta',
            startTime,
            now
        );

        // Fetch calories burned
        const caloriesData = await fetchGoogleFitData(
            'com.google.calories.expended',
            startTime,
            now
        );

        // Fetch active minutes
        const activeMinutesData = await fetchGoogleFitData(
            'com.google.active_minutes',
            startTime,
            now
        );

        // Fetch heart rate (if available)
        const heartRateData = await fetchGoogleFitData(
            'com.google.heart_rate.bpm',
            startTime,
            now
        );

        // Fetch weight (if available)
        const weightData = await fetchGoogleFitData(
            'com.google.weight',
            startTime,
            now
        );

        // Fetch activities/workouts
        const activities = await fetchGoogleFitActivities(startTime, now);

        return {
            steps: extractSteps(stepsData),
            calories: extractCalories(caloriesData),
            activeMinutes: extractActiveMinutes(activeMinutesData),
            heartRate: extractHeartRate(heartRateData),
            weight: extractWeight(weightData),
            activities: activities,
            syncTime: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error syncing Google Fit:', error);
        throw error;
    }
};

/**
 * Fetch data from Google Fit API
 */
const fetchGoogleFitData = async (dataTypeName, startTimeMillis, endTimeMillis) => {
    try {
        const response = await gapi.client.fitness.users.dataset.aggregate({
            userId: 'me',
            requestBody: {
                aggregateBy: [{
                    dataTypeName: dataTypeName,
                    dataSourceId: `derived:${dataTypeName}:com.google.android.gms:merge_step_deltas`
                }],
                bucketByTime: { durationMillis: 86400000 }, // 1 day buckets
                startTimeMillis: startTimeMillis,
                endTimeMillis: endTimeMillis
            }
        });

        return response.result;
    } catch (error) {
        console.error(`Error fetching ${dataTypeName}:`, error);
        return null;
    }
};

/**
 * Fetch activities/sessions from Google Fit
 */
const fetchGoogleFitActivities = async (startTimeMillis, endTimeMillis) => {
    try {
        const response = await gapi.client.fitness.users.sessions.list({
            userId: 'me',
            startTime: new Date(startTimeMillis).toISOString(),
            endTime: new Date(endTimeMillis).toISOString()
        });

        return response.result.session || [];
    } catch (error) {
        console.error('Error fetching activities:', error);
        return [];
    }
};

/**
 * Extract step count from Google Fit response
 */
const extractSteps = (data) => {
    if (!data || !data.bucket) return 0;

    let totalSteps = 0;
    data.bucket.forEach(bucket => {
        bucket.dataset.forEach(dataset => {
            dataset.point.forEach(point => {
                if (point.value && point.value[0] && point.value[0].intVal) {
                    totalSteps += point.value[0].intVal;
                }
            });
        });
    });

    return totalSteps;
};

/**
 * Extract calories from Google Fit response
 */
const extractCalories = (data) => {
    if (!data || !data.bucket) return 0;

    let totalCalories = 0;
    data.bucket.forEach(bucket => {
        bucket.dataset.forEach(dataset => {
            dataset.point.forEach(point => {
                if (point.value && point.value[0] && point.value[0].fpVal) {
                    totalCalories += point.value[0].fpVal;
                }
            });
        });
    });

    return Math.round(totalCalories);
};

/**
 * Extract active minutes from Google Fit response
 */
const extractActiveMinutes = (data) => {
    if (!data || !data.bucket) return 0;

    let totalMinutes = 0;
    data.bucket.forEach(bucket => {
        bucket.dataset.forEach(dataset => {
            dataset.point.forEach(point => {
                if (point.value && point.value[0] && point.value[0].intVal) {
                    totalMinutes += point.value[0].intVal;
                }
            });
        });
    });

    return totalMinutes;
};

/**
 * Extract heart rate from Google Fit response
 */
const extractHeartRate = (data) => {
    if (!data || !data.bucket) return null;

    const heartRates = [];
    data.bucket.forEach(bucket => {
        bucket.dataset.forEach(dataset => {
            dataset.point.forEach(point => {
                if (point.value && point.value[0] && point.value[0].fpVal) {
                    heartRates.push(point.value[0].fpVal);
                }
            });
        });
    });

    if (heartRates.length === 0) return null;

    const average = heartRates.reduce((a, b) => a + b, 0) / heartRates.length;
    return Math.round(average);
};

/**
 * Extract weight from Google Fit response
 */
const extractWeight = (data) => {
    if (!data || !data.bucket) return null;

    let latestWeight = null;
    let latestTime = 0;

    data.bucket.forEach(bucket => {
        bucket.dataset.forEach(dataset => {
            dataset.point.forEach(point => {
                if (point.value && point.value[0] && point.value[0].fpVal) {
                    const time = parseInt(point.startTimeNanos) / 1000000;
                    if (time > latestTime) {
                        latestTime = time;
                        latestWeight = point.value[0].fpVal;
                    }
                }
            });
        });
    });

    return latestWeight ? Math.round(latestWeight * 2.20462 * 10) / 10 : null; // Convert kg to lbs
};

/**
 * Check if Google Fit is configured
 */
export const isGoogleFitConfigured = () => {
    return GOOGLE_CLIENT_ID !== 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com';
};
