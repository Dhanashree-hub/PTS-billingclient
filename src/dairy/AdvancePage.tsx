import React, { useState } from "react";
import "./css/AdvancePage.css";

const AdvancePage = ({ onBack }: { onBack: () => void }) => {
  const [date, setDate] = useState("");
  const [khateNo, setKhateNo] = useState("");
  const [memberName, setMemberName] = useState("");
  const [prakar, setPrakar] = useState("प्रकार निवडा");
  const [rakkam, setRakkam] = useState("");
  const [remark, setRemark] = useState("");
  const [records, setRecords] = useState<any[]>([]);

  const handleSave = () => {
    if (!date || !khateNo || !memberName || !prakar || !rakkam) {
      alert("कृपया सर्व माहिती भरा.");
      return;
    }
    const newRecord = {
      id: records.length + 1,
      date,
      khateNo,
      memberName,
      prakar,
      rakkam,
      remark,
    };
    setRecords([...records, newRecord]);
    setKhateNo("");
    setMemberName("");
    setPrakar("प्रकार निवडा");
    setRakkam("");
    setRemark("");
  };

  const handleDelete = (id: number) => {
    setRecords(records.filter((r) => r.id !== id));
  };

  return (
    <div className="advance-container">
      {/* 🔙 Header with Back Button */}
      <div className="header">
        <div className="title-section">
          <span className="icon">🏦</span>
          <h2>अॅडव्हान्स / उचल</h2>
        </div>
        <button className="btn-back" onClick={onBack}>
          ⬅ मागे जा
        </button>
      </div>

      {/* दिनांक */}
      <div className="card">
        <div className="row">
          <div className="field">
            <label>दिनांक</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* खाते क्रमांक / सदस्याचे नाव */}
      <div className="card">
        <div className="row">
          <div className="field">
            <label>खाते क्रमांक</label>
            <input
              value={khateNo}
              onChange={(e) => setKhateNo(e.target.value)}
              placeholder="क्रमांक"
            />
          </div>

          <div className="field">
            <label>सदस्याचे नाव</label>
            <input
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="नाव"
            />
          </div>
        </div>
      </div>

      {/* प्रकार / रक्कम / Remarks */}
      <div className="card">
        <div className="row">
          <div className="field">
            <label>प्रकार</label>
            <select value={prakar} onChange={(e) => setPrakar(e.target.value)}>
              <option>प्रकार निवडा</option>
              <option>अॅडव्हान्स</option>
              <option>उचल</option>
            </select>
          </div>

          <div className="field">
            <label>रक्कम</label>
            <input
              value={rakkam}
              onChange={(e) => setRakkam(e.target.value)}
              type="number"
              placeholder="रक्कम"
            />
          </div>

          <div className="field remark-field">
            <label>टीप</label>
            <input
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="टीप"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="button-row">
        <button className="btn-blue" onClick={handleSave}>
          💾 सेव्ह
        </button>
        <button className="btn-blue">📋 विक्री यादी</button>
      </div>

      {/* Table */}
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>क्र.</th>
              <th>दिनांक</th>
              <th>खाते क्र.</th>
              <th>नाव</th>
              <th>प्रकार</th>
              <th>रक्कम</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={7}>नोंद आढळली नाही.</td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.date}</td>
                  <td>{r.khateNo}</td>
                  <td>{r.memberName}</td>
                  <td>{r.prakar}</td>
                  <td>{r.rakkam}</td>
                  <td>
                    <button
                      className="btn-action delete"
                      onClick={() => handleDelete(r.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdvancePage;
