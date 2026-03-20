importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDDYqExFGbNWytFlYY3ttbr0zug427x_QM",
  authDomain: "freshkart-web.firebaseapp.com",
  projectId: "freshkart-web",
  storageBucket: "freshkart-web.firebasestorage.app",
  messagingSenderId: "960532053767",
  appId: "1:960532053767:web:a13d2eb1fddea1ee28cfa2"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body: body,
    icon: '/icon-192.png',
    badge: '/icon-192.png'
  });
});
