

document.addEventListener("DOMContentLoaded", () => {

  const tutorialBtn = document.getElementById("tutorialBtn");
  const overlay = document.getElementById("overlay-tutorial");
  const popup = document.getElementById("popup-tutorial");
  const tutorialImage = document.getElementById("tutorial-image");
  const tutorialDescription = document.getElementById("tutorial-description");
  const backBtn = document.getElementById("backBtn");
  const nextBtn = document.getElementById("nextBtn");
  const skipBtn = document.getElementById("skipButton");

  // Array di immagini e descrizioni corrispondenti
  const images = ["../tutorial/add_transaction/1.png", "../tutorial/add_transaction/2.png", "../tutorial/add_transaction/3.png", "../tutorial/add_transaction/4.png"];
  const descriptions = [
    "Step 1: Enter the import in the input field \"Enter the amount\"",
    "Step 2: Now you can choose categories or to leave it as uncategorized transaction",
    "Step 3: Tap on categories and enter the amount spent in the corresponding fields",
    "Step 4: Make sure that you enter all the amount by checking the progress and then press Confirm!"
  ];

  let currentStep = 0;

  function updateTutorial() {
    tutorialImage.src = images[currentStep];
    tutorialDescription.textContent = descriptions[currentStep]; // aggiorna la descrizione

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

  tutorialBtn.addEventListener("click", () => {
    overlay.classList.add("overlayactive");
    popup.classList.add("show");
    updateTutorial();
  });

  backBtn.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep--;
      updateTutorial();
    }
  });

  skipBtn.addEventListener("click", () => {
    overlay.classList.remove("overlayactive");
    popup.classList.remove("show");
    resetTutorial();
  });

  nextBtn.addEventListener("click", () => {
    if (currentStep < images.length - 1) {
      currentStep++;
      updateTutorial();
    } else {
      overlay.classList.remove("overlayactive");
      popup.classList.remove("show");
      resetTutorial();
    }
  });

  overlay.addEventListener("click", () => {
    overlay.classList.remove("overlayactive");
    popup.classList.remove("show");
    resetTutorial();
  });

  const uncatBtn = document.getElementById("Uncat_button");
  const orseparator = document.getElementById("or-separator");

  let uncatActive = false;

  uncatBtn.addEventListener("click", () => {
    uncatActive = !uncatActive;

    const selectLabel = document.getElementById("select-label");
    const categoriesSection = document.getElementById("categories");
    const percentageBar = document.getElementById("percentage-bar-container"); // aggiunto

    if (uncatActive) {
      // Bottone attivo
      uncatBtn.style.backgroundColor = "black";
      uncatBtn.style.color = "white";
      orseparator.style.display = "none";
      if (selectLabel) selectLabel.style.display = "none";
      if (categoriesSection) categoriesSection.style.display = "none";
      percentageBar.style.display = "none"; // nascondi progress bar
      resetAllCategories();
    } else {
      // Bottone disattivo
      uncatBtn.style.backgroundColor = "#888888";
      uncatBtn.style.color = "";
      orseparator.style.display = "inline-block";
      if (selectLabel) selectLabel.style.display = "block";
      if (categoriesSection) categoriesSection.style.display = "block";
      if (percentageBar) percentageBar.style.display = "block"; // mostra progress bar
    }
  });

  loadCategories();
  attachInputListeners();

  document.getElementById("confirm_button").addEventListener("click", confirmAction);
  document.getElementById("cancel_button").addEventListener("click", showCancelPopup);


  const btn = document.getElementById("toggleCategoriesBtn");
  const wrapper = document.getElementById("categories");
  const container = document.getElementById("category-container");

  if (!btn || !wrapper || !container) return;

  // salva le altezze iniziali definite nel CSS
  const initialWrapperHeight = getComputedStyle(wrapper).height;
  const initialContainerHeight = getComputedStyle(container).height;

  let expanded = false;

  btn.addEventListener("click", () => {
    const items = container.querySelectorAll(".box-category").length;
    const newHeight = (items * 80) + "px";
    const newHeight2 = ((items * 80) -50) + "px";

    if (!expanded) {
      // espandi
      wrapper.style.height = newHeight;
      container.style.height = newHeight2;
      expanded = true;
    } else {
      // torna allo stato iniziale
      wrapper.style.height = initialWrapperHeight;
      container.style.height = initialContainerHeight;
      expanded = false;
    }
  });

});

