# auth-demo
​🚀 School Management SaaS Portal
​Yeh ek Multi-tenant School Management System hai, jise Firebase aur Tailwind CSS ka use karke banaya gaya hai. Isme Principal (Admin), Teachers, aur Students ke liye alag-alag dashboards hain, jisse har school ka data secure aur separate rehta hai.
​🌟 Key Features
​Multi-Tenant Architecture: Har school ka data schoolId ke zariye separate rehta hai.
​Role-Based Access Control: Principal, Teachers, aur Students ke liye alag dashboards aur permissions.
​Real-time Updates: Firebase Firestore ka use karke attendance, notices, aur results live update hote hain.
​Secure Routing: Login ke waqt hi role pehchan kar sahi dashboard par redirect karta hai.
​Responsive UI: Tailwind CSS ke sath mobile-friendly design.
​🛠 Tech Stack
​Frontend: HTML5, Tailwind CSS, JavaScript (ES6 Modules).
​Backend/Database: Firebase Firestore (NoSQL).
​Authentication: Firebase Auth (Email/Password & Google Login).
​Storage: Cloudinary (For PDFs and Images).
​📋 Features Overview
​Admin Panel: Staff manage karein, fees track karein, aur notice board control karein.
​Teacher Panel: Attendance lein, assignments upload karein, aur live classes schedule karein.
​Student Panel: Assignments submit karein, mocks test dein, aur apne doubts puchein.
​🚀 How to Setup
​Firebase Setup:
​Firebase console par jaakar project banayein.
​Firestore aur Authentication enable karein.
​js/firebase-init.js mein apni Firebase config keys update karein.
​Security Rules: Firebase Firestore Rules mein hamare provided security rules set karein taaki data secure rahe.
​Deployment: Is repository ko Vercel ya GitHub Pages par deploy karein.
​🛡 Security
​Database level security ke liye Firebase Security Rules ka use kiya gaya hai taaki sirf authorized users hi data access kar sakein.
​Frontend routing ko role-based redirect logic se secure kiya gaya hai.
