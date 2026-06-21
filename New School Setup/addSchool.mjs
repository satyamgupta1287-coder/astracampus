cat << 'EOF' > ~/addSchool.mjs
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCqSMjr5__HNV-LXZi5vQvGzfBQ46lRFNA",
  authDomain: "auth-demo-f8ae4.firebaseapp.com",
  projectId: "auth-demo-f8ae4",
  storageBucket: "auth-demo-f8ae4.firebasestorage.app",
  messagingSenderId: "245702722359",
  appId: "1:245702722359:web:c669123eb90a1d282290b2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const args = process.argv.slice(2);
const schoolName = args;
const schoolId = args?.toUpperCase();
const adminEmail = args?.toLowerCase();

if (!schoolName || !schoolId || !adminEmail) {
    console.log("❌ Error: Adhura Data! Use: node addSchool.mjs 'Name' 'CODE' 'email@ex.com'");
    process.exit(1);
}

async function addSchoolToDB() {
    try {
        console.log(`⏳ Registering [${schoolName}]...`);
        await setDoc(doc(db, "schools", schoolId), {
            schoolName, schoolId, adminEmail, status: "active", createdAt: serverTimestamp()
        });
        await setDoc(doc(db, "pre_registered_admins", adminEmail), {
            email: adminEmail, schoolId: schoolId, role: "admin", assignedAt: serverTimestamp()
        });
        console.log(`✅ Success! ${schoolName} (${schoolId}) registered.`);
    } catch (e) { console.error(e.message); }
}
addSchoolToDB();
EOF
