// ================= Firebase Init =================
const firebaseConfig = {
  apiKey: "AIzaSyCLQZfNmDgjcHBLSk-GwRdjdtKRmFVKNN0",
  authDomain: "ruralconnect-7e67a.firebaseapp.com",
  databaseURL: "https://ruralconnect-7e67a-default-rtdb.firebaseio.com/", // 👈 IMPORTANT
  projectId: "ruralconnect-7e67a",
  storageBucket: "ruralconnect-7e67a.appspot.com",
  messagingSenderId: "137070896439",
  appId: "1:137070896439:web:7a71fe4f511817769b66b2"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const rtdb = firebase.database();

// ================= Elements =================
const btnCreate = document.getElementById("btnCreate");
const btnShare = document.getElementById("btnShare");
const btnEnd = document.getElementById("btnEnd");
const roomIdEl = document.getElementById("roomId");
const localVideo = document.getElementById("localVideo");
const statusEl = document.getElementById("status");
const studentsEl = document.getElementById("students");

let pc, localStream, roomRef;
let sharingScreen = false;

const iceServers = [{ urls: ["stun:stun.l.google.com:19302"] }];

// ================= Helpers =================
function log(msg) {
  statusEl.textContent = msg;
  console.log("[Teacher]", msg);
}

async function ensureAuth() {
  if (auth.currentUser) return auth.currentUser;
  await auth.signInAnonymously();
  return auth.currentUser;
}

// ================= PeerConnection =================
function createPeer() {
  const _pc = new RTCPeerConnection({ iceServers });

  _pc.onicecandidate = (e) => {
    if (e.candidate && roomRef) {
      roomRef.child("callerCandidates").push(e.candidate.toJSON());
    }
  };

  _pc.ontrack = (e) => {
    const stream = e.streams[0];
    if (!document.getElementById("student-" + stream.id)) {
      const card = document.createElement("div");
      card.className = "student-card";
      card.id = "student-" + stream.id;
      card.innerHTML = `
        <video class="student-video" autoplay playsinline></video>
        <h4>Student</h4>
      `;
      studentsEl.innerHTML = "";
      studentsEl.appendChild(card);
      card.querySelector("video").srcObject = stream;
    }
  };

  return _pc;
}

// ================= Button Actions =================
btnCreate.onclick = async () => {
  btnCreate.disabled = true;
  log("Requesting camera…");
  await ensureAuth();

  try {
    // Camera
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideo.srcObject = localStream;

    // Peer
    pc = createPeer();
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    // Room in RTDB
    roomRef = rtdb.ref("rooms").push();
    const roomId = roomRef.key;
    if (!roomId) throw new Error("Failed to create room. Check RTDB rules.");
    roomIdEl.textContent = roomId;

    // Offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await roomRef.set({
      offer: { type: offer.type, sdp: offer.sdp },
      createdAt: Date.now(),
    });

    log("Room created: " + roomId);

    // Listen for Answer
    roomRef.on("value", async (snap) => {
      const data = snap.val();
      if (!data) {
        log("Room ended.");
        cleanup();
        return;
      }
      if (data.answer && !pc.currentRemoteDescription) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        log("Student joined.");
      }
    });

    // Listen for ICE from students
    roomRef.child("calleeCandidates").on("child_added", (snap) => {
      const candidate = new RTCIceCandidate(snap.val());
      pc.addIceCandidate(candidate);
    });

    btnEnd.disabled = false;
    btnShare.disabled = false;
  } catch (err) {
    log("❌ Error: " + err.message);
    console.error(err);
    btnCreate.disabled = false;
  }
};

btnShare.onclick = async () => {
  if (!pc) return;

  if (!sharingScreen) {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = pc.getSenders().find((s) => s.track.kind === "video");
      sender.replaceTrack(screenTrack);
      localVideo.srcObject = screenStream;
      sharingScreen = true;
      btnShare.textContent = "Stop Screen Share";

      screenTrack.onended = () => btnShare.click();
    } catch (e) {
      console.error(e);
    }
  } else {
    const camStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const camTrack = camStream.getVideoTracks()[0];
    const sender = pc.getSenders().find((s) => s.track.kind === "video");
    sender.replaceTrack(camTrack);
    localVideo.srcObject = camStream;
    sharingScreen = false;
    btnShare.textContent = "Share Screen";
  }
};

btnEnd.onclick = async () => {
  await cleanup();
  log("Stream ended.");
};

// ================= Cleanup =================
async function cleanup() {
  try {
    if (pc) {
      pc.close();
      pc = null;
    }

    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      localStream = null;
      localVideo.srcObject = null;
    }

    if (roomRef) {
      await roomRef.remove();
      roomRef = null;
    }
  } catch (e) {
    console.warn(e);
  }

  btnCreate.disabled = false;
  btnEnd.disabled = true;
  btnShare.disabled = true;
  btnShare.textContent = "Share Screen";
  roomIdEl.textContent = "—";
  studentsEl.innerHTML = '<p class="hint">No students connected yet.</p>';
}

window.addEventListener("beforeunload", cleanup);
