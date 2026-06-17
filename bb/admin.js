import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue, set, get, increment } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { firebaseConfig } from "./credentials.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const jsonEditor = document.getElementById('json-editor');
const btnUpdate = document.getElementById('btn-update');
const btnConfirm = document.getElementById('btn-confirm');
const btnSettle = document.getElementById('btn-settle');
const btnReset = document.getElementById('btn-reset');
const btnSaveJson = document.getElementById('btn-save-json');
const statusDisplay = document.getElementById('admin-status');
const candidateCounter = document.getElementById('candidate-counter');
const participantList = document.getElementById('participant-list');
const settlementResults = document.getElementById('settlement-results');
const resultsList = document.getElementById('results-list');

let currentRoomData = null;

// Helper: Trigger Update Flag with specific code
async function triggerUpdateFlag(code) {
    try {
        await set(ref(db, 'room1/update_flag'), code);
    } catch (error) {
        console.error("Failed to trigger update flag:", error);
    }
}

// 1. Update Flag Button (Manual - Code 1)
btnUpdate.addEventListener('click', async () => {
    try {
        await triggerUpdateFlag(1);
        statusDisplay.textContent = "update_flag set to 1 (Update)!";
    } catch (error) {
        console.error("Update flag failed:", error);
        alert("Error: " + error.message);
    }
});

// 2. Confirm (Resolve Ownership - Code 2)
btnConfirm.addEventListener('click', async () => {
    if (!confirm("確定処理を実行しますか？（candidatesの整理とownの書き込みが行われます）")) return;

    try {
        const snapshot = await get(ref(db, 'room1/data'));
        let data = snapshot.val();

        if (!data || !Array.isArray(data)) {
            alert("No data to process.");
            return;
        }

        data.forEach((item, index) => {
            if (index < data.length - 1) {
                const candidates = item.candidates || {};
                const keys = Object.keys(candidates);
                if (keys.length === 1) {
                    item.own = keys[0];
                }
            }
            item.candidates = null; 
        });

        await set(ref(db, 'room1/data'), data);
        await triggerUpdateFlag(2); // Set flag to 2
        statusDisplay.textContent = "Ownership resolved and flag set to 2!";
    } catch (error) {
        console.error("Confirm failed:", error);
        alert("Error: " + error.message);
    }
});

// 3. Settlement (Calculate Totals)
btnSettle.addEventListener('click', () => {
    if (!currentRoomData || !currentRoomData.data) {
        alert("Data not loaded yet.");
        return;
    }

    const totalBudgetInput = document.getElementById('total-budget');
    const totalBudget = parseFloat(totalBudgetInput.value) || 0;

    const data = currentRoomData.data;
    const totals = {};
    let grandTotalR = 0;

    // Calculate sum of r for each person
    data.forEach(item => {
        if (item.own) {
            const price = parseFloat(item.r) || 0;
            totals[item.own] = (totals[item.own] || 0) + price;
            grandTotalR += price;
        }
    });

    const sortedEntries = Object.entries(totals).sort((a, b) => b[1] - a[1]);

    resultsList.innerHTML = '';
    if (sortedEntries.length === 0) {
        resultsList.innerHTML = '<li>所有者が決まっている商品はありません。</li>';
    } else {
        // Table header style
        const headerLi = document.createElement('li');
        headerLi.style.fontWeight = 'bold';
        headerLi.style.borderBottom = '2px solid #ccc';
        headerLi.innerHTML = `<span>名前</span> <span>Σ r</span> <span>支払額</span>`;
        resultsList.appendChild(headerLi);

        sortedEntries.forEach(([name, sumR]) => {
            const payment = grandTotalR > 0 ? (sumR / grandTotalR) * totalBudget : 0;

            const li = document.createElement('li');
            li.innerHTML = `
                <span>${name}</span>
                <span>${sumR.toLocaleString()}</span>
                <span><strong>${Math.round(payment).toLocaleString()}円</strong></span>
            `;
            resultsList.appendChild(li);
        });

        if (totalBudget > 0) {
            const footerLi = document.createElement('li');
            footerLi.style.marginTop = '10px';
            footerLi.style.borderTop = '2px solid #ccc';
            footerLi.style.fontSize = '0.8rem';
            footerLi.style.color = '#666';
            footerLi.innerHTML = `<span>(参考) r合計: ${grandTotalR.toLocaleString()}</span> <span>精算対象: ${totalBudget.toLocaleString()}円</span>`;
            resultsList.appendChild(footerLi);
        }
    }
    settlementResults.style.display = 'block';
});

// 4. Reset (Wipe All - Code 3)
btnReset.addEventListener('click', async () => {
    if (!confirm("全ての candidates と own をリセットしますか？この操作は取り消せません。")) return;

    try {
        const snapshot = await get(ref(db, 'room1/data'));
        let data = snapshot.val();

        if (!data || !Array.isArray(data)) {
            alert("No data to reset.");
            return;
        }

        data.forEach(item => {
            item.own = "";
            item.candidates = null;
        });

        await set(ref(db, 'room1/data'), data);
        await triggerUpdateFlag(3); // Set flag to 3
        statusDisplay.textContent = "Data reset and flag set to 3!";
        settlementResults.style.display = 'none';
    } catch (error) {
        console.error("Reset failed:", error);
        alert("Error: " + error.message);
    }
});

// JSON Direct Editor
let isEditing = false;
jsonEditor.addEventListener('focus', () => { isEditing = true; });
jsonEditor.addEventListener('blur', () => { isEditing = false; });

// Sync from Firebase
onValue(ref(db, 'room1'), (snapshot) => {
    currentRoomData = snapshot.val();
    
    // Update Candidate Counter & Participant List
    if (currentRoomData && currentRoomData.data) {
        const uniqueCandidates = new Set();
        currentRoomData.data.forEach(item => {
            if (item.candidates) {
                Object.keys(item.candidates).forEach(name => uniqueCandidates.add(name));
            }
        });
        candidateCounter.textContent = `参加人数: ${uniqueCandidates.size}人`;

        // Render participant names
        const namesArray = Array.from(uniqueCandidates).sort();
        participantList.textContent = namesArray.length > 0 
            ? `参加者: ${namesArray.join(', ')}` 
            : '参加者はまだいません';
    }

    // Update JSON Editor if not focused
    if (!isEditing) {
        jsonEditor.value = JSON.stringify(currentRoomData, null, 2);
        statusDisplay.textContent = `Last sync: ${new Date().toLocaleTimeString()}`;
    }
}, (error) => {
    statusDisplay.textContent = "Sync error: " + error.message;
});

// Save JSON - use code 1 (generic update)
btnSaveJson.addEventListener('click', async () => {
    try {
        const newData = JSON.parse(jsonEditor.value);
        await set(ref(db, 'room1'), newData);
        await triggerUpdateFlag(1); 
        statusDisplay.textContent = "JSON uploaded and flag set to 1!";
        jsonEditor.blur();
    } catch (error) {
        console.error("Save JSON failed:", error);
        alert("Invalid JSON format or Firebase Error: " + error.message);
    }
});
