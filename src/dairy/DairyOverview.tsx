import React, { useState } from "react";
import MemberForm from "./MemberForm";
import SanghMaster from "./SanghMaster";
import DarpatrakKendraPage from "./DarpatrakKendraPage";
import VahtukPage from "./VahtukPage";
import BankMasterPage from "./BankMasterPage";

const DairyOverview: React.FC = () => {
  const [activePage, setActivePage] = useState<"home" | "member" | "sangh" | "darpatrakKendra" | "vahtuk" | "bankMaster">("home");

  // Conditional Rendering for pages
  if (activePage === "member") {
    return <MemberForm onBack={() => setActivePage("home")} />;
  }

  if (activePage === "sangh") {
    return <SanghMaster onBack={() => setActivePage("home")} />;
  }

  if (activePage === "darpatrakKendra") {
    return <DarpatrakKendraPage goBack={() => setActivePage("home")} />;
  }

  if (activePage === "vahtuk") {
    return <VahtukPage goBack={() => setActivePage("home")} />;
  }

  if (activePage === "bankMaster") {
    return <BankMasterPage goBack={() => setActivePage("home")} />;
  }

  const masterItems = [
    { label: "सभासद मास्टर", emoji: "👨‍🌾", onClick: () => setActivePage("member") },
    { label: "संघ मास्टर", emoji: "🏡", onClick: () => setActivePage("sangh") },
    { label: "नियमित ग्राहक", emoji: "🥛" },
    { label: "खाद्य डीलर", emoji: "🌾" },
    { label: "दरपत्रक (संघ)", emoji: "📄" },
    { label: "दरपत्रक (केंद्र)", emoji: "📄", onClick: () => setActivePage("darpatrakKendra") },
    { label: "वाहतूक / कपात सेटिंग", emoji: "⚙️", onClick: () => setActivePage("vahtuk") },
    { label: "बँक मास्टर", emoji: "🏦", onClick: () => setActivePage("bankMaster") },
  ];

  const infoItems = [
    "आपन सौप्टवेर  मदे लागनारे सर्व नवीन खाति त्यार करू शकता.",
    "सेकिन्ट सौप्टवेर मदे कौंते ही एंट्री करने अगुदर तैचे खाति त्यार करने.",
    "इते आपन नवीन सभासत नवीन दर्बतर को इतर सेटिंग करू शकता.",
  ];

  return (
    <>
      <style>
        {`
        body {
          font-family: "Segoe UI", sans-serif;
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #c8f7dc, #a5d8ff);
          overflow: hidden;
          height: 100vh;
        }

        .container {
          padding: 20px;
          position: relative;
          height: 100vh;
          box-sizing: border-box;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #1976d2;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
        }

        .logout-btn {
          background-color: orange;
          border: none;
          padding: 8px 14px;
          color: white;
          border-radius: 5px;
          font-size: 13px;
          cursor: pointer;
        }

        .section-title {
          margin-top: 20px;
          font-size: 22px;
          color: #333;
        }

        .icon-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 18px;
          margin: 20px 0;
        }

        .icon-card {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 10px;
          text-align: center;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          cursor: pointer;
          transition: transform 0.2s ease, background 0.3s ease;
        }

        .icon-card:hover {
          transform: scale(1.05);
          background: linear-gradient(135deg, #fff7e6, #e3f2fd);
        }

        .icon-emoji {
          font-size: 30px;
        }

        .icon-label {
          margin-top: 6px;
          font-size: 13px;
          color: #333;
        }

        .info-card {
          background: rgba(255, 255, 255, 0.95);
          border-left: 6px solid orange;
          border-radius: 8px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.1);
          padding: 15px 20px;
          margin: 25px auto 0;
          max-width: 650px;
          text-align: left;
          color: #444;
        }

        .info-card p {
          margin: 8px 0;
          line-height: 1.5;
          font-size: 15px;
        }

        .cow-image {
          position: absolute;
          bottom: 2;
          right: 10px;
          width: 450px;
          height: auto;
          background: transparent;
          mix-blend-mode: multiply;
          pointer-events: none;
          
        }

        @media (max-width: 768px) {
          .info-card {
            max-width: 90%;
            padding: 12px 16px;
          }
          .cow-image {
            width: 280px;
            bottom: 10px;
            right: 10px;
          }
        }
      `}
      </style>

      <div className="container">
        <header className="header">
          <h2>🌾 सौगांववाडी</h2>
          <button className="logout-btn">लॉगआउट</button>
        </header>

        <h3 className="section-title">मास्टर माहिती</h3>

        <div className="icon-grid">
          {masterItems.map((item, index) => (
            <div
              key={index}
              className="icon-card"
              onClick={item.onClick}
            >
              <div className="icon-emoji">{item.emoji}</div>
              <div className="icon-label">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="info-card">
          {infoItems.map((info, index) => (
            <p key={index}>{info}</p>
          ))}
        </div>

        <img src="./src/assets/cow.jpeg" alt="Cow" className="cow-image" />
      </div>
    </>
  );
};

export default DairyOverview;