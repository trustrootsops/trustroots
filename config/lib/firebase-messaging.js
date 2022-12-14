const firebase = require('firebase-admin');
const config = require('../config');
const serviceAccount = config.fcm.serviceAccount;

if (serviceAccount) {
  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
  });
  module.exports = firebase.messaging();
} else {
  console.info('fcm.serviceAccount not set');
}
