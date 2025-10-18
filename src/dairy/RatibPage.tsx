import React, { useState } from "react";
import "./css/RatibPage.css";

const RatibPage = ({ onBack }: { onBack: () => void }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("ग्राहक प्रकार निवडा");
  const [mode, setMode] = useState("उधारी");

  const [grahakNo, setGrahakNo] = useState("");
  const [grahakName, setGrahakName] = useState("");
  const [prakar, setPrakar] = useState("प्रकार निवडा");
  const [litre, setLitre] = useState("");
  const [dar, setDar] = useState("");
  const [rakkam, setRakkam] = useState("");

  const [records, setRecords] = useState<any[]>([]);

  const handleSave = () => {
    if (!grahakNo || !grahakName || !litre || !dar) {
      alert("कृपया सर्व माहिती भरा.");
      return;
    }
    const newRecord = {
      id: records.length + 1,
      type,
      grahakNo,
      grahakName,
      prakar,
      litre,
      dar,
      rakkam: (parseFloat(litre) * parseFloat(dar)).toFixed(2),
      mode,
    };
    setRecords([...records, newRecord]);
    setGrahakNo("");
    setGrahakName("");
    setPrakar("प्रकार निवडा");
    setLitre("");
    setDar("");
    setRakkam("");
  };

  const handleDelete = (id: number) => {
    setRecords(records.filter((r) => r.id !== id));
  };

  return (
    <div className="ratib-container">
     

      {/* Header */}
      <div className="header">
         <button className="btn-back" onClick={onBack}>
          ⬅ मागे जा
        </button>
        <h2 className="btn-nond">रतिब नोंद</h2>
        <button className="btn-cash">💰 रतिब जमा</button>
      </div>

      {/* First Row */}
      <div className="card">
        <div className="row nowrap">
          <div className="field">
            <label>दिनांक</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="field">
            <label>वेळ</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="field">
            <label>ग्राहक प्रकार</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option>ग्राहक प्रकार निवडा</option>
              <option>गाय</option>
              <option>म्हैस</option>
            </select>
          </div>

          <div className="radio-inline">
            <label>
              <input
                type="radio"
                name="mode"
                checked={mode === "उधारी"}
                onChange={() => setMode("उधारी")}
              />
              उधारी
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                checked={mode === "रोख"}
                onChange={() => setMode("रोख")}
              />
              रोख
            </label>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="card">
        <div className="row nowrap">
          <div className="field">
            <label>ग्राहक क्रमांक</label>
            <input
              value={grahakNo}
              onChange={(e) => setGrahakNo(e.target.value)}
              placeholder="क्रमांक"
            />
          </div>

          <div className="field">
            <label>ग्राहक नाव</label>
            <input
              value={grahakName}
              onChange={(e) => setGrahakName(e.target.value)}
              placeholder="नाव"
            />
          </div>

          <div className="field">
            <label>प्रकार</label>
            <select value={prakar} onChange={(e) => setPrakar(e.target.value)}>
              <option>प्रकार निवडा</option>
              <option>गाय दूध</option>
              <option>म्हैस दूध</option>
            </select>
          </div>

          <div className="field">
            <label>लिटर</label>
            <input
              value={litre}
              onChange={(e) => setLitre(e.target.value)}
              type="number"
            />
          </div>

          <div className="field">
            <label>दर</label>
            <input
              value={dar}
              onChange={(e) => setDar(e.target.value)}
              type="number"
            />
          </div>

          <div className="field">
            <label>रक्कम</label>
            <input
              value={
                rakkam ||
                (litre && dar
                  ? (parseFloat(litre) * parseFloat(dar)).toFixed(2)
                  : "")
              }
              onChange={(e) => setRakkam(e.target.value)}
              type="number"
            />
          </div>

          <div className="field">
            <label>&nbsp;</label>
            <button className="btn-primary" onClick={handleSave}>
              सेव्ह
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>क्र.</th>
              <th>ग्राहक प्रकार</th>
              <th>ग्राहक क्रमांक</th>
              <th>ग्राहक नाव</th>
              <th>प्रकार</th>
              <th>लिटर</th>
              <th>दर</th>
              <th>रक्कम</th>
              <th>देय पद्धत</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={10}>नोंद आढळली नाही.</td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.type}</td>
                  <td>{r.grahakNo}</td>
                  <td>{r.grahakName}</td>
                  <td>{r.prakar}</td>
                  <td>{r.litre}</td>
                  <td>{r.dar}</td>
                  <td>{r.rakkam}</td>
                  <td>{r.mode}</td>
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

export default RatibPage;
