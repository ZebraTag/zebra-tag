const firebaseConfig = {
    apiKey: "AIzaSyDFIuHkzGlTNn20-2hVyQUwaKXyqZ9kPRc",
    projectId: "zebratagpro",
    databaseURL: "https://zebratagpro-default-rtdb.firebaseio.com/"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const ADMIN_UID = "VhP6eNFlJBRmtpwyDCVp2GLIs9g2";

let currentStoreID = "";
let myName = "";
let autoScanMode = false;

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function triggerFlash() {
    const dot = document.getElementById('status-dot');
    dot.classList.remove('flash');
    void dot.offsetWidth;
    dot.classList.add('flash');
}

function focusScanner() { 
    const s = document.getElementById('scanner');
    s.focus(); 
}

function toggleAutoScan() {
    autoScanMode = !autoScanMode;
    const btn = document.getElementById('scan-btn');
    if(autoScanMode) {
        btn.innerText = "SCANNER: ON";
        btn.classList.add('scan-active');
        focusScanner();
    } else {
        btn.innerText = "SCANNER: OFF";
        btn.classList.remove('scan-active');
        document.getElementById('scanner').blur();
    }
}

async function handleAuth() {
    const email = document.getElementById('email-input').value.trim();
    const pass = document.getElementById('pass-input').value;
    if(!email || !pass) return;
    try {
        if(document.getElementById('reg-fields').style.display === 'block') {
            const user = document.getElementById('username-input').value.trim();
            const res = await firebase.auth().createUserWithEmailAndPassword(email, pass);
            await db.ref('users/' + res.user.uid).set({ name: user.toUpperCase() || "OPERATOR" });
        } else {
            await firebase.auth().signInWithEmailAndPassword(email, pass);
        }
    } catch(e) { alert(e.message); }
}

function toggleAuth() {
    const f = document.getElementById('reg-fields');
    f.style.display = f.style.display === 'none' ? 'block' : 'none';
}

function joinStore() {
    const store = document.getElementById('store-input').value.trim().toUpperCase();
    if(!store) return;
    currentStoreID = store;
    localStorage.setItem('zebra_last_store', store);
    startApp();
}

function startApp() {
    showScreen('game-screen');
    document.getElementById('store-display').innerText = "ST: " + currentStoreID;
    const user = firebase.auth().currentUser;
    if(user.uid === ADMIN_UID) document.getElementById('admin-wipe').style.display = 'block';

    db.ref(`stores/${currentStoreID}/scores/${user.uid}`).update({ name: myName });

    db.ref(`stores/${currentStoreID}/scores`).on('value', s => {
        const data = s.val() || {};
        const board = document.getElementById('leaderboard-content');
        document.getElementById('my-count').innerText = data[user.uid]?.score || 0;
        board.innerHTML = '';
        Object.keys(data)
            .filter(id => (data[id].name && data[id].name !== "OP") || id === user.uid)
            .sort((a,b) => (data[b].score || 0) - (data[a].score || 0))
            .forEach((id, i) => {
                const isMe = id === user.uid;
                board.innerHTML += `<div class="row ${isMe ? 'me-highlight' : ''}"><span>#${i+1} ${isMe ? myName : data[id].name}</span><span class="score-val">${data[id].score || 0}</span></div>`;
            });
    });
}

function iScored() {
    const user = firebase.auth().currentUser;
    triggerFlash();
    db.ref(`stores/${currentStoreID}/scores/${user.uid}`).transaction((d) => {
        if (!d) return { name: myName, score: 1 };
        d.score = (d.score || 0) + 1;
        d.name = myName;
        return d;
    });
}

function wipeStoreData() { 
    if(confirm("WIPE DATA?")) {
        db.ref(`stores/${currentStoreID}/scores`).remove().then(() => {
            db.ref(`stores/${currentStoreID}/scores/${firebase.auth().currentUser.uid}`).update({ name: myName, score: 0 });
        });
    }
}

function resetMyScore() { if(confirm("Reset?")) db.ref(`stores/${currentStoreID}/scores/${firebase.auth().currentUser.uid}`).update({ score: 0, name: myName }); }
function exitRoom() { db.ref(`stores/${currentStoreID}/scores`).off(); showScreen('lobby-screen'); }
function handleSignOut() { firebase.auth().signOut().then(() => location.reload()); }

firebase.auth().onAuthStateChanged(async user => {
    if(user) {
        const snap = await db.ref('users/' + user.uid).get();
        myName = snap.val()?.name || "OPERATOR";
        document.getElementById('op-name').innerText = myName;
        document.getElementById('store-input').value = localStorage.getItem('zebra_last_store') || "";
        showScreen('lobby-screen');
    } else { showScreen('auth-screen'); }
});

setInterval(() => {
    if (autoScanMode && document.getElementById('game-screen').classList.contains('active')) {
        if (document.activeElement.tagName !== 'INPUT') focusScanner();
    }
}, 1500);

document.getElementById('scanner').addEventListener('input', (e) => {
    if(e.target.value.toUpperCase().startsWith("SHP")) {
        iScored();
        e.target.value = '';
        if(!autoScanMode) e.target.blur();
    }
});
