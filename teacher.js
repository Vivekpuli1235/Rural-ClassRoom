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
const storage = firebase.storage();

auth.onAuthStateChanged(user=>{
  if(!user){
     window.location.href="index.html";
     }
  else { 
    loadResources(); 
    loadAnnouncements();
   }
});

async function uploadFile(fileInput, titleInput, type){
  const file = document.getElementById(fileInput).files[0];
  const title = document.getElementById(titleInput).value.trim();
  if(!file || !title){
    alert("Select file and title");
    return;
  }
  try{
    const storageRef = storage.ref(type+"/"+file.name);
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();
    await db.collection("content").add({
      type,
      title,
      blob: url,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert(type+" uploaded!");
    document.getElementById(fileInput).value="";
    document.getElementById(titleInput).value="";
    loadResources();
  }catch(err){
    console.error(err);
    alert("Upload failed: "+err.message);
  }
}

async function uploadLink(linkInput, titleInput, type){
  const link = document.getElementById(linkInput).value.trim();
  const title = document.getElementById(titleInput).value.trim();
  if(!link || !title){
    alert("Enter link and title");
    return;
  }
  try{
    await db.collection("content").add({
      type,
      title,
      blob: link,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert(type+" uploaded!");
    document.getElementById(linkInput).value="";
    document.getElementById(titleInput).value="";
    loadResources();
  }catch(err){
    console.error(err);
    alert("Upload failed: "+err.message);
  }
}

document.getElementById("uploadVideoBtn").addEventListener("click", async()=>{
  const link = document.getElementById("videoLink").value.trim();
  const title = document.getElementById("videoTitle").value.trim();
  const thumbnail = document.getElementById("videoThumbnail").value.trim();
  if(!link || !title || !thumbnail){
     alert("Fill all fields");
     return; 
  }
  try{
    await db.collection("content").add({
      type: "video",
      title,
      blob: link,
      thumbnail,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert("Video uploaded!");
    document.getElementById("videoLink").value="";
    document.getElementById("videoTitle").value="";
    document.getElementById("videoThumbnail").value="";
    loadResources();
  }catch(err){
    console.error(err);
    alert("Upload failed: "+err.message);
  }
});

document.getElementById("postAnnouncement").addEventListener("click", async()=>{
  const text = document.getElementById("announcementText").value.trim();
  if(!text){
    alert("Enter text");
    return;
  }
  try{
    await db.collection("announcements").add({
      text,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    document.getElementById("announcementText").value="";
    loadAnnouncements();
  }catch(err){
    console.error(err);
    alert("Post failed: "+err.message);
  }
});

document.getElementById("uploadNotes").addEventListener("click", ()=>uploadFile("notesFile","notesTitle","notes"));
document.getElementById("uploadPPTbtn").addEventListener("click", ()=>uploadLink("pptLink","pptTitle","ppt"));
document.getElementById("uploadPDFbtn").addEventListener("click", ()=>uploadLink("pdfLink","pdfTitle","pdf"));

async function loadResources(){
  const snapshot = await db.collection("content").orderBy("timestamp","desc").get();
  const container = document.getElementById("resourceList");
  container.innerHTML="";
  snapshot.forEach(doc=>{
    const data = doc.data();
    let link = data.blob;
    let title = data.title;
    if(data.type==="video") link= data.blob; 
    const div = document.createElement("div");
    div.className="resource";
    div.innerHTML=`<a href="${link}" target="_blank">${title} (${data.type})</a>`;
    container.appendChild(div);
  });
}

async function loadAnnouncements(){
  const snapshot = await db.collection("announcements").orderBy("timestamp","desc").get();
  const container = document.getElementById("announcementList");
  container.innerHTML="";
  snapshot.forEach(doc=>{
    const data = doc.data();
    const div = document.createElement("div");
    div.className="resource";
    div.textContent = data.text;
    container.appendChild(div);
  });
}

document.getElementById("logoutBtn").addEventListener("click", ()=>auth.signOut().then(()=>window.location.href="index.html"));

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const body = document.body;

    const savedTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', savedTheme);
    updateToggleText(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateToggleText(newTheme);
    });

    function updateToggleText(theme) {
        if (theme === 'dark') {
            themeToggleBtn.textContent = '🌙';
        } else {
            themeToggleBtn.textContent = '☀️';
        }
    }
});