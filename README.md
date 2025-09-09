



# 🌐 RuralConnect – Empowering Rural Education  
#Link :https://ruralconnectclassrooms.netlify.app/


RuralConnect is a web platform designed to **bridge the educational gap in rural areas** 🏡 by enabling teachers and students to connect through **live online classrooms, resource sharing, and real-time collaboration**.  

💡 The goal: **Make quality education accessible in rural regions with minimal internet and device requirements.**  

---

## 🚀 Features  

### 👩‍🏫 Teacher Portal  
- 🎥 Start a **Live Class** using WebRTC.  
- 🖥️ **Share screen** with students.  
- 📂 Upload & share **Video Links, PDFs, PPTs**.  
- 🛑 End class → Auto cleanup of session data.  

### 🎓 Student Portal  
- 🔑 Join classes with **Room ID**.  
- 👀 Watch **live video streams** seamlessly.  
- 📚 Access shared resources (PDFs, PPTs, Videos).  
- ⚡ Optimized for **low-bandwidth environments**.  

---

## 🛠️ Tech Stack  

- **Frontend:** HTML, CSS, JavaScript  
- **Database:** Firebase Firestore (Content) + Firebase Realtime Database (Live sessions)  
- **Auth:** Firebase Anonymous Authentication  
- **Streaming:** WebRTC  

---

## 📂 Project Structure  

RuralConnect/
-│── index.html # Landing page
-│── teacher.html # Teacher portal (live + resources)
-│── student.html # Student portal (join class)
-│── style.css # Styles
-│── teacher.js # Teacher logic
-│── student.js # Student logic
-│── content.js # Resource sharing logic
-│── README.md # Documentation



---

## ⚡ How It Works  

1. 👩‍🏫 Teacher clicks **Create Room** → Room ID generated in Firebase.  
2. 📨 Teacher shares **Room ID** with students.  
3. 🎓 Students enter Room ID → Join the live class.  
4. 📂 Teacher uploads **Videos/PDFs/PPTs** → Students access them via generated links.  
5. 🛑 Teacher ends stream → Session cleaned up automatically.  

---

## 🔐 Firebase Setup  

1. Create a **Firebase Project**.  
2. Enable:  
   - Authentication → **Anonymous**  
   - Firestore Database  
   - Realtime Database  
3. Add your Firebase config in `teacher.js` & `student.js`.  
4. Apply rules:  

### Firestore Rules
```json
service cloud.firestore {
  match /databases/{database}/documents {
    match /content/{docId} {
      allow read, write: if true;
    }
  }
}

{
  "rules": {
    "rooms": {
      ".read": true,
      ".write": true
    }
  }
}
