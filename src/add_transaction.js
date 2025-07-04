document.addEventListener("DOMContentLoaded", () => {
  const addCatBtn = document.querySelector(".addcat_button");
  const uncatBtn = document.querySelector(".Uncat_button");
  const categoriesContainer = document.getElementById("categories");

  let categoryCount = 0; // Partiamo da 1 perché ce n'è già una nel markup

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
    img.src = "Red_bin.png";
    img.className = "delete-icon";
    img.alt = "Remove category";
    img.style.cursor = "pointer";
    img.addEventListener("click", () => {
      div.remove();
      categoryCount -= 1;
      updateCategoryLabels();
    });

    const arrow = document.createElement("img");
    arrow.src = "Arrow_Down.png"
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
  });

  uncatBtn.addEventListener("click", () => {
    const allBlocks = categoriesContainer.querySelectorAll(".category-block");
    allBlocks.forEach(block => block.remove());

    const select = categoriesContainer.querySelector("select");
    const input = categoriesContainer.querySelector(".number_input");
    if (select) select.value = "";
    if (input) input.value = "";

    updateCategoryLabels();
  });
});
