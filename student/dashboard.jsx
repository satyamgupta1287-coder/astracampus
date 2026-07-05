import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../js/firebase-init";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [greeting, setGreeting] = useState("Good Morning,");
  const [studentName, setStudentName] = useState("Loading...");
  const [studentId, setStudentId] = useState("---");
  const [batchName, setBatchName] = useState("...");
  const [profilePhoto, setProfilePhoto] = useState(
    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
  );
  const [statFees, setStatFees] = useState(0);
  const [statAttendance, setStatAttendance] = useState("--%");
  const [assignCount, setAssignCount] = useState(0);
  const [classes, setClasses] = useState([]);
  const [notice, setNotice] = useState(null);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good Morning," : hour < 18 ? "Good Afternoon," : "Good Evening,");
  }, []);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        navigate("/");
        return;
      }

      const userData = userDoc.data();
      const schoolId = userData.schoolId;

      setStudentName(userData.name || userData.firstName || "Student");
      setStudentId(userData.studentId || userData.admissionNo || "N/A");
      setBatchName(`${userData.class || "N/A"}${userData.section ? " " + userData.section : ""}`);
      if (userData.photoUrl || userData.photoBase64) {
        setProfilePhoto(userData.photoUrl || userData.photoBase64);
      }

      const totalFee = userData.totalFee || 0;
      const paidFee = userData.paidFee || 0;
      setStatFees(totalFee - paidFee);

      const targetClassStr = String(userData.class || "");

      const assignQuery = query(collection(db, "assignments"), where("schoolId", "==", schoolId));
      const unsubAssign = onSnapshot(assignQuery, (snapshot) => {
        const filtered = snapshot.docs.filter(
          (d) => String(d.data().targetClass || d.data().className || "") === targetClassStr
        );
        setAssignCount(filtered.length);
      });

      const classQuery = query(collection(db, "live_classes"), where("schoolId", "==", schoolId));
      const unsubClasses = onSnapshot(classQuery, (snapshot) => {
        const filtered = snapshot.docs
          .filter((d) => String(d.data().targetClass || d.data().className || "") === targetClassStr)
          .map((d) => d.data())
          .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setClasses(filtered);
      });

      const noticeQuery = query(collection(db, "announcements"), where("schoolId", "==", schoolId));
      const unsubNotice = onSnapshot(noticeQuery, (snapshot) => {
        if (snapshot.empty) {
          setNotice(null);
          return;
        }
        const sorted = snapshot.docs
          .map((d) => d.data())
          .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setNotice(sorted[0]);
      });

      const attQuery = query(collection(db, "attendance"), where("schoolId", "==", schoolId));
      const unsubAtt = onSnapshot(attQuery, (snapshot) => {
        let present = 0;
        let total = 0;
        snapshot.forEach((d) => {
          const data = d.data();
          if (data.studentId === user.uid || data.studentEmail === user.email) {
            total++;
            if (data.status === "present") present++;
          }
        });
        setStatAttendance(total === 0 ? "N/A" : Math.round((present / total) * 100) + "%");
      });

      return () => {
        unsubAssign();
        unsubClasses();
        unsubNotice();
        unsubAtt();
      };
    });

    return () => unsubAuth();
  }, [navigate]);

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout Error:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  const quickAccess = [
    { icon: "fa-video", label: "Live Class", color: "text-red-500", path: "/student/live-classes", badge: null },
    { icon: "fa-book-open", label: "Materials", color: "text-blue-500", path: "/student/materials", badge: null },
    { icon: "fa-clipboard-list", label: "Homework", color: "text-emerald-500", path: "/student/assignments", badge: assignCount },
    { icon: "fa-laptop-code", label: "Tests", color: "text-purple-500", path: "/student/tests", badge: null },
    { icon: "fa-trophy", label: "Results", color: "text-amber-500", path: "/student/results", badge: null },
    { icon: "fa-wallet", label: "Fees", color: "text-teal-600", path: "/student/fees", badge: null },
    { icon: "fa-calendar-check", label: "Leave", color: "text-green-600", path: "/student/leave", badge: null },
  ];

  const extraIcons = [
    { icon: "fa-calendar-alt", label: "Timetable", color: "text-indigo-500", path: "/student/timetable" },
    { icon: "fa-images", label: "Gallery", color: "text-pink-500", path: "/student/gallery" },
    { icon: "fa-comment-dots", label: "Complaint", color: "text-orange-500", path: "/student/complaints" },
    { icon: "fa-comment-alt", label: "Feedback", color: "text-sky-500", path: "/student/feedback" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-md mx-auto min-h-screen relative">
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-8 pb-2">
          <div>
            <p className="text-sm text-slate-500 font-medium">{greeting}</p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight truncate w-48">{studentName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-200 shadow-sm shrink-0 border border-slate-200">
              <img src={profilePhoto} className="w-full h-full object-cover" alt="Profile" />
            </div>
            <button
              onClick={handleLogout}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition shadow-sm border border-red-100"
            >
              <i className="fas fa-power-off text-sm"></i>
            </button>
          </div>
        </div>

        {/* ID Card */}
        <div className="px-5 mt-4">
          <div
            className="rounded-[24px] p-6 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)" }}
          >
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-5 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-white opacity-10 blur-xl"></div>

            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-indigo-200 text-[11px] font-bold tracking-wider uppercase mb-1">Student ID</p>
                <p className="text-xl font-bold tracking-wide mb-6">{studentId}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-lg text-right">
                <p className="text-xs font-bold text-white">Class {batchName}</p>
              </div>
            </div>

            <div className="relative z-10 flex justify-between items-end border-t border-white/10 pt-4 mt-2">
              <div
                onClick={() => navigate("/student/attendance")}
                className="cursor-pointer active:scale-95 transition bg-white/5 px-2 py-1 -ml-2 rounded-lg"
              >
                <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  Attendance <i className="fas fa-chevron-right text-[8px]"></i>
                </p>
                <p className="text-2xl font-black">{statAttendance}</p>
              </div>
              <div className="text-right">
                <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider mb-1">Fee Due</p>
                <p className="text-2xl font-black text-emerald-300">₹{statFees}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="px-5 mt-8">
          <h2 className="text-base font-bold text-slate-800 mb-4 px-1">Quick Access</h2>
          <div className="grid grid-cols-4 gap-y-5 gap-x-4">
            {quickAccess.map((item) => (
              <div
                key={item.label}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition relative"
              >
                {item.badge > 0 && (
                  <span className="absolute -top-1 right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-slate-50 shadow-sm z-10">
                    {item.badge}
                  </span>
                )}
                <div
                  className={`w-14 h-14 rounded-[18px] bg-white border border-slate-200/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex items-center justify-center text-xl ${item.color}`}
                >
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <span className="text-[9.5px] font-bold text-slate-600 text-center">{item.label}</span>
              </div>
            ))}

            {!showMore && (
              <div
                onClick={() => setShowMore(true)}
                className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition"
              >
                <div className="w-14 h-14 rounded-[18px] bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 text-xl hover:bg-slate-100">
                  <i className="fas fa-ellipsis-h"></i>
                </div>
                <span className="text-[9.5px] font-bold text-slate-600 text-center">More</span>
              </div>
            )}

            {showMore &&
              extraIcons.map((item) => (
                <div
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition"
                >
                  <div
                    className={`w-14 h-14 rounded-[18px] bg-white border border-slate-200/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex items-center justify-center text-xl ${item.color}`}
                  >
                    <i className={`fas ${item.icon}`}></i>
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-600 text-center">{item.label}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Notice Board */}
        <div className="px-5 mt-10">
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-base font-bold text-slate-800">Notice Board</h2>
            <span
              onClick={() => navigate("/student/notices")}
              className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide cursor-pointer"
            >
              View All
            </span>
          </div>
          {!notice ? (
            <div className="bg-white rounded-[20px] p-5 text-center border border-slate-200/80">
              <p className="text-sm text-slate-400 font-medium">No new announcements.</p>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-[20px] flex items-start gap-4 border-l-4 border-l-amber-400 border-y border-r border-slate-200/80">
              <div className="w-10 h-10 rounded-[14px] bg-amber-50 flex items-center justify-center shrink-0 text-amber-500">
                <i className="fas fa-bullhorn text-lg"></i>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">{notice.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{notice.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Today's Schedule */}
        <div className="px-5 mt-8 mb-6">
          <h2 className="text-base font-bold text-slate-800 mb-4 px-1">Today's Schedule</h2>
          <div className="space-y-3">
            {classes.length === 0 ? (
              <div className="bg-white rounded-[20px] p-6 text-center border border-slate-200/80">
                <p className="text-sm text-slate-400 font-medium">Relax, no classes scheduled for today.</p>
              </div>
            ) : (
              classes.map((data, i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-[20px] flex items-center gap-4 text-left border border-slate-200/80"
                >
                  <div className="w-12 h-12 rounded-[14px] bg-red-50 flex items-center justify-center shrink-0 border border-red-100">
                    <i className="fas fa-video text-red-500 text-lg"></i>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate">{data.subject || data.title || "Live Class"}</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      <i className="far fa-clock mr-1"></i>Tap to join
                    </p>
                  </div>
                  <a
                    href={data.meetingLink || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition"
                  >
                    <i className="fas fa-play text-white text-xs ml-0.5"></i>
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-100 flex justify-around items-center pt-3 pb-5 z-50 px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <button className="flex flex-col items-center gap-1.5 w-16 text-indigo-600">
            <i className="fas fa-home text-lg"></i>
            <span className="text-[9px] font-bold tracking-wide">Home</span>
          </button>
          <button
            onClick={() => navigate("/student/live-classes")}
            className="flex flex-col items-center gap-1.5 w-16 text-slate-400 hover:text-indigo-600 transition"
          >
            <i className="fas fa-video text-lg"></i>
            <span className="text-[9px] font-bold tracking-wide">Classes</span>
          </button>
          <button
            onClick={() => navigate("/student/assignments")}
            className="flex flex-col items-center gap-1.5 w-16 text-slate-400 hover:text-indigo-600 transition"
          >
            <i className="fas fa-clipboard-list text-lg"></i>
            <span className="text-[9px] font-bold tracking-wide">Tasks</span>
          </button>
          <button
            onClick={() => navigate("/student/profile")}
            className="flex flex-col items-center gap-1.5 w-16 text-slate-400 hover:text-indigo-600 transition"
          >
            <i className="fas fa-user text-lg"></i>
            <span className="text-[9px] font-bold tracking-wide">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
