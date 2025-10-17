import React, { useState } from "react";
import { Edit, Trash2, Save, FileText } from "lucide-react";

const BankMasterPage: React.FC<{ goBack: () => void }> = ({ goBack }) => {
  const [banks, setBanks] = useState([]);
  const [bankNumber, setBankNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [branch, setBranch] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [editingId, setEditingId] = useState(null);

  const handleSave = () => {
    if (!bankNumber.trim()) {
      alert("कृपया बँक क्रमांक प्रविष्ट करा!");
      return;
    }

    if (!bankName.trim()) {
      alert("कृपया बँकेचे नाव प्रविष्ट करा!");
      return;
    }

    // Check if bank number already exists (when adding new)
    if (!editingId && banks.some(bank => bank.bankNumber === bankNumber)) {
      alert("हा बँक क्रमांक आधीपासून अस्तित्वात आहे!");
      return;
    }

    if (editingId) {
      // Update existing bank
      setBanks(banks.map(bank => 
        bank.id === editingId 
          ? { ...bank, bankNumber, name: bankName, branch, ifsc }
          : bank
      ));
      setEditingId(null);
    } else {
      // Add new bank
      const newBank = {
        id: Date.now(), // Use timestamp as unique ID
        bankNumber,
        name: bankName,
        branch,
        ifsc,
      };
      setBanks([...banks, newBank]);
    }

    // Reset form
    setBankNumber("");
    setBankName("");
    setBranch("");
    setIfsc("");
  };

  const handleEdit = (bank) => {
    setBankNumber(bank.bankNumber);
    setBankName(bank.name);
    setBranch(bank.branch);
    setIfsc(bank.ifsc);
    setEditingId(bank.id);
  };

  const handleDelete = (id) => {
    if (window.confirm("तुम्हाला ही बँक खरोखर हटवायची आहे?")) {
      setBanks(banks.filter((bank) => bank.id !== id));
    }
  };

  const handleCancel = () => {
    setBankNumber("");
    setBankName("");
    setBranch("");
    setIfsc("");
    setEditingId(null);
  };

  const handleReport = () => {
    if (banks.length === 0) {
      alert("कोणतीही बँक माहिती उपलब्ध नाही!");
      return;
    }
    
    // Generate report - you can modify this to export to PDF/Excel
    const reportData = banks.map(bank => 
      `बँक क्रमांक: ${bank.bankNumber}, नाव: ${bank.name}, शाखा: ${bank.branch}, IFSC: ${bank.ifsc}`
    ).join('\n');
    
    alert(`बँक अहवाल:\n\n${reportData}`);
  };

  return (
    <div className="bank-master-container">
      {/* Header */}
      <div className="header-container">
        <div className="header-left">
          <button 
            onClick={goBack} 
            className="back-button"
          >
            ← मागे जा
          </button>
        </div>
        <div className="header-right">
        </div>
      </div>

      {/* Form */}
      <div className="form-container">
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">
              बँक क्रमांक *
            </label>
            <input
              type="text"
              value={bankNumber}
              onChange={(e) => setBankNumber(e.target.value)}
              className="form-input"
              placeholder="बँक क्रमांक प्रविष्ट करा"
            />
          </div>

          <div className="form-field full-width">
            <label className="form-label">
              बँकेचे नाव *
            </label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="form-input"
              placeholder="बँकेचे नाव प्रविष्ट करा"
            />
          </div>

          <div className="form-field">
            <label className="form-label">
              बँक शाखा
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="form-input"
              placeholder="शाखा प्रविष्ट करा"
            />
          </div>

          <div className="form-field">
            <label className="form-label">
              IFSC कोड
            </label>
            <input
              type="text"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              className="form-input"
              placeholder="IFSC कोड प्रविष्ट करा"
              maxLength={11}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="form-buttons">
          <button
            onClick={handleSave}
            className="btn btn-primary"
          >
            <Save size={18} />
            {editingId ? 'अपडेट करा' : 'सेव्ह करा'}
          </button>
          
          {editingId && (
            <button 
              onClick={handleCancel}
              className="btn btn-secondary"
            >
              रद्द करा
            </button>
          )}
          
          <button 
            onClick={handleReport}
            className="btn btn-primary"
          >
            <FileText size={18} />
            अहवाल
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-header">
          <h3 className="table-title">
            बँक यादी ({banks.length} बँका)
          </h3>
        </div>
        
        {banks.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} className="empty-icon" />
            <p>अजाही कोणतीही बँक माहिती उपलब्ध नाही</p>
            <p className="empty-subtext">वरील फॉर्म वापरून नवीन बँक जोडा</p>
          </div>
        ) : (
          <table className="data-table">
            <thead className="table-head">
              <tr>
                <th className="table-header-cell">बँक क्रमांक</th>
                <th className="table-header-cell">बँकेचे नाव</th>
                <th className="table-header-cell">शाखा</th>
                <th className="table-header-cell">IFSC कोड</th>
                <th className="table-header-cell action-cell">क्रिया</th>
              </tr>
            </thead>
            <tbody>
              {banks.map((bank, index) => (
                <tr 
                  key={bank.id} 
                  className={`table-row ${editingId === bank.id ? 'editing-row' : ''}`}
                >
                  <td className="table-cell">
                    {bank.bankNumber}
                  </td>
                  <td className="table-cell capitalize">
                    {bank.name}
                  </td>
                  <td className="table-cell capitalize">
                    {bank.branch || '-'}
                  </td>
                  <td className="table-cell ifsc-cell">
                    {bank.ifsc || '-'}
                  </td>
                  <td className="table-cell action-cell">
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEdit(bank)}
                        className="action-btn edit-btn"
                        title="सुधारणा करा"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(bank.id)}
                        className="action-btn delete-btn"
                        title="हटवा"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary */}
      {banks.length > 0 && (
        <div className="summary">
          <p>एकूण बँका: <span className="summary-count">{banks.length}</span></p>
        </div>
      )}

      <style jsx>{`
        .bank-master-container {
          background: linear-gradient(to right, #eff6ff, #faf5ff);
          min-height: 100vh;
          padding: 20px;
        }

        /* Header Styles */
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 12px 24px;
          border: 1px solid #e5e7eb;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .back-button {
          background: #f97316;
          color: white;
          font-weight: 500;
          border-radius: 8px;
          padding: 8px 16px;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .back-button:hover {
          background: #ea580c;
        }

        /* Form Styles */
        .form-container {
          background: white;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          padding: 24px;
          margin-top: 24px;
          border: 1px solid #e5e7eb;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr 1fr 1fr 1fr;
          }
          .full-width {
            grid-column: span 3;
          }
        }

        .form-field {
          margin-bottom: 8px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #4b5563;
          margin-bottom: 4px;
        }

        .form-input {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .form-buttons {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
        }

        .btn-primary:hover {
          background: #1d4ed8;
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background: #4b5563;
        }

        /* Table Styles */
        .table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-top: 24px;
          border: 1px solid #e5e7eb;
          overflow-x: auto;
        }

        .table-header {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .table-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .empty-state {
          padding: 32px;
          text-align: center;
          color: #6b7280;
        }

        .empty-icon {
          margin: 0 auto 12px auto;
          color: #d1d5db;
        }

        .empty-subtext {
          font-size: 14px;
          margin-top: 4px;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        .table-head {
          background: #2563eb;
        }

        .table-header-cell {
          border: 1px solid #e5e7eb;
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: white;
        }

        .action-cell {
          text-align: center;
        }

        .table-row {
          transition: background-color 0.2s;
        }

        .table-row:hover {
          background-color: #f9fafb;
        }

        .editing-row {
          background-color: #eff6ff;
        }

        .table-cell {
          border: 1px solid #e5e7eb;
          padding: 12px 16px;
          color: #1f2937;
        }

        .ifsc-cell {
          font-family: monospace;
        }

        .capitalize {
          text-transform: capitalize;
        }

        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #374151;
          padding: 6px 12px;
          border-radius: 4px;
          border: none;
          background: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .action-btn:hover {
          background-color: #f3f4f6;
        }

        /* Summary Styles */
        .summary {
          margin-top: 16px;
          font-size: 14px;
          color: #6b7280;
        }

        .summary-count {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default BankMasterPage;