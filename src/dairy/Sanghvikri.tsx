import React, { useState } from "react";
import "./css/Sanghvikri.css";

interface SanghvikriProps {
  onBack: () => void;
}

const Sanghvikri: React.FC<SanghvikriProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    date: "",
    vel: "",
    sanghNo: "",
    sanghName: "",
    prakar: "",
    pathavlele: "",
    prapt: "",
    fat: "",
    snf: "",
    commission: "",
    dar: "",
    rakkam: "",
    vasDudh: "",
    vasRakkam: "",
    duyyamDudh: "",
    duyyamRakkam: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    alert("Data saved successfully!");
  };

  return (
    <div className="sanghvikri-container">
      {/* Header */}
      <div className="header">
        <button className="back-btn" onClick={onBack}>⬅ मागे जा</button>
      </div>

      {/* -------- FIRST ROW -------- */}
      <div className="form-row first-row">
        <div className="form-item">
          <label>दिनांक</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
        </div>
        <div className="form-item">
          <label>वेळ</label>
          <select name="vel" value={formData.vel} onChange={handleChange}>
            <option value="">निवडा</option>
            <option value="सकाळ">सकाळ</option>
            <option value="संध्याकाळ">संध्याकाळ</option>
          </select>
        </div>
        <div className="form-item">
          <label>संघ क्रमांक</label>
          <input
            type="text"
            name="sanghNo"
            value={formData.sanghNo}
            onChange={handleChange}
          />
        </div>
        <div className="form-item">
          <label>संघाचे नाव</label>
          <input
            type="text"
            name="sanghName"
            value={formData.sanghName}
            onChange={handleChange}
          />
        </div>
        <div className="form-item">
          <label>प्रकार</label>
          <input
            type="text"
            name="prakar"
            value={formData.prakar}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* -------- SECOND ROW WITH SCROLL -------- */}
      <div className="scroll-container">
        <div className="form-row second-row">
          <div className="form-item small">
            <label>पाठवलेली लिटर</label>
            <input
              type="text"
              name="pathavlele"
              value={formData.pathavlele}
              onChange={handleChange}
            />
          </div>
          <div className="form-item small">
            <label>प्राप्त लिटर</label>
            <input
              type="text"
              name="prapt"
              value={formData.prapt}
              onChange={handleChange}
            />
          </div>
          <div className="form-item small">
            <label>फॅट</label>
            <input
              type="text"
              name="fat"
              value={formData.fat}
              onChange={handleChange}
            />
          </div>
          <div className="form-item small">
            <label>एस.एन.एफ</label>
            <input
              type="text"
              name="snf"
              value={formData.snf}
              onChange={handleChange}
            />
          </div>
          <div className="form-item small">
            <label>अ. कमिशन</label>
            <input
              type="text"
              name="commission"
              value={formData.commission}
              onChange={handleChange}
            />
          </div>
          <div className="form-item small">
            <label>दर</label>
            <input
              type="text"
              name="dar"
              value={formData.dar}
              onChange={handleChange}
            />
          </div>
          <div className="form-item small">
            <label>रक्कम</label>
            <input
              type="text"
              name="rakkam"
              value={formData.rakkam}
              onChange={handleChange}
            />
          </div>

          <div className="divider">||</div>

          <div className="form-item small">
            <label>वासाचे दूध</label>
            <input
              type="text"
              name="vasDudh"
              value={formData.vasDudh}
              onChange={handleChange}
            />
          </div>
          <div className="form-item small">
            <label>रक्कम</label>
            <input
              type="text"
              name="vasRakkam"
              value={formData.vasRakkam}
              onChange={handleChange}
            />
          </div>

          <div className="divider">||</div>

          <div className="form-item small">
            <label>दुय्यम दूध</label>
            <input
              type="text"
              name="duyyamDudh"
              value={formData.duyyamDudh}
              onChange={handleChange}
            />
          </div>
          <div className="form-item small">
            <label>रक्कम</label>
            <input
              type="text"
              name="duyyamRakkam"
              value={formData.duyyamRakkam}
              onChange={handleChange}
            />
          </div>

          <button className="save-btn" onClick={handleSave}>
            💾 Save
          </button>
        </div>
      </div>

      {/* -------- TABLE -------- */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>क्र.</th>
              <th>संघ क्रमांक</th>
              <th>संघाचे नाव</th>
              <th>प्रकार</th>
              <th>पाठवलेले दूध</th>
              <th>प्राप्त लिटर</th>
              <th>फॅट</th>
              <th>एस.एन.एफ</th>
              <th>अ. कमिशन</th>
              <th>दर</th>
              <th>रक्कम</th>
              <th>वासाचे दूध</th>
              <th>रक्कम</th>
              <th>दुय्यम दूध</th>
              <th>रक्कम</th>
              <th>क्रिया</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={16}>डेटा उपलब्ध नाही</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sanghvikri;