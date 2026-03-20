const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

exports.handler = async () => {
  try {
    // Saare tokens lo
    const db = admin.firestore();
    const snap = await db.collection('pushTokens').get();
    const tokens = snap.docs.map(d => d.data().token).filter(Boolean);

    if (!tokens.length) return { statusCode: 200, body: 'No tokens' };

    const messages = [
      { title: '🌿 Subah ki taazi sabziyan!', body: 'Aaj ke best deals — seedha farm se aapke ghar!' },
      { title: '⚡ 30 Min Delivery!', body: 'Fresh vegetables abhi order karo — HariBasket!' },
      { title: '🎟️ Aaj ka offer!', body: 'FRESH10 coupon use karo — 10% OFF milega!' },
      { title: '🥬 Farm Fresh Available!', body: 'Aaj ki taazi sabziyan available hain. Order karo!' }
    ];

    // Random message pick karo
    const msg = messages[Math.floor(Math.random() * messages.length)];

    await admin.messaging().sendEachForMulticast({
      notification: msg,
      tokens: tokens
    });

    return { statusCode: 200, body: JSON.stringify({ success: true, sent: tokens.length }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
