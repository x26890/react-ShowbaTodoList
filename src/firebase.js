import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB2fjTJW0Thdx70L_e23Y5KtjZPupk896k",
  authDomain: "showbatodolist.firebaseapp.com",
  databaseURL: "https://showbatodolist-default-rtdb.firebaseio.com",
  projectId: "showbatodolist",
  storageBucket: "showbatodolist.firebasestorage.app",
  messagingSenderId: "526350391602",
  appId: "1:526350391602:web:b4d4a7f464e1c8d01a1f2b",
  measurementId: "G-7TG86E7H9T"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 重點：確保前面都有加上 export
export const auth = getAuth(app);
export const db = getFirestore(app);

// 如果你想預設匯出 app 也可以，但上面的具名匯出 (auth, db) 是必要的
export default app;