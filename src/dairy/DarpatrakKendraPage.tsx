import React, { useState } from "react";
import "./css/DarpatrakKendraPage.css";

const DarpatrakKendraPage = ({ goBack }) => {
  const [mahisRate, setMahisRate] = useState("");
  const [gaiRate, setGaiRate] = useState("");
  const [dep, setDep] = useState("");
  const [prakar, setPrakar] = useState("");
  const [fat1, setFat1] = useState("0");
  const [fat2, setFat2] = useState("0");
  const [snf1, setSnf1] = useState("0");
  const [snf2, setSnf2] = useState("0");

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content">
        <div className="dk-outer">
          <div className="dk-card">
            {/* Header with Marathi title and back button */}
            <div className="dk-page-header">
  <button className="dk-back-btn" onClick={goBack}>
    <b className="dk-back-icon">←</b>
  </button>
  <b className="dk-page-title">दरपत्रक (केंद्र)</b>
</div>


            <div className="dk-header-row">
              <div className="dk-header-inputs inline-right-box">
                <label className="dk-header-label">म्हैस रेटिब दर</label>
                <input
                  value={mahisRate}
                  onChange={e => setMahisRate(e.target.value)}
                  className="dk-header-input"
                />
                <label className="dk-header-label">गाय रेटिब दर</label>
                <input
                  value={gaiRate}
                  onChange={e => setGaiRate(e.target.value)}
                  className="dk-header-input"
                />
                <button className="dk-btn-save">Save</button>
                <button className="dk-btn-new">नवीन दरपत्रक दुरुस्ती</button>
              </div>
            </div>

            <div className="dk-form-section">
              <div className="dk-form-row-single">
                <div className="dk-form-group">
                  <label className="dk-label">दरपत्रक विभाग</label>
                  <select value={dep} onChange={e => setDep(e.target.value)} className="dk-input">
                    <option value="">विभाग निवडा</option>
                    <option value="दरपत्रक विभाग 1">दरपत्रक विभाग 1</option>
                    <option value="दरपत्रक विभाग 2">दरपत्रक विभाग 2</option>
                    <option value="दरपत्रक विभाग 3">दरपत्रक विभाग 3</option>
                    <option value="दरपत्रक विभाग 4">दरपत्रक विभाग 4</option>
                    <option value="दरपत्रक विभाग 5">दरपत्रक विभाग 5</option>
                    <option value="दरपत्रक विभाग 6">दरपत्रक विभाग 6</option>
                    <option value="दरपत्रक विभाग 7">दरपत्रक विभाग 7</option>
                    <option value="दरपत्रक विभाग 8">दरपत्रक विभाग 8</option>
                    <option value="दरपत्रक विभाग 9">दरपत्रक विभाग 9</option>
                  </select>
                </div>
                <div className="dk-form-group">
                  <label className="dk-label">प्रकार</label>
                  <select value={prakar} onChange={e => setPrakar(e.target.value)} className="dk-input">
                    <option value="">प्रकार निवडा</option>
                    <option value="Type1">गाय</option>
                    <option value="Type2">म्हैस</option>
                  </select>
                </div>
                <div className="dk-form-group">
                  <label className="dk-label">फॅट</label>
                  <div className="dk-fat-snf-inputs">
                    <div className="dk-fat-snf-column">
                      <input type="number" value={fat1} onChange={e => setFat1(e.target.value)} className="dk-fat-snf-single"/>
                      <span className="dk-fat-snf-label">ते</span>
                      <input type="number" value={fat2} onChange={e => setFat2(e.target.value)} className="dk-fat-snf-single"/>
                    </div>
                  </div>
                </div>
                <div className="dk-form-group">
                  <label className="dk-label">एस. एन. एफ.</label>
                  <div className="dk-fat-snf-inputs">
                    <div className="dk-fat-snf-column">
                      <input type="number" value={snf1} onChange={e => setSnf1(e.target.value)} className="dk-fat-snf-single"/>
                      <span className="dk-fat-snf-label">ते</span>
                      <input type="number" value={snf2} onChange={e => setSnf2(e.target.value)} className="dk-fat-snf-single"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="dk-table-wrapper">
              <div className="dk-row-table">
                <div className="dk-cell-small">FatSNF</div>
                <div className="dk-cell-large">0.0</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DarpatrakKendraPage;