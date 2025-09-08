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

    const btnJoin = document.getElementById('btnJoin');
    const btnLeave = document.getElementById('btnLeave');
    const btnCam = document.getElementById('btnCam');
    const btnUnmute = document.getElementById('btnUnmute');
    const roomIdInput = document.getElementById('roomId');
    const remoteVideo = document.getElementById('remoteVideo');
    const localVideo = document.getElementById('localVideo');
    const statusEl = document.getElementById('status');
    const connStateEl = document.getElementById('connState');

    let pc = null;
    let roomRef = null;
    let unsubCallerCandidates = null;
    let unsubRoom = null;
    let localStream = null;
    const iceServers = [{ urls: ['stun:stun.l.google.com:19302'] }];

    function log(s){
      statusEl.textContent = s;
      console.log('[StudentLive]', s);
    }
    function setConnState(s){ connStateEl.textContent = s; console.log('[ConnState]', s); }

    async function ensureAuth(){
      if(auth.currentUser) return auth.currentUser;
      try {
        const cred = await auth.signInAnonymously();
        return cred.user;
      } catch(e){
        console.error('Auth failed', e);
        throw e;
      }
    }

    function createPeer(){
      const _pc = new RTCPeerConnection({ iceServers });
      _pc.onicecandidate = e => {
        if(e.candidate && roomRef){
          roomRef.collection('calleeCandidates').add(e.candidate.toJSON()).catch(err=>{
            console.warn('Failed add callee candidate', err);
          });
        }
      };
      _pc.ontrack = evt => {
        console.log('ontrack', evt);
        remoteVideo.srcObject = evt.streams[0];
        remoteVideo.play().catch(err=>{
          console.warn('Autoplay blocked or play failed:', err);
        });
        btnUnmute.disabled = false;
      };

      _pc.onconnectionstatechange = () => {
        setConnState('PeerConn: ' + _pc.connectionState);
      };
      _pc.oniceconnectionstatechange = () => {
        console.log('ICE state', _pc.iceConnectionState);
      };
      if(localStream){
        localStream.getTracks().forEach(track => _pc.addTrack(track, localStream));
      }

      return _pc;
    }
    btnCam.addEventListener('click', async ()=>{
      try{
        btnCam.disabled = true;
        localStream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true });
        localVideo.srcObject = localStream;
        log('Local camera & mic enabled.');
        if(pc){
          localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
          log('Published local tracks to peer connection.');
        }
      }catch(err){
        console.error('getUserMedia failed', err);
        log('Unable to access camera/mic.');
        btnCam.disabled = false;
      }
    });

    btnUnmute.addEventListener('click', ()=>{
      try{
        remoteVideo.muted = false;
        remoteVideo.play().catch(()=>{});
        btnUnmute.disabled = true;
        log('Audio unmuted.');
      }catch(e){ console.warn(e); }
    });

    btnJoin.addEventListener('click', async ()=>{
      const roomId = roomIdInput.value.trim();
      if(!roomId) return;
      btnJoin.disabled = true;
      log('Connecting to room ' + roomId + ' …');
      setConnState('connecting');

      try {
        await ensureAuth();

        roomRef = db.collection('rooms').doc(roomId);
        const roomSnap = await roomRef.get();
        if(!roomSnap.exists){
          log('Room not found.');
          btnJoin.disabled = false;
          setConnState('room-not-found');
          return;
        }

        const roomData = roomSnap.data();
        if(!roomData.offer){
          log('Room has no offer yet (teacher not ready).');
          btnJoin.disabled = false;
          setConnState('no-offer');
          return;
        }

        pc = createPeer();
        unsubCallerCandidates = roomRef.collection('callerCandidates').onSnapshot(snapshot=>{
          snapshot.docChanges().forEach(change=>{
            if(change.type === 'added'){
              const cand = change.doc.data();
              console.log('adding callerCandidate', cand);
              pc.addIceCandidate(new RTCIceCandidate(cand)).catch(e=>console.warn('addIceCandidate error', e));
            }
          });
        });

        await pc.setRemoteDescription(new RTCSessionDescription(roomData.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await roomRef.update({
          answer: { type: answer.type, sdp: answer.sdp },
          answeredAt: Date.now()
        });
        unsubRoom = roomRef.onSnapshot(snap=>{
          if(!snap.exists){
            log('Room ended by teacher.');
            cleanup();
          }
        });

        btnLeave.disabled = false;
        setConnState('connected');
        log('Connected — streaming incoming.');
      } catch(err){
        console.error('Join error:', err);
        log('Failed to join room — check console');
        btnJoin.disabled = false;
        setConnState('error');
      }
    });
    btnLeave.addEventListener('click', cleanup);

    async function cleanup(){
      try{
        if(unsubCallerCandidates) { unsubCallerCandidates(); unsubCallerCandidates = null; }
        if(unsubRoom) { unsubRoom(); unsubRoom = null; }

        if(pc){ try{ pc.close(); }catch(e){} pc = null; }
        if(localStream){
          localStream.getTracks().forEach(t=>t.stop());
          localStream = null;
          localVideo.srcObject = null;
        }
        if(roomRef){
          roomRef = null;
        }
      }catch(e){
        console.warn('cleanup error', e);
      }

      remoteVideo.srcObject = null;
      btnJoin.disabled = false;
      btnLeave.disabled = true;
      btnUnmute.disabled = true;
      setConnState('left');
      log('Left/cleaned up.');
    }
    window.addEventListener('beforeunload', cleanup);