function goHome(){
    window.location.href="./src/homepage.php";
}

 function redirect(location){
    window.location.href= location;
 }

function openMenu(){
    document.getElementById("image1_303_309").classList.add("hide-menu");
    document.getElementById("hh").classList.add("hide-menu");
    document.getElementById("hhs").classList.add("hide-menu");
    document.getElementById("ww").classList.add("hide-menu");
    document.getElementsByClassName("back-arrow")[0].classList.add("show-menu");
    document.getElementById("menu-content").classList.toggle("show-menu");
}

window.onclick = function(event) {
  if (!event.target.matches('#menu') && !event.target.matches("menu-content")) {
    document.getElementById("image1_303_309").classList.remove("hide-menu");
    document.getElementById("hh").classList.remove("hide-menu");
    document.getElementById("hhs").classList.remove("hide-menu");
    document.getElementById("ww").classList.remove("hide-menu");
    document.getElementsByClassName("back-arrow")[0].classList.remove("show-menu");

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show-menu')) {
        openDropdown.classList.remove('show-menu');
      }
    }
  }
}

function closeMenu() {
    document.getElementById("image1_303_309").classList.remove("hide-menu");
    document.getElementById("hh").classList.remove("hide-menu");
    document.getElementById("hhs").classList.remove("hide-menu");
    document.getElementById("ww").classList.remove("hide-menu");
    document.getElementById("menu-content").classList.remove("show-menu");
    document.getElementsByClassName("back-arrow")[0].classList.remove("show-menu");
}

document.addEventListener('DOMContentLoaded', () => {
const ctx = document.getElementById('myChart').getContext('2d');
    let chart;

    async function caricaDati(periodo = "anno") {
      const res = await fetch(`http://localhost:5500/api.php?path=api/spese&periodo=${periodo}`);
      const dati = await res.json();

      const labels = dati.map(d => d.categoria);
      const values = dati.map(d => d.totale);

      if (chart) chart.destroy();

      chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF']
          }]
        }
      });
    }

    // Carico iniziale
    caricaDati("anno");

    // Cambio filtro
    document.getElementById('filtro').addEventListener('change', (e) => {
      caricaDati(e.target.value);
    });

    const icons = document.querySelectorAll(".choose-icon .icon");

    icons.forEach(icon => {
      icon.addEventListener("click", () => {
        // se l'icona cliccata è già selezionata → la deseleziono
        if (icon.classList.contains("icon-selected")) {
          icon.classList.remove("icon-selected");
        } else {
          // tolgo la classe da tutte le altre
          icons.forEach(i => i.classList.remove("icon-selected"));
          // aggiungo la classe solo a quella cliccata
          icon.classList.add("icon-selected");
        }
      });
    });

    const confirmButton = document.getElementById("confirm_button");

    if (!confirmButton) {
        console.error("Confirm button non trovato nel DOM!");
        return;
    }

    confirmButton.addEventListener("click", async () => {
    // seleziona l'icona scelta
    const selectedIcon = document.querySelector(".choose-icon .icon.icon-selected");
    if (!selectedIcon) {
        showWarningPopup("Seleziona un'icona!");
        return;
    }

    const iconId = selectedIcon.id;
    const nameInput = document.querySelector("input[placeholder='Enter the name of the category']");
    const limitInput = document.querySelector("input[placeholder='Enter the limit for the category']");
    const spentInput = document.querySelector("input[placeholder='Enter the money spent']");

    const name = nameInput.value.trim();
    const limit = parseFloat(limitInput.value);
    const spent = spentInput.value ? parseFloat(spentInput.value) : 0;

    if (!name || isNaN(limit)) {
        showWarningPopup("Inserisci un nome e un limite valido!");
        return;
    }

    const categoryData = {
        name: name,
        path: `./${iconId}.png`,
        limite: limit,
        spent: spent
    };

    try {
        const res = await fetch("http://localhost:5500/api.php?path=addCategory", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(categoryData)
        });

        const result = await res.json();

        if (res.ok) {
            showWarningPopup("Categoria aggiunta con successo");
            closePopup('category-popup','overlay');
            loadCategories(); // aggiorna lista categorie
        } else {
            showWarningPopup("Errore: " + result.error);
        }
    } catch (err) {
        console.error("Errore durante l'inserimento:", err);
        showWarningPopup("Errore durante l'inserimento della categoria");
    }
});

    // --- Gestione warning popup ---
    function showWarningPopup(message) {
        const overlay = document.getElementById("warning-overlay");
        const messageBox = document.getElementById("warning-message");

        if (messageBox) {
            messageBox.textContent = message;
        }

        if (overlay) {
            overlay.style.display = "flex"; // mostra overlay
        }
    }

    function hideWarningPopup() {
        const overlay = document.getElementById("warning-overlay");
        if (overlay) {
            overlay.style.display = "none"; // nasconde overlay
        }
    }

    document.getElementById("OK").addEventListener("click", hideWarningPopup);

});

function openPopup(popup, overlay){
    document.getElementById(popup).classList.add("category-popupactive");
    document.getElementById(overlay).classList.add("overlayactive");
}

function closePopup(popup, overlay){
    document.getElementById(popup).classList.remove("category-popupactive");
    document.getElementById(overlay).classList.remove("overlayactive");
}

