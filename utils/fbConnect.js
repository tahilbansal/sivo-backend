const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
const fireBaseConnection = async () => {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://sivo-in-default-rtdb.asia-southeast1.firebasedatabase.app"
      });
      console.log("Connected to Firebase");
}

async function sendPushNotification(deviceToken, messageBody) {
    const message = {
        notification: {
            title: 'Your Notification Title',
            body: messageBody
        },
        token: deviceToken
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

module.exports = {fireBaseConnection, sendPushNotification};