// Carica categorie dal backend
async function loadCategories() {
  try {
    const res = await fetch(`http://${API_HOST}:8000/api.php?path=categories`);
    const categories = await res.json();
    console.log(categories)

    if (!Array.isArray(categories)) return;

    const container = document.getElementById("category-container");
    container.innerHTML = "";

    categories
      .filter(cat => cat.name !== "Uncateg.") // <-- Filtra Uncategorized
      .forEach(cat => {
        if (!cat.name) return;

        const box = document.createElement("div");
        box.className = "box-category";
        box.style.position = "relative";

        const iconDiv = document.createElement("div");
        iconDiv.className = "icon";
        iconDiv.id = cat.name.toLowerCase();
        if (cat.path_immagine) iconDiv.style.backgroundImage = `url('${cat.path_immagine}')`;
        iconDiv.style.backgroundSize = "cover";

        const nameDiv = document.createElement("div");
        nameDiv.className = "category-name";
        nameDiv.textContent = cat.name;

        // Span per percentuale calcolata
        const percSpan = document.createElement("span");
        percSpan.className = "calculated-value";
        percSpan.style.position = "absolute";
        percSpan.style.right = "10px";
        percSpan.style.top = "50%";
        percSpan.style.transform = "translateY(-50%)";
        percSpan.style.fontWeight = "bold";

        box.appendChild(iconDiv);
        box.appendChild(nameDiv);
        box.appendChild(percSpan);

        container.appendChild(box);
      });

    enableCategoryToggle();
  } catch (err) {
    console.error("Errore durante il caricamento categorie:", err);
  }
}


// Toggle box-category e input importo
function enableCategoryToggle() {
  const container = document.getElementById("category-container");

  container.addEventListener("click", (e) => {
    const box = e.target.closest(".box-category");
    if (!box) return;
    if (e.target.tagName === "INPUT") return;

    const isSelected = box.classList.toggle("box-category-selected");

    if (isSelected) {
      box.style.position = "relative";
      box.style.zIndex = 1;

      // Input importo in soldi
      let input = box.querySelector(".amount-input");
      if (!input) {
        input = document.createElement("input");
        input.type = "number";
        input.min = 0;
        input.placeholder = "€";
        input.className = "amount-input";


        box.appendChild(input);

        // Aggiorna percentuale automaticamente
        input.addEventListener("input", () => {
          syncPercentages();
          updatePercentageBar();
        });
      }

      box.style.transition = "width 0.3s";
      box.style.width = "375px";

    } else {
      // Deseleziona box
      const input = box.querySelector(".amount-input");
      if (input) box.removeChild(input);

      const percSpan = box.querySelector(".calculated-value");
      if (percSpan) percSpan.textContent = "";

      box.style.width = "180px";
      box.style.zIndex = "";
      box.style.position = "";
    }

    syncPercentages();
    updatePercentageBar();
  });
}

// Calcola la percentuale in base all'importo inserito
function syncPercentages() {
  const totalInput = document.querySelector(".number_input");
  const total = parseFloat(totalInput?.value) || 0;
  if (total === 0) return;

  const boxes = document.querySelectorAll(".box-category-selected");
  boxes.forEach(box => {
    const amountInput = box.querySelector(".amount-input");
    const percSpan = box.querySelector(".calculated-value");
    if (amountInput && percSpan) {
      const amount = parseFloat(amountInput.value) || 0;
      const perc = (amount / total) * 100;
      percSpan.textContent = perc.toFixed(2) + " %";
    }
  });
}

// Aggiorna barra percentuale
function updatePercentageBar() {
  const totalInput = document.querySelector(".number_input");
  const total = parseFloat(totalInput?.value) || 0;
  if (total === 0) return;

  const boxes = document.querySelectorAll(".box-category-selected");
  let totalPercentage = 0;

  boxes.forEach(box => {
    const amountInput = box.querySelector(".amount-input");
    if (amountInput) {
      const amount = parseFloat(amountInput.value) || 0;
      totalPercentage += (amount / total) * 100;
    }
  });

  document.getElementById("percentage-sum").textContent = totalPercentage.toFixed(0) + "%";
  const fill = document.getElementById("percentage-fill");
  fill.style.width = Math.min(totalPercentage, 100) + "%";
  fill.style.backgroundColor = totalPercentage > 100 ? "#fa0000" : "#07e90e";
}

// Event listener per input totale e importi
function attachInputListeners() {
  const totalInput = document.querySelector(".number_input");
  totalInput?.addEventListener("input", () => {
    syncPercentages();
    updatePercentageBar();
  });

  document.getElementById("category-container").addEventListener("input", (e) => {
    if (e.target.classList.contains("amount-input")) {
      syncPercentages();
      updatePercentageBar();
    }
  });
}

// Reset di tutti i box-category
function resetAllCategories() {
  const boxes = document.querySelectorAll(".box-category");
  boxes.forEach(box => {
    box.classList.remove("box-category-selected");
    box.style.width = "180px";
    box.style.zIndex = "";
    box.style.position = "";

    const input = box.querySelector(".amount-input");
    if (input) box.removeChild(input);

    const percSpan = box.querySelector(".calculated-value");
    if (percSpan) percSpan.textContent = "";
  });

  updatePercentageBar();
}

