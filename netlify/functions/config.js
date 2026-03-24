exports.handler = async (event, context) => {
  // Sirf GET allowed
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Referrer check
  const referer = event.headers.referer || '';
  if (!referer.includes('haribasket.netlify.app') &&
      !referer.includes('localhost')) {
    return { statusCode: 403, body: 'Forbidden' };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store', // Config cache mat karo
    },
    body: JSON.stringify({
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    })
  };
};
