exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const origin  = event.headers['origin']  || '';
  const referer = event.headers['referer'] || '';
  const allowed = [
    'haribasket.netlify.app',
    'localhost',
    '127.0.0.1'
  ];

  const ok = allowed.some(d =>
    origin.includes(d) || referer.includes(d)
  );

  if (!ok) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Forbidden' })
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin':
        'https://haribasket.netlify.app',
    },
    body: JSON.stringify({
      apiKey:            process.env.FIREBASE_API_KEY,
      authDomain:        process.env.FIREBASE_AUTH_DOMAIN,
      projectId:         process.env.FIREBASE_PROJECT_ID,
      storageBucket:     process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId:             process.env.FIREBASE_APP_ID,
      measurementId:     process.env.FIREBASE_MEASUREMENT_ID,
    })
  };
};
