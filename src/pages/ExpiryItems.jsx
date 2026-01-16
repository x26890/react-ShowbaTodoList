import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, onSnapshot, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from '../firebase';

function ExpiryItems() {
  const navigate = useNavigate();
  const [itemName, setItemName] = useState('');
  const [capacity, setCapacity] = useState('330ml');
  const [expiryDate, setExpiryDate] = useState('');
  const [items, setItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  //清單會依據到期日自動排序
  useEffect(() => {
    const q = query(collection(db, "expiry-liquor"), orderBy("expiryDate", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
    }, (err) => console.error(err));
    return () => unsubscribe();
  }, []);


  const handleEditClick = (item) => {
    setIsEditing(true);
    setEditId(item.id);
    setItemName(item.name);
    setCapacity(item.capacity);
    setExpiryDate(item.expiryDate);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setItemName('');
    setCapacity('330ml');
    setExpiryDate('');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateDoc(doc(db, "expiry-liquor", editId), {
          name: itemName, capacity, expiryDate
        });
        alert("修改成功！");
      } else {
        await addDoc(collection(db, "expiry-liquor"), {
          name: itemName, capacity, expiryDate, createdAt: new Date()
        });
        alert("已加入清單！");
      }
      handleCancelEdit();
    } catch (err) { console.error(err); }
  };

  const deleteItem = async (id) => {
    if (window.confirm("確定要刪除這筆紀錄嗎？")) {
      try { await deleteDoc(doc(db, "expiry-liquor", id)); } catch (err) { console.error(err); }
    }
  };

  return (
    <div className="container py-3 py-md-5">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-3 border-warning">
        <h2 className="fw-bold text-dark mb-0 fs-3">
          <i className="bi bi-beer me-2 text-warning"></i>即期管理
        </h2>
        <button className="btn btn-primary btn-sm fw-bold shadow-sm" onClick={() => navigate('/')}>
          <i className="bi bi-house-door me-1"></i>首頁
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className={`card shadow border-0 ${isEditing ? 'border-warning border-3' : ''}`}>
            <div className={`${isEditing ? 'bg-warning text-dark' : 'bg-dark text-white'} card-header fw-bold py-3`}>
              {isEditing ? '✏️ 修改商品' : '➕ 新增酒類'}
            </div>
            <div className="card-body p-3 p-md-4">
              <form onSubmit={handleAdd}>
                <div className="mb-3">
                  <label className="form-label fw-bold small">酒類名稱</label>
                  <input type="text" className="form-control" value={itemName} onChange={(e)=>setItemName(e.target.value)} required />
                </div>
                <div className="row">
                  <div className="col-6 mb-3">
                    <label className="form-label fw-bold small">容量</label>
                    <select className="form-select" value={capacity} onChange={(e)=>setCapacity(e.target.value)}>
                      <option value="330ml">330ml</option>
                      <option value="500ml">500ml</option>
                      <option value="710ml">710ml</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>
                  <div className="col-6 mb-3">
                    <label className="form-label fw-bold small">到期日</label>
                    <input type="date" className="form-control" value={expiryDate} onChange={(e)=>setExpiryDate(e.target.value)} required />
                  </div>
                </div>
                <div className="d-grid gap-2 mt-2">
                  <button type="submit" className="btn btn-warning fw-bold py-2">{isEditing ? '儲存修改' : '確認加入'}</button>
                  {isEditing && <button type="button" className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>取消</button>}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow border-0 h-100">
            <div className="card-header bg-light fw-bold py-3 px-3 d-flex justify-content-between">
              <span>現有清單</span>
              <span className="badge bg-dark">{items.length} 筆</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr className="text-center text-nowrap small fw-bold">
                      <th className="ps-3 text-start" style={{ minWidth: '100px' }}>品名</th>
                      <th style={{ width: '65px' }}>容量</th>
                      <th style={{ width: '100px' }}>到期日期</th>
                      <th style={{ width: '85px' }}>管理</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="text-center">
                        <td className="ps-3 text-start fw-bold text-dark text-break small">
                          {item.name}
                        </td>
                        <td>
                          <span className="badge bg-info text-dark" style={{ fontSize: '0.7rem' }}>
                            {item.capacity}
                          </span>
                        </td>
                        <td className="text-nowrap">
                          <span className={`fw-bold ${new Date(item.expiryDate) <= new Date() ? 'text-danger' : 'text-primary'}`} style={{ fontSize: '0.85rem' }}>
                            {item.expiryDate}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-0">
                            <button className="btn btn-sm text-primary px-2" onClick={() => handleEditClick(item)}>
                              <i className="bi bi-pencil-square fs-6"></i>
                            </button>
                            <button className="btn btn-sm text-danger px-2" onClick={() => deleteItem(item.id)}>
                              <i className="bi bi-trash3 fs-6"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpiryItems;