import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue, set, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { firebaseConfig } from "./credentials.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Get User Name from Popup
let MY_NAME = prompt("あなたの名前を入力してください") || "Guest";

const cardContainer = document.getElementById('card-container');
const statusDisplay = document.getElementById('status');

// Show current user in title
document.querySelector('h1').textContent = `ようこそ ${MY_NAME} さん`;

let selectedIndex = null;
let currentData = [];
let isLocked = false; // Flag to lock interaction

// Render function
function renderCards(data) {
    cardContainer.innerHTML = '';
    
    if (!data || !Array.isArray(data)) {
        cardContainer.innerHTML = '<p>No data available.</p>';
        return;
    }

    data.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Color coding based on state and candidate count
        const candidateKeys = Object.keys(item.candidates || {});
        const candidateCount = candidateKeys.length;

        if (item.own) {
            card.classList.add('owned');
        } else {
            if (candidateCount === 1) {
                card.classList.add('count-1'); // Sky Blue
            } else if (candidateCount >= 2) {
                card.classList.add('count-many'); // Yellow
            }
        }

        if (selectedIndex === index) {
            card.classList.add('selected');
        }

        const header = document.createElement('div');
        header.className = 'card-header';
        header.innerHTML = `
            <span class="card-name">${item.name}</span>
            <span class="card-price">${item.r}</span>
        `;

        const body = document.createElement('div');
        body.className = 'card-body';
        if (item.own) {
            body.textContent = item.own;
        } else {
            body.textContent = (candidateCount > 0) 
                ? candidateKeys.join(' / ') 
                : '/';
        }

        card.appendChild(header);
        card.appendChild(body);

        card.addEventListener('click', () => handleCardClick(index, item));
        cardContainer.appendChild(card);
    });
}

// Concurrency-safe Click Logic
async function handleCardClick(index, item) {
    if (isLocked) return; // Ignore clicks if locked

    const myCandidateRef = ref(db, `room1/data/${index}/candidates/${MY_NAME}`);

    if (selectedIndex !== null) {
        // User already has a selection
        const prevIndex = selectedIndex;
        const prevCandidateRef = ref(db, `room1/data/${prevIndex}/candidates/${MY_NAME}`);

        if (prevIndex === index) {
            // Clicked the same card: Deselect
            try {
                await set(myCandidateRef, null);
                selectedIndex = null;
                renderCards(currentData);
            } catch (error) {
                console.error("Deselect failed:", error);
            }
        } else {
            // Clicked a different card: Swap selection
            if (item.own) return; // Cannot select owned item

            try {
                // 1. Remove from previous
                await set(prevCandidateRef, null);
                // 2. Add to new
                await set(myCandidateRef, true);
                
                selectedIndex = index;
                renderCards(currentData);
            } catch (error) {
                console.error("Swap selection failed:", error);
            }
        }
    } else {
        // No card is selected locally
        if (item.own) return; // Already owned
        
        try {
            await set(myCandidateRef, true);
            selectedIndex = index;
            renderCards(currentData); // Immediate UI feedback
        } catch (error) {
            console.error("Select failed:", error);
        }
    }
}

// Sync Logic: Only update when update_flag changes
onValue(ref(db, 'room1/update_flag'), async (snapshot) => {
    const flagValue = snapshot.val();
    
    // Set lock state based on flag
    isLocked = (flagValue === 1);
    
    statusDisplay.textContent = `Update Flag: ${flagValue} ${isLocked ? '(Locked)' : ''} (Syncing...)`;
    
    try {
        const dataSnapshot = await get(ref(db, 'room1/data'));
        currentData = dataSnapshot.val();
        
        // Reset selection on Confirm (2) or Reset (3)
        if (flagValue === 2 || flagValue === 3) {
            selectedIndex = null;
        }
        
        renderCards(currentData);
        statusDisplay.textContent = `Sync: ${new Date().toLocaleTimeString()} (Flag: ${flagValue})${isLocked ? ' - Selection Locked' : ''}`;
    } catch (error) {
        console.error("Data fetch failed:", error);
        statusDisplay.textContent = "Error syncing data.";
    }
}, (error) => {
    console.error("Flag listener error:", error);
    statusDisplay.textContent = "Error: Connection Issue";
});
