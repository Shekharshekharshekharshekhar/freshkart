const admin = require('firebase-admin');

// Firebase Admin initialize karo
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

exports.handler = async (event) => {
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const { tokens, title, body, data } = JSON.parse(event.body);

    if (!tokens || tokens.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No tokens' }) };
    }

    const message = {
      notification: { title, body },
      data: data || {},
      tokens: tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    return {
      statusCode: 200,
      headers, 
      body: JSON.stringify({
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
