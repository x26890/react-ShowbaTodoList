import React, { useState, useEffect } from 'react';
// 💡 關鍵：將 BrowserRouter 改為 HashRouter，避免 GitHub Pages 路徑錯誤
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from './firebase';

// 匯入頁面組件
import Login from './pages/Login';
import MainApp from './pages/MainApp';
import ExpiryItems from './pages/ExpiryItems'; 

/**
 * 根組件 App
 * 負責處理 Firebase 身份驗證狀態與路由分發
 */
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 監聽 Firebase 登入狀態
  useEffect(() => {
    // onAuthStateChanged 會自動檢查瀏覽器中的登入憑證
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // 狀態確認完畢，關閉載入中畫面
    });

    // 組件卸載時取消監聽
    return () => unsubscribe();
  }, []);

  // 💡 解決空白頁：在確認身分期間顯示載入中，防止組件因抓不到 user 而崩潰
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-2" role="status"></div>
          <div className="fw-bold text-muted">系統讀取中...</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* 首頁路由 (/) 
          如果已登入：渲染 MainApp
          如果未登入：導向 /login
        */}
        <Route 
          path="/" 
          element={user ? <MainApp user={user} /> : <Navigate to="/login" replace />} 
        />
        
        {/* 登入頁路由 (/login) 
          如果已登入：自動跳轉回首頁 (/)
          如果未登入：顯示登入表單
        */}
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/" replace />} 
        />

        {/* 即期商品頁面 (/expiry) 
          保護邏輯：同樣必須登入才能進入
        */}
        <Route 
          path="/expiry" 
          element={user ? <ExpiryItems user={user} /> : <Navigate to="/login" replace />} 
        />

        {/* 萬用路由：若輸入不存在的網址，自動導向首頁 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;