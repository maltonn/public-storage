import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, updateDoc, setDoc, doc } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js';
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBT04z4mTkgRuSn31fn6NUFvBkhTPxUxAs",
    authDomain: "malton-8.firebaseapp.com",
    databaseURL: "https://malton-8-default-rtdb.firebaseio.com",
    projectId: "malton-8",
    storageBucket: "malton-8.firebasestorage.app",
    messagingSenderId: "672597414490",
    appId: "1:672597414490:web:e1cadaa29631a1f28ffe63",
    measurementId: "G-HH8WX2NH4K"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// async function addData() {
//     await addDoc(collection(db, "users"), {
//         name: "Taro",
//         age: 25
//     });
//     alert("データ追加完了");
// }

// async function updateData() {
//     const querySnapshot = await getDocs(collection(db, "users"));
//     if (!querySnapshot.empty) {
//         const docRef = doc(db, "users", querySnapshot.docs[0].id);
//         await updateDoc(docRef, { age: 30 });
//         alert("データ更新完了");
//     }
// }

// async function deleteData() {
//     const querySnapshot = await getDocs(collection(db, "users"));
//     if (!querySnapshot.empty) {
//         const docRef = doc(db, "users", querySnapshot.docs[0].id);
//         await deleteDoc(docRef);
//         alert("データ削除完了");
//     }
// }

document.getElementById('submit').addEventListener('click', async () => {
    let name = document.getElementById('name').value;
    if (!name) {
        return;
    }

    await setDoc(doc(db, "keihata", name), {
        opt1: Number(document.getElementById('opt0').value) || 0,
        opt2: Number(document.getElementById('opt1').value) || 0,
        opt3: Number(document.getElementById('opt2').value) || 0,
        opt4: Number(document.getElementById('opt3').value) || 0,
    });
    alert("投票が完了しました");
    ReloadOds()
})

function ReloadOds(){
    getDocs(collection(db, "keihata")).then((querySnapshot) => {
        let opt_sums = [0, 0, 0, 0]
        querySnapshot.forEach((doc) => {
            let data=doc.data()
            opt_sums[0] += data.opt1
            opt_sums[1] += data.opt2
            opt_sums[2] += data.opt3
            opt_sums[3] += data.opt4
    
            let total_sum = opt_sums[0] + opt_sums[1] + opt_sums[2] + opt_sums[3]
    
            document.getElementById('ods0').innerText = "オッズ："+(total_sum*0.9 / opt_sums[0]).toPrecision(3) + "倍"
            document.getElementById('ods1').innerText = "オッズ："+(total_sum*0.9 / opt_sums[1]).toPrecision(3) + "倍"
            document.getElementById('ods2').innerText = "オッズ："+(total_sum*0.9 / opt_sums[2]).toPrecision(3) + "倍"
            document.getElementById('ods3').innerText = "オッズ："+(total_sum*0.9 / opt_sums[3]).toPrecision(3) + "倍"
        });
    });   
}

ReloadOds()


