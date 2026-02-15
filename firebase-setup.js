const firebaseConfig = {
  apiKey: "AIzaSyAcVb2Oa7X4WWaILRaFFMbp8Um8delV5oI",
  authDomain: "zooshop-69.firebaseapp.com",
  projectId: "zooshop-69",
  storageBucket: "zooshop-69.firebasestorage.app",
  messagingSenderId: "1035552661560",
  appId: "1:1035552661560:web:b167aad9e20b0a69fdc6cd",
  measurementId: "G-PNJDJ2T6CZ"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
window.db = db;
window.storage = storage;