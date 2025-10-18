import React, { useState } from "react";
import "./SabhasadReportPage.css";

const SabhasadReportPage: React.FC = () => {
  const [fromDate, setFromDate] = useState("2025-10-01");
  const [toDate, setToDate] = useState("2025-10-10");
  const [fromKhate, setFromKhate] = useState("1");
  const [toKhate, setToKhate] = useState("52");

  const tableHeaders = [
    "खाते क्रमांक",
    "नाव",
    "बील",
    "रक्कम",
    "ठेव कपात(-)",
    "एकून अॅडव्हान्स",
    "अॅडव्हान्स कपात",
    "अॅडव्हान्स बाकी",
    "एकून खाद्य",
    "खाद्य कपात",
    "खाद्य बाकी",
    "एकून रतीब",
    "रतीब कपात",
    "रतीब बाकी",
    "इ.कपात",
    "अदा"
  ];

  return (
    <div className="sabhasad-container">
      {/* ======= HEADER SECTION ======= */}
      <div className="sabhasad-header">
        <div className="sabhasad-left">
          <label>दिनांक</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <span>ते</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />

          <label>खाते क्र</label>
          <input
            type="number"
            value={fromKhate}
            onChange={(e) => setFromKhate(e.target.value)}
          />
          <span>ते</span>
          <input
            type="number"
            value={toKhate}
            onChange={(e) => setToKhate(e.target.value)}
          />

          <button className="btn-blue">बील पाहा</button>
          <button className="btn-green">ट्रायल प्रिंट</button>
        </div>

        <div className="sabhasad-right">
          <button className="btn-orange">नवीन बील</button>
        </div>
      </div>

      {/* ======= TABLE SECTION ======= */}
      <div className="sabhasad-table-container">
        <table className="sabhasad-table">
          <thead>
            <tr>
              {tableHeaders.map((header, i) => (
                <th key={i}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total</td>
              {Array.from({ length: tableHeaders.length - 1 }).map((_, i) => (
                <td key={i}>0.00</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SabhasadReportPage;
