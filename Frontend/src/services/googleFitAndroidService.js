// Google Fit integration for step count (Android only)
// Requires: react-native-google-fit
// Setup: See GOOGLE_INTEGRATION_GUIDE.md for instructions

import GoogleFit, { Scopes } from 'react-native-google-fit';

export const initGoogleFit = async () => {
  return new Promise((resolve, reject) => {
    if (!GoogleFit) {
      reject(new Error('Google Fit native module not found.\nMake sure react-native-google-fit is installed, linked, and you are not running in Expo Go.'));
      return;
    }
    GoogleFit.checkIsAuthorized().then(() => {
      if (!GoogleFit.isAuthorized) {
        GoogleFit.authorize({
          scopes: [Scopes.FITNESS_ACTIVITY_READ, Scopes.FITNESS_ACTIVITY_WRITE],
        })
          .then(authResult => {
            if (authResult.success) {
              resolve(true);
            } else {
              reject('Google Fit authorization failed');
            }
          })
          .catch(reject);
      } else {
        resolve(true);
      }
    }).catch((e) => reject(new Error('Google Fit checkIsAuthorized failed: ' + e.message)));
  });
};

export const getTodayStepCount = async () => {
  if (!GoogleFit) throw new Error('Google Fit native module not found.');
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  return new Promise((resolve, reject) => {
    GoogleFit.getDailyStepCountSamples({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    }, (err, res) => {
      if (err) return reject(err);
      // Find steps from Google Fit source
      const fitSteps = res.find(r => r.source === 'com.google.android.gms:estimated_steps');
      resolve(fitSteps ? fitSteps.steps[0].value : 0);
    });
  });
};
