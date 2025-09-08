
const firebaseConfig = {
  apiKey: "AIzaSyCLQZfNmDgjcHBLSk-GwRdjdtKRmFVKNN0",
  authDomain: "ruralconnect-7e67a.firebaseapp.com",
  projectId: "ruralconnect-7e67a",
  storageBucket: "ruralconnect-7e67a.appspot.com",
  messagingSenderId: "137070896439",
  appId: "1:137070896439:web:7a71fe4f511817769b66b2"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged(user => {
  if(!user){
    alert("Login first");
    window.location.href="index.html";
  } else {
    loadResources();
  }
});
function loadResources(){
  const videoGrid = document.getElementById("videoGrid");
  const materialList = document.getElementById("materialList");
  const Announcements__ =  document.getElementById("Announcements-list")
  videoGrid.innerHTML = "";
  materialList.innerHTML = "";

  db.collection("content").orderBy("timestamp","desc").get().then(snapshot=>{
    snapshot.forEach(doc=>{
      const data = doc.data();

      if(data.type === "video"){
        const vidCard = document.createElement("div");
        vidCard.className = "video-card";

        const videoUrl = data.blob;
        const thumbnail = data.thumbnail || ("https://img.youtube.com/vi/"+(videoUrl.split("v=")[1]?.split("&")[0])+"/0.jpg");
        vidCard.innerHTML = `
          <img src="${thumbnail}" alt="${data.title}">
          <div class="overlay">
            <h4>${data.title}</h4>
            <button onclick="window.open('${videoUrl}','_blank')">▶ Watch</button>
          </div>
        `;
        videoGrid.appendChild(vidCard);

      } else if(data.type === "pdf" || data.type === "ppt" || data.type === "notes"){
        const mat = document.createElement("div");
        mat.className = "material";
        mat.innerHTML = `<a href="${data.blob}" target="_blank">📄 ${data.title}</a>`;
        materialList.appendChild(mat);
      }
    });
  });

  db.collection("announcements").orderBy("timestamp","desc").get().then(snapshot=>{
    snapshot.forEach(doc=>{
      const data = doc.data();
      const ann = document.createElement("div");
      ann.className = "material";
      ann.innerHTML = `<strong> Announcement:</strong> ${data.text}`;
      Announcements__.appendChild(ann);
    });
  });
}

document.getElementById("logoutBtn").addEventListener("click", ()=>{
  auth.signOut().then(()=>window.location.href="index.html");
});