function search() {
  let input = document.getElementById("search").value.toLowerCase();
  let categories = document.querySelectorAll(".box-category");
  let container = document.querySelector(".container-category");

  let found = false; // flag per sapere se ho trovato risultati

  categories.forEach(cat => {
    let name = cat.querySelector(".category-name").textContent.toLowerCase();

    if (name.includes(input)) {
      cat.style.display = "";   // mostra
      found = true;
    } else {
      cat.style.display = "none"; // nasconde
    }
  });

  // Rimuovi eventuale messaggio precedente
  let noResult = document.querySelector(".no-results");
  if (noResult) noResult.remove();

  // Se non ci sono risultati → aggiungi messaggio
  if (!found) {
    let msg = document.createElement("div");
    msg.classList.add("no-results");
    msg.textContent = `No results for your search`;
    msg.style.padding = "10px";
    msg.style.color = "gray";
    container.appendChild(msg);
  }
}

async function loadCategories() {
    try {
        console.log("Inizio caricamento categorie...");

        // chiama il backend Node.js
        const res = await fetch("http://localhost:5500/api.php?path=categories");
        console.log("Fetch completato, status:", res.status);

        const categories = await res.json();
        console.log("Dati ricevuti dal backend:", categories);

        if (!Array.isArray(categories)) {
            console.error("Errore: categories non è un array!");
            return;
        }

        const container = document.getElementById("container-category");
        container.innerHTML = ""; // pulisco eventuali contenuti
        console.log("Container pulito:", container);

            categories.forEach((cat, index) => {
                console.log("Elemento cat:", cat);
                if (!cat.name) {
                    console.warn(`Elemento ${index} saltato: nome_categoria mancante`, cat);
                    return; // salta se nome_categoria non esiste
                }

                console.log(`Creazione box per categoria: ${cat.nome_categoria}`);

                const box = document.createElement("div");
                box.className = "box-category";

                const iconDiv = document.createElement("div");
                iconDiv.className = "icon";
                iconDiv.id = cat.name ? cat.name.toLowerCase() : "unknown";

                if (cat.path_immagine) {
                    iconDiv.style.backgroundImage = `url('${cat.path_immagine}')`;
                    iconDiv.style.backgroundSize = "cover";
                }

                const nameDiv = document.createElement("div");
                nameDiv.className = "category-name";
                nameDiv.textContent = cat.name;

                const limitDiv = document.createElement("div");
                limitDiv.className = "category-limit";
                limitDiv.textContent = cat.limite + " $";

                const spentDiv = document.createElement("div");
                spentDiv.className = "category-spent";
                spentDiv.textContent = cat.spent + " $";

                box.appendChild(iconDiv);
                box.appendChild(nameDiv);
                box.appendChild(limitDiv);
                box.appendChild(spentDiv);

                container.appendChild(box);
                console.log(`Box per ${cat.nome_categoria} aggiunto al container`);
            });

        console.log("Caricamento categorie completato!");
        checkSpentLimits()
        drawBudgetChart(); 

    } 
    catch (err) {
        console.error("Errore durante il caricamento categorie:", err);
    }
}

document.addEventListener("DOMContentLoaded", loadCategories)

function checkSpentLimits() {
    // seleziona tutte le box delle categorie
    const boxes = document.querySelectorAll(".box-category");

    boxes.forEach(box => {
        const limitDiv = box.querySelector(".category-limit");
        const spentDiv = box.querySelector(".category-spent");

        if (!limitDiv || !spentDiv) return;

        // estrai i valori numerici rimuovendo eventuali '$' e spazi
        const limit = parseFloat(limitDiv.textContent.replace(/\$/g, "").trim());
        console.log("Limite = " , limit)
        const spent = parseFloat(spentDiv.textContent.replace(/\$/g, "").trim());
        console.log("Spent=" , spent)

        if (spent > limit) {
            spentDiv.style.backgroundColor = "red"; // sfondo rosso
            spentDiv.style.color = "white"; // testo bianco per leggibilità
        } else {
            spentDiv.style.backgroundColor = ""; // reset se non supera il limite
            spentDiv.style.color = ""; // reset colore testo
        }
    });
}

let budgetChart; 

function drawBudgetChart() {
    const boxes = document.querySelectorAll(".box-category");
    const labels = [];
    const limits = [];
    const spent = [];
    const backgroundColors = [];

    boxes.forEach(box => {
        const name = box.querySelector(".category-name").textContent;
        const limit = parseFloat(box.querySelector(".category-limit").textContent.replace(/\$/g,"").trim());
        const spend = parseFloat(box.querySelector(".category-spent").textContent.replace(/\$/g,"").trim());

        labels.push(name);
        limits.push(limit);
        spent.push(spend);

        // colore rosso se superato, altrimenti verde
        backgroundColors.push(spend > limit ? 'red' : 'green');
    });

    const ctx = document.getElementById('budgetChart').getContext('2d');

    // distruggi il grafico precedente se esiste
    if (budgetChart) {
        budgetChart.destroy();
    }

    budgetChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Limit',
                    data: limits,
                    backgroundColor: 'blue'
                },
                {
                    label: 'Spent',
                    data: spent,
                    backgroundColor: backgroundColors
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}
