const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

// Yeh function daily 9am pe chalega
exports.handler = async (event) => {
  const db = admin.firestore();
  
  try {
    // Sabhi subscribed users ke tokens lo
    const tokensSnap = await db.collection('pushTokens').get();
    const tokens = [];
    tokensSnap.forEach(doc => {
      if (doc.data().token) tokens.push(doc.data().token);
    });

    if (tokens.length === 0) return { statusCode: 200, body: 'No subscribers' };

    // Daily deal message
    const deals = [
      { title: '🥬 Aaj Ka Deal!', body: 'Spinach 40% OFF — Sirf aaj! Order karo abhi 🛒' },
      { title: '🍅 Fresh Arrivals!', body: 'Farm fresh tomatoes aa gaye — ₹29/kg only!' },
      { title: '🌿 Morning Fresh!', body: 'Sabzi order karo, 30 min mein delivery!' },
      { title: '💚 HariBasket Deal!', body: 'Free delivery above ₹299 — Order karo!' },
    ];
    
    const deal = deals[new Date().getDay() % deals.length];

    const message = {
      notification: deal,
      data: { type: 'daily_deal', url: '/' },
      tokens,
    };

    await admin.messaging().sendEachForMulticast(message);
    
    return { statusCode: 200, body: 'Daily deal sent!' };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
