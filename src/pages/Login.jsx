import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase';

function Login() {
  const [employeeId, setEmployeeId] = useState(''); // 這裡輸入 8875
  const [password, setPassword] = useState('');     // 這裡輸入密碼

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // 背後自動補全 Email 格式
    const fakeEmail = `${employeeId}@company.com`;

    try {
      await signInWithEmailAndPassword(auth, fakeEmail, password);
      // 登入成功後，App.jsx 會自動偵測到 user 狀態改變並跳轉
    } catch (error) {
      console.error(error);
      alert("工號或密碼錯誤！(提示：密碼需 6 位數以上)");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-lg border-0 p-4" style={{ width: '350px' }}>
        <h3 className="text-center fw-bold mb-4 text-primary">系統登入</h3>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-bold">員工工號</label>
            <input 
              type="text" className="form-control" placeholder="請輸入工號 (如: 8875)"
              value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required 
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-bold">登入密碼</label>
            <input 
              type="password" className="form-control" placeholder="請輸入密碼"
              value={password} onChange={(e) => setPassword(e.target.value)} required 
            />
          </div>
          <button className="btn btn-primary w-100 fw-bold">立即登入</button>
        </form>
      </div>
    </div>
  );
}

export default Login;