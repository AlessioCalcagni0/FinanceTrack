

document.addEventListener("DOMContentLoaded", () => {
  const addCatBtn = document.getElementById("addcat_button");
  const uncatBtn = document.getElementById("Uncat_button");
  const categoriesContainer = document.getElementById("categories");
  const orseparator = document.getElementById("or-separator");

  let categoryCount = 0; // Partiamo da 1 perché ce n'è già una nel markup
  let uncatActive = false;
  function createCategoryBlock(num) {
    const div = document.createElement("div");
    div.classList.add("category-block");

    // Label categoria
    const label = document.createElement("label");
    label.className = "label";
    label.textContent = `Category ${num} *`;
    div.appendChild(label);

    // Select + cestino dentro un wrapper
    const selectWrapper = document.createElement("div");
    selectWrapper.className = "select-with-bin";

    const select = document.createElement("select");
    const options = [
      { value: "", text:"Select the category" },
      { value: "opzione1", text: "Opzione 1" },
      { value: "opzione2", text: "Opzione 2" },
      { value: "opzione3", text: "Opzione 3" },
    ];
    options.forEach(opt => {
      const option = document.createElement("option");
      option.value = opt.value;
      option.textContent = opt.text;
      select.appendChild(option);
    });

    const img = document.createElement("img");
    img.src = "images/Red_bin.png";
    img.className = "delete-icon";
    img.alt = "Remove category";
    img.style.cursor = "pointer";
    img.addEventListener("click", () => {
      div.remove();
      categoryCount -= 1;
      updateCategoryLabels();
      const remainingBlocks = categoriesContainer.querySelectorAll(".category-block");
      if (remainingBlocks.length === 0) {
        // Ripristina bottoni e separatore se non ci sono più blocchi
        uncatBtn.style.display = "inline-block";
        addCatBtn.style.display = "inline-block";
        orseparator.style.display = "inline-block";
        uncatBtn.style.backgroundColor = "#888888";
        uncatActive = false; // resetta anche lo stato
      }
    });

    const arrow = document.createElement("img");
    arrow.src = "images/Arrow_Down.png"
    arrow.className="arrow-down"
    arrow.style.width ="18px"
    arrow.style.height ="12px"
    arrow.style.cursor= "pointer"
    
    selectWrapper.appendChild(arrow)
    selectWrapper.appendChild(select);
    selectWrapper.appendChild(img);
    div.appendChild(selectWrapper);

    // Label e input percentuale
    const percLabel = document.createElement("label");
    percLabel.className = "label";
    percLabel.textContent = `Percentage category ${num}`;
    div.appendChild(percLabel);

    const input = document.createElement("input");
    input.className = "percent_input";
    input.placeholder = "Enter the percentage %";
    input.type = "number";
    input.min = 0;
    input.max = 100;
    div.appendChild(input);

    return div;
  }

  function updateCategoryLabels() {
    const blocks = categoriesContainer.querySelectorAll(".category-block");
    blocks.forEach((block, i) => {
      const labels = block.querySelectorAll("label");
      if (labels.length >= 2) {
        labels[0].textContent = `Category ${i + 1} *`;
        labels[1].textContent = `Percentage category ${i + 1}`;
      }
    });
  }

    
    

  addCatBtn.addEventListener("click", () => {
    categoryCount++;
    const newBlock = createCategoryBlock(categoryCount);
    categoriesContainer.appendChild(newBlock);
    categoriesContainer.scrollTop = categoriesContainer.scrollHeight;
    uncatBtn.style.display = "none";
    orseparator.style.display ="none";
    
  });

  uncatBtn.addEventListener("click", () => {
      uncatActive = !uncatActive; 

    if (uncatActive) {
      uncatBtn.style.backgroundColor = "black";
      uncatBtn.style.color = "white";
      addCatBtn.style.display = "none";
      orseparator.style.display ="none"
    } else {
      uncatBtn.style.backgroundColor = "#888888"; // oppure colore originale
      addCatBtn.style.display = "inline-block";
      orseparator.style.display="inline-block"
    }

    const allBlocks = categoriesContainer.querySelectorAll(".category-block");
    allBlocks.forEach(block => block.remove());

    const select = categoriesContainer.querySelector("select");
    const input = categoriesContainer.querySelector(".number_input");
    if (select) select.value = "";
    if (input) input.value = "";

    updateCategoryLabels();
    
  });



  const confirmButton = document.getElementById("confirm_button");

  confirmButton.addEventListener("click", (e) => {


    const blocks = categoriesContainer.querySelectorAll(".category-block");
    let hasError = false;

    blocks.forEach((block, index) => {
      const select = block.querySelector("select");
      const input = block.querySelector(".percent_input");

      // Rimuove eventuali classi errore

      select.classList.remove("input-error");
      input.classList.remove("input-error");

      // Controllo categoria
      if (!select || select.value === "") {
        select.classList.add("input-error");
        hasError = true;
      }

      // Controllo percentuale
      const inputValue = input.value.trim();
      if (
        inputValue === "" ||
        isNaN(inputValue) ||
        Number(inputValue) < 0 ||
        Number(inputValue) > 100
      ) {
        input.classList.add("input-error");
        hasError = true;
      }
    });

    // Mostra popup in base all'esito
    if (hasError) {
      alert("MANCA QUALCOSA ? "); // popup errore
    } else {
      openConfirmPopup(); // popup successo
    }
  });



});


function goToHomepage() {
    window.location.href = "homepage.html";
}


function openConfirmPopup(){
    document.getElementById("confirm-popup").classList.add("popupactive");
    document.getElementById("overlay").classList.add("overlayactive");
}

function closeConfirmPopup(){
    document.getElementById("confirm-popup").classList.remove("popupactive");
    document.getElementById("overlay").classList.remove("overlayactive");
    goToHomepage()
}


function openWarningPopup(){
    document.getElementById("warning-popup").classList.add("popupactive");
    document.getElementById("overlay").classList.add("overlayactive");
}

function closeWarningPopup(){
    document.getElementById("warning-popup").classList.remove("popupactive");
    document.getElementById("overlay").classList.remove("overlayactive");
    goToHomepage()
}


