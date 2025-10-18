import React from "react";
import "./css/ReportsPage.css";
import cowImage from "@/assets/cowimage.png"; // 🐄 cow image

const ReportsPage: React.FC = () => {
  const reports = [
    { 
      label: "सभासद रिपोर्ट", 
      icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" // User report icon
    },
    { 
      label: "पेमेंट रजिस्टर", 
      icon: "https://cdn-icons-png.flaticon.com/512/3600/3600918.png" // Payment register icon
    },
    { 
      label: "बँक पेमेंट रिपोर्ट", 
      icon: "https://cdn-icons-png.flaticon.com/512/2331/2331966.png" // Bank payment icon
    },
    { 
      label: "सभासद खाते", 
      icon: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png" // User account icon
    },
    { 
      label: "संकलन रिपोर्ट", 
      icon: "https://cdn-icons-png.flaticon.com/512/3135/3135754.png" // Collection/summary icon
    },
    { 
      label: "संघ विक्री/रतिब रिपोर्ट", 
      icon: "https://cdn-icons-png.flaticon.com/512/3135/3135743.png" // Sales/ration icon
    },
    { 
      label: "खाद्य/अॅडव्हान्स रिपोर्ट", 
      icon: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png" // Food/advance icon
    },
    { 
      label: "इतर रिपोर्ट्स", 
      icon: "https://cdn-icons-png.flaticon.com/512/2997/2997896.png" // Other reports icon
    },
  ];

  return (
    <div className="reports-container">
      {/* Title Section */}
      <div className="reports-header">
        <h2 className="reports-title">१० दिवसांचे रिपोर्ट्स</h2>
        <h2 className="reports-title">इतर रिपोर्ट्स</h2>
      </div>

      {/* Cards Section */}
      <div className="reports-grid">
        {reports.map((item, index) => (
          <div key={index} className="report-card">
            <img src={item.icon} alt={item.label} className="report-icon" />
            <p className="report-label">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="reports-info">
        <ol>
          <li>येथे आपण १० दिवसांचे रिपोर्ट पाहू शकता व प्रिंट घेऊ शकता.</li>
          <li>तसेच आपण येथे वार्षिक रिपोर्ट व इतर रिपोर्ट्स ही पाहू शकता.</li>
          <li>
            उदा. सभासद बिल, पेमेंट रजिस्टर, सभासद खाते, खाद्य/अॅडव्हान्स आणि इतर रिपोर्ट्स.
          </li>
        </ol>
      </div>

      {/* Cow Animation */}
      <img src={cowImage} alt="Cow" className="reports-cow" />
    </div>
  );
};

export default ReportsPage;