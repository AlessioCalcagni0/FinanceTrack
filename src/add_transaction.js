document.addEventListener("DOMContentLoaded", () => {
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
});

// Carica categorie dal backend
async function loadCategories() {
  try {
    const res = await fetch("http://192.168.1.12:8000/api.php?path=categories");
    const categories = await res.json();
    console.log(categories)

    if (!Array.isArray(categories)) return;

    const container = document.getElementById("category-container");
    container.innerHTML = "";

    categories
      .filter(cat => cat.category_name !== "Uncateg.") // <-- Filtra Uncategorized
      .forEach(cat => {
        if (!cat.category_name) return;

        const box = document.createElement("div");
        box.className = "box-category";
        box.style.position = "relative";

        const iconDiv = document.createElement("div");
        iconDiv.className = "icon";
        iconDiv.id = cat.category_name.toLowerCase();
        if (cat.path_immagine) iconDiv.style.backgroundImage = `url('${cat.path_immagine}')`;
        iconDiv.style.backgroundSize = "cover";

        const nameDiv = document.createElement("div");
        nameDiv.className = "category-name";
        nameDiv.textContent = cat.category_name;

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
      box.style.zIndex = 100;

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
  const totalAmount = parseFloat(totalInput?.value);

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
        category_name: box.querySelector(".category-name").textContent,
        amount: amount
      });
    }

    if (Math.round(sumAmounts) !== Math.round(totalAmount)) {
      showPopup("The sum of the imports of categories must be equal to the total amount.");
      return;
    }
  }

  try {
    const res = await fetch("http://192.168.1.12:8000/api.php?path=save_transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        total: totalAmount,
        uncat: uncatActive,
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
      iconImg.alt = cat.category_name;
      Object.assign(iconImg.style, {
        width: "80%",
        height: "80%",
        objectFit: "contain",
        borderRadius: "50%"
      });

      iconContainer.appendChild(iconImg);

      // Nome categoria
      const nameDiv = document.createElement("div");
      nameDiv.textContent = cat.category_name;
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
