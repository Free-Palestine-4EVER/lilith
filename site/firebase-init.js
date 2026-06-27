/* LILITH — Firebase init (web config is public by design; security is via rules). */
(function(){
  if(typeof firebase === 'undefined') return;
  firebase.initializeApp({
    apiKey: "AIzaSyB4pyGlyuyWWoaAEpzaRGOpchHFCrA7-XU",
    authDomain: "lilithserpent.firebaseapp.com",
    projectId: "lilithserpent",
    storageBucket: "lilithserpent.firebasestorage.app",
    messagingSenderId: "877195492866",
    appId: "1:877195492866:web:03ba5d0eb90909278d711b"
  });
  window.lilithAuth = firebase.auth();
  window.lilithDB   = firebase.firestore();
})();
