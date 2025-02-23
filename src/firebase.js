//backend 는 firebase 이용해서 구현

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4rAaEbuSgEnYpYXU2DxI1GX6Xveq6WA4",
  authDomain: "react-chat-app-1-5ec5a.firebaseapp.com",
  databaseURL: "https://react-chat-app-1-5ec5a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "react-chat-app-1-5ec5a",
  storageBucket: "react-chat-app-1-5ec5a.firebasestorage.app",
  messagingSenderId: "810555451305",
  appId: "1:810555451305:web:46ff9f6605557e5fba46b8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const storage = getStorage(app); //스토리지 생성(이미지 저장)
export default app;