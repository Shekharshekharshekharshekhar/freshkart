const admin = require('firebase-admin');

// Service account JSON Netlify env mein daalo
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    )
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Secret key check (apna secret set karo env mein)
  const { uid, secret } = JSON.parse(event.body);
  if (secret !== process.env.ADMIN_SECRET) {
    return { statusCode: 403, body: 'Forbidden' };
  }

  try {
    // Admin claim set karo
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Admin role set!' })
    };
  } catch(e) {
    return { statusCode: 500, body: e.message };
  }
};
