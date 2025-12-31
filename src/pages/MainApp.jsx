import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { useNavigate } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { collection, addDoc, query, onSnapshot, orderBy, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from '../firebase';

import 'react-calendar/dist/Calendar.css';

function MainApp({ user }) {
  const navigate = useNavigate();
  const [realName, setRealName] = useState('載入中...');
  const [date, setDate] = useState(new Date());
  const [records, setRecords] = useState([]);
  
  // 表單與編輯狀態
  const [shift, setShift] = useState('');
  const [content, setContent] = useState('');
  const [note, setNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [filter, setFilter] = useState('全部');
  const [selectedIds, setSelectedIds] = useState([]);

  const employeeId = user.email.split('@')[0];

  // 1. 自動讀取員工姓名
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const docRef = doc(db, "employees", employeeId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRealName(docSnap.data().name);
        } else {
          setRealName(employeeId);
        }
      } catch (err) { console.error(err); }
    };
    fetchUserName();
  }, [employeeId]);

  // 2. 即時監聽資料庫
  useEffect(() => {
    const q = query(collection(db, "todo-records"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecords(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
    }, (err) => console.error(err));
    return () => unsubscribe();
  }, []);

  // 3. 切換完成狀態與選取邏輯
  const handleToggleRecord = async (e, id, currentCompleted) => {
    if (e.stopPropagation) e.stopPropagation();
    try {
      const docRef = doc(db, "todo-records", id);
      await updateDoc(docRef, { completed: !currentCompleted });
      setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } catch (err) { console.error(err); }
  };

  // 4. 編輯功能邏輯
  const handleEditClick = (e, item) => {
    if (e.stopPropagation) e.stopPropagation();
    setIsEditing(true);
    setEditId(item.id);
    setShift(item.shift);
    setContent(item.content);
    setNote(item.note || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setShift('');
    setContent('');
    setNote('');
  };

  // 5. 提交表單 (新增或更新)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const docRef = doc(db, "todo-records", editId);
        await updateDoc(docRef, { shift, content, note, lastEditedAt: new Date() });
        alert("修改成功！");
      } else {
        await addDoc(collection(db, "todo-records"), {
          date: date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }),
          name: realName, 
          shift, content, note,
          uid: user.uid,
          completed: false, 
          createdAt: new Date()
        });
        alert("紀錄已新增！");
      }
      handleCancelEdit();
    } catch (err) { console.error(err); }
  };

  // 6. 刪除選取項目
  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`確定要刪除這 ${selectedIds.length} 筆紀錄嗎？`)) {
      try {
        for (const id of selectedIds) {
          await deleteDoc(doc(db, "todo-records", id));
        }
        setSelectedIds([]);
      } catch (err) { console.error(err); }
    }
  };

  const filteredRecords = filter === '全部' ? records : records.filter(r => r.shift === filter);

  return (
    <div className="container py-3 py-md-5">
      {/* 頂部導覽 */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-2">
        <div>
          <h4 className="fw-bold text-primary mb-0"><i className="bi bi-person-circle me-2"></i>{realName}</h4>
          <p className="text-muted mb-0 small ps-4">工號：{employeeId}</p>
        </div>
        <button className="btn btn-outline-danger px-4 fw-bold shadow-sm d-flex align-items-center gap-2" onClick={() => signOut(auth)}>
          <i className="bi bi-box-arrow-right"></i> 登出
        </button>
      </div>

      <div className="row g-4 d-flex align-items-stretch">
        {/* 左側：表單 */}
        <div className="col-lg-7 order-1 order-lg-2">
          <div className={`card shadow-lg border-0 h-100 ${isEditing ? 'border-warning border-3' : ''}`}>
            <div className={`${isEditing ? 'bg-warning text-dark' : 'bg-primary text-white'} text-center py-4 transition-all`}>
              <h2 className="fw-bold mb-0">
                <i className={`bi ${isEditing ? 'bi-pencil-square' : 'bi-journal-plus'} me-2`}></i>
                {isEditing ? '修改交接紀錄' : '交接紀錄填寫'}
              </h2>
            </div>
            <div className="card-body p-4 bg-white">
              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-bold fs-5">記錄人</label>
                    <input type="text" className="form-control bg-light fs-5 py-2" value={realName} readOnly />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold fs-5">交接班別</label>
                    <select className="form-select fs-5 py-2" value={shift} onChange={(e)=>setShift(e.target.value)} required>
                      <option value="" disabled>請選擇</option>
                      <option value="全體">全體</option>
                      <option value="早班">早班</option>
                      <option value="中班">中班</option>
                      <option value="晚班">晚班</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label fw-bold fs-5">交接事項</label>
                  <textarea className="form-control fs-5" rows="5" value={content} onChange={(e)=>setContent(e.target.value)} required placeholder="請輸入需要交接的詳細內容..."></textarea>
                </div>
                <div className="mb-4">
                  <label className="form-label fw-bold fs-5">備註 (選填)</label>
                  <input type="text" className="form-control fs-5 py-2" value={note} onChange={(e)=>setNote(e.target.value)} />
                </div>
                <div className="d-grid gap-2 d-md-flex">
                  <button type="submit" className="btn btn-warning btn-lg fw-bold shadow-sm py-3 flex-grow-1">
                    {isEditing ? '儲存修改內容' : '確認新增紀錄'}
                  </button>
                  {isEditing && (
                    <button type="button" className="btn btn-secondary btn-lg fw-bold px-4" onClick={handleCancelEdit}>取消</button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* 右側：日曆 */}
        <div className="col-lg-5 order-2 order-lg-1">
          <div className="card shadow-lg border-0 h-100">
            <div className="bg-primary text-white d-flex justify-content-between align-items-center py-3 px-3">
              <h4 className="fw-bold mb-0"><i className="bi bi-calendar3 me-2"></i>選擇日期</h4>
              <button onClick={() => navigate('/expiry')} className="btn btn-sm btn-warning fw-bold shadow-sm px-3 d-flex align-items-center gap-2">
                <i className="bi bi-box-seam"></i> 即期商品
              </button>
            </div>
            <div className="card-body bg-white d-flex flex-column align-items-center justify-content-center p-3">
              <div className="w-100 overflow-auto d-flex justify-content-center">
                <Calendar onChange={setDate} value={date} />
              </div>
              <div className="mt-4 text-center">
                <span className="badge bg-warning text-dark px-4 py-2 fs-5 shadow-sm">
                  {date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 下方：歷史紀錄 */}
      <div className="mt-5 pt-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 border-bottom border-3 border-primary pb-3">
          <h2 className="text-primary fw-bold mb-3 mb-md-0 fs-3"><i className="bi bi-clock-history me-2"></i>交接紀錄歷史</h2>
          <div className="d-flex gap-2 flex-wrap align-items-center">
            {['全部', '早班', '中班', '晚班'].map(b => (
              <button key={b} onClick={() => setFilter(b)} className={`btn ${filter === b ? 'btn-primary' : 'btn-outline-primary'} px-3 py-2 fw-bold`}>
                {b}
              </button>
            ))}
            <button className="btn btn-danger px-3 py-2 ms-md-2 fw-bold d-flex align-items-center gap-2" onClick={deleteSelected} disabled={selectedIds.length === 0}>
              <i className="bi bi-trash3"></i> 刪除選取 ({selectedIds.length})
            </button>
          </div>
        </div>

        <div className="row g-4">
          {filteredRecords.map((item) => (
            <div className="col-md-6 col-lg-4" key={item.id}>
              <div 
                className={`card h-100 shadow border-0 transition-all ${item.completed ? 'opacity-50 bg-light' : 'bg-white'}`}
                style={selectedIds.includes(item.id) ? {boxShadow: '0 0 0 3px #0d6efd'} : {}}
              >
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3 px-3">
                  <div className="d-flex align-items-center">
                    <input 
                      className="form-check-input ms-0 me-2" 
                      type="checkbox" 
                      style={{ width: '1.4rem', height: '1.4rem', cursor: 'pointer' }}
                      checked={selectedIds.includes(item.id)} 
                      onChange={(e) => handleToggleRecord(e, item.id, item.completed)} 
                    />
                    <span className="fw-bold fs-6">{item.date}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {/* 修改後的編輯按鈕：Bootstrap Icon 版 */}
                    <button 
                      className="btn btn-sm btn-light d-flex align-items-center justify-content-center shadow-sm"
                      style={{ borderRadius: '8px', padding: '5px 8px' }}
                      onClick={(e) => handleEditClick(e, item)}
                    >
                      <i className="bi bi-pencil-square text-primary"></i>
                    </button>
                    <span className="badge bg-warning text-dark px-2 py-1 fs-6">{item.shift}</span>
                  </div>
                </div>

                <div className="card-body p-4" onClick={(e) => handleToggleRecord(e, item.id, item.completed)} style={{ cursor: 'pointer' }}>
                  <h5 className={`fw-bold text-primary mb-3 fs-4 ${item.completed ? 'text-decoration-line-through text-muted' : ''}`}>
                    記錄人：{item.name}
                  </h5>
                  <p className={`card-text mb-3 fs-5 ${item.completed ? 'text-decoration-line-through text-muted' : ''}`} style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {item.content}
                  </p>
                  {item.note && (
                    <div className="mt-3 p-3 bg-white border-start border-4 border-warning rounded shadow-sm">
                      <strong className="fs-6 d-block mb-1 text-dark">備註：</strong>
                      <span className={`fs-6 ${item.completed ? 'text-decoration-line-through text-muted' : 'text-muted'}`}>{item.note}</span>
                    </div>
                  )}
                  {item.completed && <div className="mt-3 text-end text-success fw-bold"><i className="bi bi-check-all me-1"></i>已完成</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MainApp;