document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------
  // ELEMENTI UI – TUTORIAL
  // -----------------------------
  
  const tutorialBtn = document.getElementById("tutorialBtn");
  const overlayTutorial = document.getElementById("overlay-tutorial");
  const popupTutorial = document.getElementById("popup-tutorial");
  const tutorialImage = document.getElementById("tutorial-image");
  const tutorialDescription = document.getElementById("tutorial-description");
  const backBtn = document.getElementById("backBtn");
  const nextBtn = document.getElementById("nextBtn");
  const skipBtn = document.getElementById("skipButton");
  const backarrow = document.getElementById("back-arrow"); 

  function goBack(){
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/";
      }
    }

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
    "../tutorial/add_transaction/1.png",
    "../tutorial/add_transaction/2.png",
    "../tutorial/add_transaction/3.png",
    "../tutorial/add_transaction/4.png"
  ];
  const descriptions = [
    'Step 1: Enter the import in the input field "Enter the amount"',
    "Step 2: Now you can choose categories or to leave it as uncategorized transaction",
    "Step 3: Tap on categories and enter the amount spent in the corresponding fields",
    "Step 4: Make sure that you enter all the amount by checking the progress and then press Confirm!"
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

  function showSections() {
    if (selectLabel) selectLabel.style.display = "block";
    if (categoriesSection) categoriesSection.style.display = "block";
    if (percentageBar) percentageBar.style.display = "block";
    if (tutorialBtn) tutorialBtn.style.display = "block";

    sectionsVisible = true;

    // Se era attivo l'uncategorized, disattivalo per coerenza
    if (uncatActive) {
      uncatActive = false;
      uncatBtn.style.backgroundColor = "#888888";
      orSeparator.style.display = "inline-block";
    }
  }

  function hideSections() {
    if (selectLabel) selectLabel.style.display = "none";
    if (categoriesSection) categoriesSection.style.display = "none";
    if (percentageBar) percentageBar.style.display = "none";
    if (tutorialBtn) tutorialBtn.style.display = "none";

    sectionsVisible = false;
  }

  function resetAllCategories() {
    qsa(".box-category").forEach(box => {
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

  function syncPercentages() {
    const total = parseFloat(qs(".number_input")?.value) || 0;
    if (total === 0) return;

    qsa(".box-category-selected").forEach(box => {
      const amountInput = box.querySelector(".amount-input");
      const percSpan = box.querySelector(".calculated-value");
      if (!amountInput || !percSpan) return;

      const amount = parseFloat(amountInput.value) || 0;
      const perc = (amount / total) * 100;
      percSpan.textContent = perc.toFixed(2) + " %";
    });
  }

  function updatePercentageBar() {
    const total = parseFloat(qs(".number_input")?.value) || 0;
    if (total === 0) return;

    let totalPercentage = 0;
    qsa(".box-category-selected").forEach(box => {
      const amountInput = box.querySelector(".amount-input");
      if (!amountInput) return;
      const amount = parseFloat(amountInput.value) || 0;
      totalPercentage += (amount / total) * 100;
    });

    qs("#percentage-sum").textContent = totalPercentage.toFixed(0) + "%";
    const fill = qs("#percentage-fill");
    fill.style.width = Math.min(totalPercentage, 100) + "%";
    fill.style.backgroundColor = totalPercentage > 100 ? "#fa0000" : "#07e90e";
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
    btn.addEventListener("click", () => document.body.removeChild(overlay));

    popup.appendChild(btn);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
  }

  // -----------------------------
  // AZIONI
  // -----------------------------
  function attachInputListeners() {
    qs(".number_input")?.addEventListener("input", () => {
      syncPercentages();
      updatePercentageBar();
    });

    categoryContainer.addEventListener("input", (e) => {
      if (e.target.classList.contains("amount-input")) {
        syncPercentages();
        updatePercentageBar();
      }
    });
  }

  async function loadCategories() {
    try {
      const res = await fetch(`http://${API_HOST}:8000/api.php?path=categories`);
      const categories = await res.json();

      if (!Array.isArray(categories)) return;

      categoryContainer.innerHTML = "";

      categories
        .filter(cat => cat.name !== "Uncateg.")
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

          const percSpan = document.createElement("span");
          percSpan.className = "calculated-value";
          Object.assign(percSpan.style, {
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            fontWeight: "bold"
          });

          box.appendChild(iconDiv);
          box.appendChild(nameDiv);
          box.appendChild(percSpan);
          categoryContainer.appendChild(box);
        });

      enableCategoryToggle();
    } catch (err) {
      console.error("Errore durante il caricamento categorie:", err);
    }
  }

  function enableCategoryToggle() {
    categoryContainer.addEventListener("click", (e) => {
      const box = e.target.closest(".box-category");
      if (!box) return;
      if (e.target.tagName === "INPUT") return;

      const isSelected = box.classList.toggle("box-category-selected");

      if (isSelected) {
        box.style.position = "relative";
        box.style.zIndex = 1;

        let input = box.querySelector(".amount-input");
        if (!input) {
          input = document.createElement("input");
          input.type = "number";
          input.min = 0;
          input.placeholder = "€";
          input.className = "amount-input";
          box.appendChild(input);

          input.addEventListener("input", () => {
            syncPercentages();
            updatePercentageBar();
          });
        }

        box.style.transition = "width 0.3s";
        box.style.width = "375px";
      } else {
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

  async function confirmAction() {
    const totalInput = qs(".number_input");
    const nameInput = qs(".name_input");
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

    const uncatActiveNow = uncatBtn.style.backgroundColor === "black";
    const selectedBoxes = qsa(".box-category-selected");

    if (!uncatActiveNow && selectedBoxes.length === 0) {
      showPopup("You must select at least a category or press 'Uncategorized transaction'.");
      return;
    }

    let transactions = [];

    if (!uncatActiveNow) {
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
          uncat: uncatActiveNow,
          name: transactionName,
          transactions: transactions
        })
      });

      const data = await res.json();
      console.log("Dati ricevuti dal backend:", data);

      if (data.exceededCategories && data.exceededCategories.length > 0) {
        showPopup(
          "Your cash transaction has been saved but you have reached the budget limits for the following categories:",
          data.exceededCategories
        );
      } else {
        showPopup("Your cash transaction has been saved");
        goBack();
      }
    } catch (err) {
      console.error(err);
      showPopup("Error saving transaction. Please try again.");
    }
  }

  function showCancelPopup(e) {
    if (e && typeof e.preventDefault === "function") e.preventDefault();

    let overlay = document.getElementById("overlay-cancel");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "overlay-cancel";
      overlay.className = "overlay";
      overlay.style.zIndex = "90";
      document.body.appendChild(overlay);
    }

    const popup = document.getElementById("popup-cancel");
    if (!popup) return;

    if (!popup.dataset.initHidden) {
      popup.style.display = "none";
      popup.dataset.initHidden = "1";
    }

    const keepBtn = document.getElementById("keep");
    const loseBtn = document.getElementById("lose");

    const closeAll = () => {
      overlay.classList.remove("overlayactive");
      popup.style.display = "none";
    };

    const clearAllFieldsAndClose = () => {
      qsa("input, textarea, select").forEach((el) => {
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

      resetAllCategories();
      closeAll();
      goBack();
    };

    if (keepBtn) keepBtn.addEventListener("click", closeAll, { once: true });
    if (loseBtn) loseBtn.addEventListener("click", clearAllFieldsAndClose, { once: true });

    overlay.classList.add("overlayactive");
    popup.style.display = "block";
  }

  // -----------------------------
  // LISTENER – TUTORIAL
  // -----------------------------
  if (tutorialBtn && overlayTutorial && popupTutorial) {
    tutorialBtn.addEventListener("click", () => {
      overlayTutorial.classList.add("overlayactive");
      popupTutorial.classList.add("show");
      updateTutorial();
    });

    backBtn?.addEventListener("click", () => {
      if (currentStep > 0) {
        currentStep--;
        updateTutorial();
      }
    });

    skipBtn?.addEventListener("click", () => {
      overlayTutorial.classList.remove("overlayactive");
      popupTutorial.classList.remove("show");
      resetTutorial();
    });

    nextBtn?.addEventListener("click", () => {
      if (currentStep < images.length - 1) {
        currentStep++;
        updateTutorial();
      } else {
        overlayTutorial.classList.remove("overlayactive");
        popupTutorial.classList.remove("show");
        resetTutorial();
      }
    });

    overlayTutorial.addEventListener("click", () => {
      overlayTutorial.classList.remove("overlayactive");
      popupTutorial.classList.remove("show");
      resetTutorial();
    });
  }

  // -----------------------------
  // LISTENER – UNCATEGORIZED
  // -----------------------------
  if (uncatBtn) {
    uncatBtn.addEventListener("click", () => {
      uncatActive = !uncatActive;

      if (uncatActive) {
        uncatBtn.style.backgroundColor = "#888888";
        uncatBtn.style.color = "white";
        orSeparator.style.display = "none";
        if (selectLabel) selectLabel.style.display = "none";
        if (categoriesSection) categoriesSection.style.display = "none";
        if (percentageBar) percentageBar.style.display = "none";
        if (tutorialBtn) tutorialBtn.style.display = "none"
        if (toggleSectionsBtn) toggleSectionsBtn.style.display = "none"
        resetAllCategories();
      } 
      else {
        uncatBtn.style.backgroundColor = "black";

        orSeparator.style.display = "inline-block";
        if (selectLabel) selectLabel.style.display = "none";
        if (categoriesSection) categoriesSection.style.display = "none";
        if (percentageBar) percentageBar.style.display = "none";
        if (tutorialBtn) tutorialBtn.style.display = "none"
        if (toggleSectionsBtn) toggleSectionsBtn.style.display = "block"
      }
    });
  }

  // -----------------------------
  // LISTENER – SHOW/HIDE CATEGORIES (bottone blu chiaro)
  // -----------------------------
  if (toggleSectionsBtn) {
    // Stato iniziale: mostrate
    hideSections();

    toggleSectionsBtn.addEventListener("click", () => {
      sectionsVisible ?   hideSections() : showSections() ;
    });
  }

  // -----------------------------
  // LISTENER – ESPANSIONE CONTENITORE CATEGORIE
  // -----------------------------
  if (toggleCategoriesBtn && categoriesSection && categoryContainer) {
    const initialWrapperHeight = getComputedStyle(categoriesSection).height;
    const initialContainerHeight = getComputedStyle(categoryContainer).height;

    toggleCategoriesBtn.addEventListener("click", () => {
      const items = categoryContainer.querySelectorAll(".box-category").length;
      const newHeightWrapper = (items * 80) + "px";
      const newHeightContainer = ((items * 80) - 50) + "px";

      if (!expanded) {
        categoriesSection.style.height = newHeightWrapper;
        categoryContainer.style.height = newHeightContainer;
        expanded = true;
      } else {
        categoriesSection.style.height = initialWrapperHeight;
        categoryContainer.style.height = initialContainerHeight;
        expanded = false;
      }
    });
  }

  // -----------------------------
  // LISTENER – CONFERMA / CANCEL
  // -----------------------------
  confirmBtn?.addEventListener("click", confirmAction);
  cancelBtn?.addEventListener("click", showCancelPopup);

  backarrow.addEventListener("click", () => { window.history.back();})

  // -----------------------------
  // BOOT
  // -----------------------------

  loadCategories();
  attachInputListeners();
});


  