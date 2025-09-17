function goTo(){

    const home = document.getElementById("home");
    const wallet = document.getElementById("wallet-icon");
    const goal = document.getElementById("goal-icon");
    const insights = document.getElementById("insights-icon");

    home.addEventListener('click', () => {
        window.location.href = "../homepage.php"
        }
    );
    wallet.addEventListener('click', () => {
        window.location.href = "../wallet_page.php"
        }
    );
    goal.addEventListener('click', () => {
        window.location.href = "../goals.php"
        }
    );
    insights.addEventListener('click', () => {
        window.location.href = "../insights.php"
        }
    );
}

function redirect(location) {
  window.location.href = location;
}

function openMenu() {

    document.getElementById("menu-content").classList.toggle("show-menu");
    const overlay = document.getElementById("overlay-menu");
    overlay.style.opacity="1";

}
function closeMenu() {
  
    document.getElementById("menu-content").classList.remove("show-menu");
    document.getElementsByClassName("back-arrow")[0].classList.remove("show-menu");
    const overlay = document.getElementById("overlay-menu");
    overlay.style.opacity="0";
}




async function fetchImage(userid) {
    try {
        const res = await fetch(`http://${API_HOST}:8000/api.php?path=image&user_id=${encodeURIComponent(userid)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const out = await res.json().catch(() => ({}));
        if (!res.ok || out.error) throw new Error(out.error || `HTTP ${res.status}`);

        return out.url; // return only the image URL
    } catch (e) {
        console.error(e);
        if (typeof showPopup === 'function') showPopup('Errore caricamento immagine: ' + e.message, 'error');
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async function () {
     goTo();
    const profileBtn = document.getElementById("profile");

    const imageUrl = await fetchImage(1);
    if (imageUrl) {
        profileBtn.src = imageUrl;  // <-- set src, no background needed
    }

    profileBtn.addEventListener("click", () => {
        redirect("../account.php");
    });

});


// Dati tutorial (sostituisci con i tuoi percorsi immagini reali)
const TUTORIALS = {
  "introduction": {
    title: "Introduction",
    images: [
      "../tutorial/introduction/1.png",
      "../tutorial/introduction/2.png",
      "../tutorial/introduction/3.png",
      "../tutorial/introduction/4.png",
      "../tutorial/introduction/5.png",
      "../tutorial/introduction/6.png",
      "../tutorial/introduction/7.png",
      "../tutorial/introduction/8.png",
      "../tutorial/introduction/9.png"
    ],
    descriptions: [
      "Step 1: Welcome to FinanceTrack , this is the homepage where you can access through main contents using the tab bar  ",
      "Step 2: Then you can also find the side menu to navigate the app",
      "Step 3: This is the wallet section where you can manage your wallets",
      "Step 4: This is the shared wallet section where you can view your shared wallets, create new shared wallets and managing invitations",
      "Step 5: This is the cash wallet section where you can track your cash transaction and adding a new one",
      "Step 6: In insights page you can see graphs about your expenses and income based on the wallets",
      "Step 7: Categories section allows you to check the limits spent in certain categories and you can also add a new one",
      "Step 8: Goal page allows you to manage and create your goals",
      "Step 9: This is an example of the form you will see in goal creation",
    ]
  },
  "add-shared-transaction": {
    title: "Add shared transaction",
    images: [
      "../tutorial/add_shared_transaction/1.png",
      "../tutorial/add_shared_transaction/2.png"
    ],
    descriptions: [
      "Step 1: Press Add shared transaction.",
      "Step 2: Complete the form by filling all the sections and splitting the import among participants."
    ]
  },
  "create-shared-wallet": {
    title: "Create a shared wallet",
    images: [
      "../tutorial/create_shared_wallet/1.png",
      "../tutorial/create_shared_wallet/2.png",
      "../tutorial/create_shared_wallet/3.png",
      "../tutorial/create_shared_wallet/4.png"
    ],
    descriptions: [
      "Step 1: Tap on Create a shared wallet button",
      "Step 2: Insert the name for the new shared wallet",
      "Step 3: Complete the fields by adding participants and selecting their roles.",
      "Step 4: When selecting the role you are always the admin since you are creating it. Then you can choose if a participant can be a viewer or an editor(can add shared transaction) "
    ]
  },
  "create-wallet": {
    title: "Create a wallet",
    images: [
      "../tutorial/create_wallet/1.png",
      "../tutorial/create_wallet/2.png",
      "../tutorial/create_wallet/3.png",
      "../tutorial/create_wallet/4.png"
    ],
    descriptions: [
      "Step 1: Tap on add wallet button.",
      "Step 2: By tapping on Bank wallet , it will show you the form to fill with all information",
      "Step 3: By tapping on Card Wallet , you have to insert card information ",
      "Step 4: If you want to edit your wallet then click on modify button related to it .",
      "Step 5: Now you can choose to edit it or to delete it",
    ]
  },
  "add-transaction": {
    title: "Add cash transaction",
    images: [
      "../tutorial/add_transaction/1.png",
      "../tutorial/add_transaction/2.png",
      "../tutorial/add_transaction/3.png",
      "../tutorial/add_transaction/4.png"
    ],
    descriptions: [
      'Step 1: Insert the name of the transaction and the import',
      "Step 2: Choose an option between categories o uncategorized transaction.",
      "Step 3: If you selected \"Select categories\" then choose the categories and the import for each ",
      "Step 4: Verify by checking the bar if the sum is 100% and click confirm."
    ]
  }
};

// Elementi UI
const listEl = document.getElementById("tutorialList");
const popupTutorial = document.getElementById("popup-tutorial");
const popupTitle = document.getElementById("popupTitle");
const tutorialImage = document.getElementById("tutorial-image");
const tutorialDescription = document.getElementById("tutorial-description");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const skipBtn = document.getElementById("skipButton");
const overlayTutorial = document.getElementById("overlay-tutorial");

let currentStep = 0;
let currentKey = null;

// Funzioni
function updateTutorial() {
  if (!currentKey || !TUTORIALS[currentKey]) return;
  const t = TUTORIALS[currentKey];

  tutorialImage.src = t.images[currentStep];
  tutorialImage.alt = `${t.title} - Step ${currentStep + 1}`;
  tutorialDescription.textContent = t.descriptions[currentStep];

  backBtn.disabled = currentStep === 0;

  if (currentStep === t.images.length - 1) {
    nextBtn.textContent = "OK";
    nextBtn.classList.remove("next");
    nextBtn.classList.add("ok");
  } else {
    nextBtn.textContent = "Next";
    nextBtn.classList.remove("ok");
    nextBtn.classList.add("next");
  }
}

function resetTutorial() {
  currentStep = 0;
  backBtn.disabled = true;
  nextBtn.textContent = "Next";
  nextBtn.classList.remove("ok");
  nextBtn.classList.add("next");
}

function openTutorial(key) {
  if (!TUTORIALS[key]) return;
  currentKey = key;
  popupTitle.textContent = TUTORIALS[key].title;

  resetTutorial();
  updateTutorial();

   popupTutorial.classList.add("show");
  if (overlayTutorial) {
    overlayTutorial.style.opacity = "1";
  }
}

function closeTutorial() {
  // Chiudi popup + overlay
  popupTutorial.classList.remove("show");
  if (overlayTutorial) {
    overlayTutorial.style.opacity = "0";
  }
  currentKey = null;
  currentStep = 0;
}

// Eventi
listEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".play-btn");
  if (!btn) return;
  openTutorial(btn.dataset.tutorial);
});

backBtn.addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep--;
    updateTutorial();
  }
});

nextBtn.addEventListener("click", () => {
  if (!currentKey) return;
  const total = TUTORIALS[currentKey].images.length;
  if (currentStep < total - 1) {
    currentStep++;
    updateTutorial();
  } else {
    closeTutorial();
  }
});

skipBtn.addEventListener("click", closeTutorial);

// ESC per chiudere
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && popupTutorial.classList.contains("show")) {
    closeTutorial();
  }
});
