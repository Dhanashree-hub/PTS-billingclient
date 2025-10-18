import React from "react";
import "./css/ItarVoucher.css";
import cowImage from "@/assets/cowimage.png"; // 🐄 Cow image

const ItarVoucher: React.FC = () => {
  const cards = [
    {
      label: "वार्षिक ठेव वाटप",
      icon: "https://cdn-icons-png.flaticon.com/512/3588/3588658.png",
    },
    {
      label: "वार्षिक बोनस वाटप",
      icon: "https://cdn-icons-png.flaticon.com/512/3784/3784184.png",
    },
  ];

  return (
    <div className="voucher-container">
      {/* Title */}
      <h2 className="voucher-title">इतर व्हाउचर</h2>

      {/* Two cards aligned to left */}
      <div className="voucher-row">
        {cards.map((item, index) => (
          <div key={index} className="voucher-card">
            <img src={item.icon} alt={item.label} className="voucher-icon" />
            <p className="voucher-label">{item.label}</p>
          </div>
        ))}
      </div>
       <div className="voucher-info">
        <ol>
          <li>1.येथे आपण वार्षिक ठेव वाटप रिपोर्ट पाहू शकता.</li>
          <li>
            2.ठेव वाटप केल्यानंतर सदस्यांच्या नवीन ठेव वाटपाचे वेळेचे प्रदर्शन सुरू केले जाते.
          </li>
          <li>3.तसेच आपण सदस्यांना बोनस वाटप ही करू शकता.</li>
        </ol>
      </div>

      {/* Cow animation */}
      <img src={cowImage} alt="Cow" className="moving-cow" />
    </div>
  );
};

export default ItarVoucher;