async function confirmAction() {
  const totalInput = document.querySelector(".number_input");
  const nameInput = document.querySelector(".name_input");
  const totalAmount = parseFloat(totalInput?.value);
  const transactionName = nameInput?.value.trim();

  if (!nameInput || transactionName === "") {
    showPopup("Insert a valid transaction name.");
    return;
  }

  if (!totalInput || isNaN(totalAmount) || totalAmount <= 0) {
    showPopup("Insert a valid total amount.");
    return;
  }

  const uncatBtn = document.getElementById("Uncat_button");
  const uncatActive = uncatBtn.style.backgroundColor === "black";

  const selectedBoxes = Array.from(document.querySelectorAll(".box-category-selected"));

  if (!uncatActive && selectedBoxes.length === 0) {
    showPopup("You must select at least a category or press 'Uncategorized transaction'.");
    return;
  }

  let transactions = [];

  if (uncatActive) {
    transactions = []; // Nessuna categoria selezionata
  }

  if (!uncatActive) {
    let sumAmounts = 0;

    for (const box of selectedBoxes) {
      const amountInput = box.querySelector(".amount-input");
      if (!amountInput || isNaN(parseFloat(amountInput.value))) {
        showPopup("Insert all imports in selected categories.");
        return;
      }
      const amount = parseFloat(amountInput.value);
      sumAmounts += amount;

      transactions.push({
        name: box.querySelector(".category-name").textContent,
        amount: amount
      });
    }

    if (Math.round(sumAmounts) !== Math.round(totalAmount)) {
      showPopup("The sum of the imports of categories must be equal to the total amount.");
      return;
    }
  }

  try {
    const res = await fetch(`http://${API_HOST}:8000/api.php?path=save_transaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        total: totalAmount,
        uncat: uncatActive,
        name: transactionName,
        transactions: transactions
      })
    });

    const data = await res.json();

    // Stampa subito tutto quello che arriva dal backend
    console.log("Dati ricevuti dal backend:", data);

    if (data.exceededCategories && data.exceededCategories.length > 0) {
      // Passa direttamente gli oggetti completi a showPopup
      showPopup(
        "Your cash transaction has been saved but you have reached the budget limits for the following categories:",
        data.exceededCategories
      );
    } else {
      showPopup("Your cash transaction has been saved");
    }

  } catch (err) {
    console.error(err);
    showPopup("Error saving transaction. Please try again.");
  }
}

function showPopup(message, categories = []) {
  console.log("Dati ricevuti da backend:", categories);

  // Overlay
  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
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

  // Lista categorie
  if (categories.length > 0) {
    const list = document.createElement("div");
    Object.assign(list.style, {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      height: "125px",       // Altezza fissa per 2,5 box
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
        height: "50px",       // Altezza coerente con la lista
        justifyContent: "center",
        flexShrink: "0"
      });

      // Contenitore cerchio bianco
      const iconContainer = document.createElement("div");
      Object.assign(iconContainer.style, {
        width: "35px",
        height: "35px",
        borderRadius: "50%",
        backgroundColor: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: "0"
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

      // Nome categoria
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
  btn.addEventListener("click", () => document.body.removeChild(overlay));

  popup.appendChild(btn);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
}

function showCancelPopup(e) {
  if (e && typeof e.preventDefault === "function") e.preventDefault();

  // overlay per il cancel (se non esiste lo creo)
  let overlay = document.getElementById("overlay-cancel");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "overlay-cancel";
    overlay.className = "overlay";
    overlay.style.zIndex = "90"; // sotto al popup
    document.body.appendChild(overlay);
  }

  // popup già presente in pagina (HTML che hai incollato)
  const popup = document.getElementById("popup-cancel");
  if (!popup) return;

  // assicuro che il popup parta nascosto la prima volta
  if (!popup.dataset.initHidden) {
    popup.style.display = "none";
    popup.dataset.initHidden = "1";
  }

  // pulsanti del popup
  const keepBtn = document.getElementById("keep");
  const loseBtn = document.getElementById("lose");

  // helper: chiudi overlay + popup
  const closeAll = () => {
    overlay.classList.remove("overlayactive");
    popup.style.display = "none";
  };

  // helper: pulisce tutti i campi e chiude
  const clearAllFieldsAndClose = () => {
    // reset campi base
    document.querySelectorAll("input, textarea, select").forEach((el) => {
      // evita di toccare i bottoni del popup
      if (popup.contains(el)) return;

      const tag = el.tagName.toLowerCase();
      if (tag === "select") {
        el.selectedIndex = 0;
        el.dispatchEvent(new Event("change", { bubbles: true }));
        return;
      }
      if (el.type === "checkbox" || el.type === "radio") {
        el.checked = false;
        el.dispatchEvent(new Event("change", { bubbles: true }));
        return;
      }
      el.value = "";
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });

    // reset specifico per la tua UI
    if (typeof resetAllCategories === "function") resetAllCategories();



    closeAll();
  };

  // (ri)collego gli handler con {once:true} per evitare duplicazioni
  if (keepBtn) keepBtn.addEventListener("click", closeAll, { once: true });
  if (loseBtn) loseBtn.addEventListener("click", clearAllFieldsAndClose, { once: true });

  // mostra overlay + popup
  overlay.classList.add("overlayactive");
  popup.style.display = "block";
}

