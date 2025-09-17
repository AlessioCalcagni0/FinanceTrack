function goBack(){
  window.location.href = "./goals.php";
}

async function handleSubmit(e){
  e.preventDefault();
  const targetRaw = document.getElementById('targetAmount').value || "0";
  const targetParsed = parseFloat(String(targetRaw).replace(',', '.')) || 0; // supporta 10,5

  const payload = {
    user_id: 1,
    name: document.getElementById('goalName').value.trim(),
    goal_type: document.getElementById('goalType').value,
    target_amount: targetParsed,
    deadline: document.getElementById('deadline').value || null,
    saving_source: document.getElementById('savingSource').value
  };
  if(!payload.name){ showPopup("Goal name is required"); return false; }

  try{
    const res = await fetch("./api.php?path=create_goal", {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if(data && data.success){
      // --- costruisci il messaggio del popup ---
      const parts = ["Goal created."];

      // se c'è una deadline futura, calcola la quota settimanale
      if (payload.deadline && payload.target_amount > 0) {
        const today = new Date();
        const dl = new Date(payload.deadline + 'T23:59:59');
        if (!isNaN(dl.getTime()) && dl > today) {
          const ms = dl - today;
          const weeks = Math.max(1, Math.ceil(ms / (1000*60*60*24*7))); // almeno 1 settimana
          const weekly = payload.target_amount / weeks;

          const weeklyText = new Intl.NumberFormat('en-GB', {
            style: 'currency', currency: 'EUR', maximumFractionDigits: 2
          }).format(weekly);

          parts.push(`To reach this goal you'll need to save ${weeklyText} per week.`);
        }
      }

      showPopupAndBack(parts.join('\n')); // \n verrà mostrato a capo (vedi fix sotto)
    }else{
      alert('Error: ' + (data.error || 'unknown'));
    }
  }catch(e){
    alert('Network error'); console.error(e);
  }
  return false;
}


function showPopupAndBack(message, categories = []) {
    // Overlay
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "9999"
    });

    // Box popup
    const popup = document.createElement("div");
    Object.assign(popup.style, {
      backgroundColor: "#ffffffff",
      color: "black",
      padding: "20px",
      borderRadius: "10px",
      maxWidth: "400px",
      width: "90%",
      maxHeight: "70%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      overflowY: "auto",
      boxSizing: "border-box",
      textAlign: "center"
    });


    // Messaggio
    const msg = document.createElement("p");
    msg.textContent = message;
    Object.assign(msg.style, {
      marginBottom: "15px",
      textAlign: "center",
      fontSize: "16px"
    });
    popup.appendChild(msg);

    // Lista categorie (se presente)
    if (Array.isArray(categories) && categories.length > 0) {
      const list = document.createElement("div");
      Object.assign(list.style, {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        height: "125px",
        overflowY: "auto",
        width: "100%",
        alignItems: "center"
      });

      categories.forEach(cat => {
        const box = document.createElement("div");
        Object.assign(box.style, {
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "4px 8px",
          border: "2px solid black",
          borderRadius: "8px",
          backgroundColor: "#152C5C",
          width: "80%",
          height: "50px",
          justifyContent: "center",
          flexShrink: 0
        });

        const iconContainer = document.createElement("div");
        Object.assign(iconContainer.style, {
          width: "35px",
          height: "35px",
          borderRadius: "50%",
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        });

        const iconImg = document.createElement("img");
        iconImg.src = cat.path;
        iconImg.alt = cat.name;
        Object.assign(iconImg.style, {
          width: "80%",
          height: "80%",
          objectFit: "contain",
          borderRadius: "50%"
        });
        iconContainer.appendChild(iconImg);

        const nameDiv = document.createElement("div");
        nameDiv.textContent = cat.name;
        Object.assign(nameDiv.style, {
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          color: "white",
          fontSize: "14px"
        });

        box.appendChild(iconContainer);
        box.appendChild(nameDiv);
        list.appendChild(box);
      });

      popup.appendChild(list);
    }

    // Bottone OK
    const btn = document.createElement("button");
    btn.textContent = "OK";
    Object.assign(btn.style, {
      backgroundColor: "#07e90e",
      border: "none",
      padding: "8px 16px",
      marginTop: "15px",
      cursor: "pointer",
      borderRadius: "5px",
      alignSelf: "center"
    });
    btn.addEventListener("click", () => goBack());

    popup.appendChild(btn);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
  }

  function showPopup(message, categories = []) {
    // Overlay
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "9999"
    });

    // Box popup
    const popup = document.createElement("div");
    Object.assign(popup.style, {
      backgroundColor: "#ffffffff",
      color: "black",
      padding: "20px",
      borderRadius: "10px",
      maxWidth: "400px",
      width: "90%",
      maxHeight: "70%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      overflowY: "auto",
      boxSizing: "border-box",
      textAlign: "center"
    });

    // Messaggio
    const msg = document.createElement("p");
    msg.textContent = message;
    Object.assign(msg.style, {
      marginBottom: "15px",
      textAlign: "center",
      fontSize: "16px"
    });
    popup.appendChild(msg);

    // Lista categorie (se presente)
    if (Array.isArray(categories) && categories.length > 0) {
      const list = document.createElement("div");
      Object.assign(list.style, {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        height: "125px",
        overflowY: "auto",
        width: "100%",
        alignItems: "center"
      });

      categories.forEach(cat => {
        const box = document.createElement("div");
        Object.assign(box.style, {
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "4px 8px",
          border: "2px solid black",
          borderRadius: "8px",
          backgroundColor: "#152C5C",
          width: "80%",
          height: "50px",
          justifyContent: "center",
          flexShrink: 0
        });

        const iconContainer = document.createElement("div");
        Object.assign(iconContainer.style, {
          width: "35px",
          height: "35px",
          borderRadius: "50%",
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        });

        const iconImg = document.createElement("img");
        iconImg.src = cat.path;
        iconImg.alt = cat.name;
        Object.assign(iconImg.style, {
          width: "80%",
          height: "80%",
          objectFit: "contain",
          borderRadius: "50%"
        });
        iconContainer.appendChild(iconImg);

        const nameDiv = document.createElement("div");
        nameDiv.textContent = cat.name;
        Object.assign(nameDiv.style, {
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          color: "white",
          fontSize: "14px"
        });

        box.appendChild(iconContainer);
        box.appendChild(nameDiv);
        list.appendChild(box);
      });

      popup.appendChild(list);
    }

    // Bottone OK
    const btn = document.createElement("button");
    btn.textContent = "OK";
    Object.assign(btn.style, {
      backgroundColor: "#07e90e",
      border: "none",
      padding: "8px 16px",
      marginTop: "15px",
      cursor: "pointer",
      borderRadius: "5px",
      alignSelf: "center"
    });
    btn.addEventListener("click", () => goBack());

    popup.appendChild(btn);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
  }


  document.addEventListener('DOMContentLoaded', () => {

  const tutorialBtn = document.getElementById("tutorialBtn");
  const overlayTutorial = document.getElementById("overlay-tutorial");
  const popupTutorial = document.getElementById("popup-tutorial");
  const tutorialImage = document.getElementById("tutorial-image");
  const tutorialDescription = document.getElementById("tutorial-description");
  const backBtn = document.getElementById("backBtn");
  const nextBtn = document.getElementById("nextBtn");
  const skipBtn = document.getElementById("skipButton");
  const backarrow = document.getElementById("back-arrow"); 


  // -----------------------------
  // ELEMENTI UI – SEZIONI / CATEGORIE
  // -----------------------------
  const uncatBtn = document.getElementById("Uncat_button");
  const orSeparator = document.getElementById("or-separator");
  const toggleSectionsBtn = document.getElementById("toggleSectionsBtn");

  const selectLabel = document.getElementById("select-label");
  const categoriesSection = document.getElementById("categories");
  const percentageBar = document.getElementById("percentage-bar-container");

  const toggleCategoriesBtn = document.getElementById("toggleCategoriesBtn");
  const categoryContainer = document.getElementById("category-container");

  // -----------------------------
  // ELEMENTI UI – CONFERMA / CANCEL
  // -----------------------------
  const confirmBtn = document.getElementById("confirm_button");
  const cancelBtn = document.getElementById("cancel_button");

  // -----------------------------
  // STATI
  // -----------------------------
  let uncatActive = false;     // stato bottone "Uncategorized transaction"
  let sectionsVisible = false;  // stato visibilità label/categorie/barra
  let expanded = false;        // stato espansione contenitore categorie
  let currentStep = 0;         // wizard tutorial

  // -----------------------------
  // DATI TUTORIAL
  // -----------------------------
  const images = [
    "./tutorial/add_transaction/a.png",
    "./tutorial/add_transaction/b.png",
    "./tutorial/add_transaction/c.png",
    "./tutorial/add_transaction/d.png"
  ];
  const descriptions = [
    'Step 1: Enter the goal name and select a goal type',
    "Step 2: Insert the target savings amount",
    "Step 3: Choose a deadline",
    'Step 4: Select a saving source from your wallets and press "Save Goal". The saving sources displayed are the wallets you have created or imported.'
  ];

  // -----------------------------
  // FUNZIONI UTILI
  // -----------------------------
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function updateTutorial() {
    tutorialImage.src = images[currentStep];
    tutorialDescription.textContent = descriptions[currentStep];
    backBtn.disabled = currentStep === 0;

    if (currentStep === images.length - 1) {
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
    tutorialImage.src = images[0];
    tutorialDescription.textContent = descriptions[0];
  }

  // --- apri/chiudi tutorial + listener ---
  function openTutorial(){
    if (!overlayTutorial || !popupTutorial) return;
    overlayTutorial.classList.add('open');
    popupTutorial.classList.add('open');
    resetTutorial();
    updateTutorial();
  }
  function closeTutorial(){
    overlayTutorial?.classList.remove('open');
    popupTutorial?.classList.remove('open');
  }

  if (tutorialBtn) tutorialBtn.addEventListener('click', openTutorial);
  if (overlayTutorial) overlayTutorial.addEventListener('click', (e) => {
    // chiudi clic fuori dal popup
    if (!popupTutorial.contains(e.target)) closeTutorial();
  });
  if (skipBtn) skipBtn.addEventListener('click', closeTutorial);

  if (backBtn) backBtn.addEventListener('click', () => {
    if (currentStep > 0) { currentStep--; updateTutorial(); }
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    if (currentStep < images.length - 1) {
      currentStep++; updateTutorial();
    } else {
      closeTutorial();
    }
  });

  // ESC / frecce tastiera
  document.addEventListener('keydown', (e) => {
    const isOpen = popupTutorial?.classList.contains('open');
    if (!isOpen) return;
    if (e.key === 'Escape') closeTutorial();
    if (e.key === 'ArrowRight') nextBtn?.click();
    if (e.key === 'ArrowLeft') backBtn?.click();
  });
  });