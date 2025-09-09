# 🌐 RuralConnect – Empowering Rural Education  
#Link :https://ruralconnectclassrooms.netlify.app/

![Status](https://img.shields.io/badge/Status-Prototype-orange)  
![Hackathon](https://img.shields.io/badge/Hackathon-Project-blue)  
![Tech](https://img.shields.io/badge/Powered%20By-Firebase%20%26%20WebRTC-yellow)  
![License](https://img.shields.io/badge/License-MIT-green)  

RuralConnect is a web platform designed to **bridge the educational gap in rural areas** 🏡 by enabling teachers and students to connect through **live online classrooms, resource sharing, and real-time collaboration**.  

💡 The goal: **Make quality education accessible in rural regions with minimal internet and device requirements.**  

---

## 🚀 Features  

### 👩‍🏫 Teacher Portal  
The **Teacher Portal** gives instructors a simple dashboard to:  
- 🎥 **Start Live Classes** – instantly broadcast video & audio to students.  
- 🖥️ **Share Screen** – for presentations, notes, or demos.  
- 📂 **Upload Resources** – share PDFs, PPTs, or video links.  
- 📑 **Announcements** – post important updates for students.  
- 🛑 **End Session** – close live class, clean up room data automatically.  

> Teachers only need basic internet — no heavy setup required.  

---

### 🎓 Student Portal  
The **Student Portal** empowers learners to:  
- 🔑 **Join Live Classes** with a Room ID shared by the teacher.  
- 👀 Watch the teacher’s **live video stream** in real time.  
- 📚 Access **resources** (PDFs, PPTs, Videos) from the teacher.  
- 📝 Receive **announcements** directly from the dashboard.  
- ⚡ Works smoothly on **low-bandwidth connections**.  

---

## 🛠️ Tech Stack  

- **Frontend:** HTML, CSS, JavaScript  
- **Database:** Firebase Firestore (Content) + Firebase Realtime Database (Live sessions)  
- **Auth:** Firebase Anonymous Authentication  
- **Streaming:** WebRTC  

---
## 📂 Project Structure  

RuralConnect/
│── index.html # Landing page
│── teacher.html # Teacher portal (live + resources)
│── student.html # Student portal (join class)
│── style.css # Styles
│── teacher.js # Teacher logic
│── student.js # Student logic
│── content.js # Resource sharing logic
│── README.md # Documentation




---

## ⚡ How It Works  

1. 👩‍🏫 **Teacher creates a Room** → Firebase generates Room ID.  
2. 📨 Teacher shares **Room ID** with students.  
3. 🎓 Students enter Room ID → Join live class instantly.  
4. 📂 Teacher uploads **Videos/PDFs/PPTs** → Students open them via generated links.  
5. 🛑 Teacher ends stream → Session auto-cleans in Firebase.  

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
