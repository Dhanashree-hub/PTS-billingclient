import React, { useState } from "react";
import "./css/VahtukPage.css";
import cowImage from "../../src/assets/cowimage.png";

const VahtukPage = ({ goBack }) => {  // Add goBack prop here
  const [formData, setFormData] = useState({
    mhaisThev: "",
    advanceHapta: "",
    eKapatLitre: "",
    mhaisVahtuk: "",
    mhaisCommission: "",
    gayThev: "",
    eKapatBill: "",
    gayVahtuk: "",
    gayCommission: ""
  });

  const [tableData, setTableData] = useState([]);
  const [editingRow, setEditingRow] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!formData.mhaisThev) {
      alert("कृपया किमान म्हैस ठेव भरा!");
      return;
    }

    const newRow = {
      id: tableData.length + 1,
      khateNumber: `KH${String(tableData.length + 1).padStart(3, '0')}`,
      nav: `ग्राहक ${tableData.length + 1}`,
      mhaisThev: parseFloat(formData.mhaisThev) || 0,
      gayThev: parseFloat(formData.gayThev) || 0,
      advanceHapta: parseFloat(formData.advanceHapta) || 0,
      khadyaHapta: parseFloat(formData.mhaisCommission) || 0, // Using mhaisCommission for khadya hapta
      eKapatLitre: parseFloat(formData.eKapatLitre) || 0,
      mhaisVahtuk: parseFloat(formData.mhaisVahtuk) || 0,
      gayVahtuk: parseFloat(formData.gayVahtuk) || 0
    };

    setTableData([...tableData, newRow]);
    
    // Reset form
    setFormData({
      mhaisThev: "",
      advanceHapta: "",
      eKapatLitre: "",
      mhaisVahtuk: "",
      mhaisCommission: "",
      gayThev: "",
      eKapatBill: "",
      gayVahtuk: "",
      gayCommission: ""
    });

    alert("माहिती टेबलमध्ये सेव झाली!");
  };

  const handleNewBatch = () => {
    setTableData([]);
    setFormData({
      mhaisThev: "",
      advanceHapta: "",
      eKapatLitre: "",
      mhaisVahtuk: "",
      mhaisCommission: "",
      gayThev: "",
      eKapatBill: "",
      gayVahtuk: "",
      gayCommission: ""
    });
    setEditingRow(null);
    alert("नवीन बॅच तयार झाली!");
  };

  const handleEdit = (row) => {
    setFormData({
      mhaisThev: row.mhaisThev,
      advanceHapta: row.advanceHapta,
      eKapatLitre: row.eKapatLitre,
      mhaisVahtuk: row.mhaisVahtuk,
      mhaisCommission: row.khadyaHapta,
      gayThev: row.gayThev,
      eKapatBill: "0",
      gayVahtuk: row.gayVahtuk,
      gayCommission: "0"
    });
    setEditingRow(row.id);
  };

  const handleUpdate = () => {
    if (!editingRow) return;

    const updatedTableData = tableData.map(row => {
      if (row.id === editingRow) {
        return {
          ...row,
          mhaisThev: parseFloat(formData.mhaisThev) || 0,
          gayThev: parseFloat(formData.gayThev) || 0,
          advanceHapta: parseFloat(formData.advanceHapta) || 0,
          khadyaHapta: parseFloat(formData.mhaisCommission) || 0,
          eKapatLitre: parseFloat(formData.eKapatLitre) || 0,
          mhaisVahtuk: parseFloat(formData.mhaisVahtuk) || 0,
          gayVahtuk: parseFloat(formData.gayVahtuk) || 0
        };
      }
      return row;
    });

    setTableData(updatedTableData);
    setEditingRow(null);
    
    // Reset form
    setFormData({
      mhaisThev: "",
      advanceHapta: "",
      eKapatLitre: "",
      mhaisVahtuk: "",
      mhaisCommission: "",
      gayThev: "",
      eKapatBill: "",
      gayVahtuk: "",
      gayCommission: ""
    });

    alert("माहिती अपडेट झाली!");
  };

  return (
    <div className="vahtuk-container">
      <div className="vahtuk-header">
        <button className="back-btn1" onClick={goBack}>←</button> {/* Add onClick handler here */}
        <b className="header-title">सर्व सभासदासाथी सेट 
करणे</b>
      </div>

     
      {/* Full Width Form Section */}
      <div className="full-width-form">
        <div className="form-grid-full">
          {/* First Row - 5 fields */}
          <div className="form-group-full">
            <label>म्हैस ठेव / लिटर</label>
            <input 
              type="number" 
              name="mhaisThev" 
              value={formData.mhaisThev} 
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="form-group-full">
            <label>अॅडव्हान्स हप्ता / बिल</label>
            <input 
              type="number" 
              name="advanceHapta" 
              value={formData.advanceHapta} 
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="form-group-full">
            <label>ई-कपात / लिटर</label>
            <input 
              type="number" 
              name="eKapatLitre" 
              value={formData.eKapatLitre} 
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="form-group-full">
            <label>म्हैस वाहतूक / लिटर</label>
            <input 
              type="number" 
              name="mhaisVahtuk" 
              value={formData.mhaisVahtuk} 
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="form-group-full">
            <label>म्हैस कमिशन / लिटर</label>
            <input 
              type="number" 
              name="mhaisCommission" 
              value={formData.mhaisCommission} 
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          {/* Second Row - 5 fields (with one empty field) */}
          <div className="form-group-full">
            <label>गाय ठेव / लिटर</label>
            <input 
              type="number" 
              name="gayThev" 
              value={formData.gayThev} 
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="form-group-full">
            <label>-</label>
            <input type="text" disabled placeholder="-" />
          </div>

          <div className="form-group-full">
            <label>ई-कपात / बिल</label>
            <input 
              type="number" 
              name="eKapatBill" 
              value={formData.eKapatBill} 
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="form-group-full">
            <label>गाय वाहतूक / लिटर</label>
            <input 
              type="number" 
              name="gayVahtuk" 
              value={formData.gayVahtuk} 
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="form-group-full">
            <label>गाय कमिशन / लिटर</label>
            <input 
              type="number" 
              name="gayCommission" 
              value={formData.gayCommission} 
              onChange={handleChange}
              placeholder="0"
            />
          </div>
        </div>

        <div className="button-row-center">
          <button className="orange-btn-full" onClick={handleNewBatch}>
            नवी कामासाठी बॅच बनवा
          </button>
          {editingRow ? (
            <button className="orange-btn-full" onClick={handleUpdate}>
              अपडेट करा
            </button>
          ) : (
            <button className="orange-btn-full" onClick={handleSave}>
              प्रत्यय भरा
            </button>
          )}
        </div>
      </div>
      <h1 className="section-title"></h1>

      {/* Table and Cow Image Side by Side */}
      <div className="table-cow-container">
        <div className="table-section-full">
          <div className="table-header">
            <h3>वाहतूक तपशील</h3>
            <div className="table-info">
              एकूण नोंदी: {tableData.length}
            </div>
          </div>
          <div className="table-container-full">
            <table>
              <thead>
                <tr>
                  <th>क्र</th>
                  <th>खाते क्र</th>
                  <th>नाव</th>
                  <th>म्हैस ठेव</th>
                  <th>गाय ठेव</th>
                  <th>अॅडव्हान्स</th>
                  <th>खाद्य हप्ता</th>
                  <th>ई-कपात</th>
                  <th>म्हैस वाहतूक</th>
                  <th>गाय वाहतूक</th>
                  <th>क्रिया</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="no-data">
                      अजून कोणतीही माहिती नाही. कृपया प्रत्यय भरा बटण वापरा.
                    </td>
                  </tr>
                ) : (
                  tableData.map((row) => (
                    <tr key={row.id} className={editingRow === row.id ? 'editing-row' : ''}>
                      <td>{row.id}</td>
                      <td>{row.khateNumber}</td>
                      <td>{row.nav}</td>
                      <td>{row.mhaisThev}</td>
                      <td>{row.gayThev}</td>
                      <td>{row.advanceHapta}</td>
                      <td>{row.khadyaHapta}</td>
                      <td>{row.eKapatLitre}</td>
                      <td>{row.mhaisVahtuk}</td>
                      <td>{row.gayVahtuk}</td>
                      <td>
                        <button 
                          className="edit-btn"
                          onClick={() => handleEdit(row)}
                          title="सुधारणा करा"
                        >
                          ✏️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="cow-image-side">
          <img src={cowImage} alt="cow" className="cow-img-side" />
        </div>
      </div>
    </div>
  );
};

export default VahtukPage;