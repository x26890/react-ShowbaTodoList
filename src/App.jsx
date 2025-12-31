import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from './firebase';
import Login from './pages/Login';
import MainApp from './pages/MainApp';
// 1. 記得建立這個檔案並在此引入
import ExpiryItems from './pages/ExpiryItems'; 

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-center mt-5">載入中...</div>;

  return (
    <Router>
      <Routes>
        {/* 首頁 */}
        <Route path="/" element={user ? <MainApp user={user} /> : <Navigate to="/login" />} />
        
        {/* 登入頁 */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />

        {/* 2. 新增：即期商品頁面 (同樣加上權限保護，沒登入不能看) */}
        <Route path="/expiry" element={user ? <ExpiryItems user={user} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;