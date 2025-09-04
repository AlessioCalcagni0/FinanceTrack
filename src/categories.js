 let categoryColors = {};

document.addEventListener('DOMContentLoaded', () => {
    // --- GRAFICO PIE ---
    const ctx = document.getElementById('myChart').getContext('2d');
    let pieChart;
   

    async function caricaDati(periodo = "anno") {
        const res = await fetch(`http://${API_HOST}:8000/api.php?path=api/spese&periodo=${periodo}`);
        const dati = await res.json();
        console.log("risposta api/spese:", dati);

        if (!Array.isArray(dati)) {
            console.error("api/spese non ha restituito un array");
            return;
        }
        if (dati.length === 0) {
            console.warn("api/spese ha restituito un array vuoto");
        } else {
            console.log("primo elemento:", dati[0], "chiavi:", Object.keys(dati[0] || {}));
        }

        // mapping robusto: usa chiavi alternative se cambiano i nomi
        const labels = dati.map(d => d.categoria ?? d.category ?? d.name ?? "(unknown)");
        const values = dati.map(d => Number(d.totale ?? d.total ?? d.value ?? 0));

        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

        if (pieChart) pieChart.destroy();

        pieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors
                }]
            }
        });

        categoryColors = {};
        labels.forEach((lab, i) => {
            categoryColors[lab] = colors[i % colors.length];
        });


    }

    


    // Caricamento iniziale
    caricaDati("anno");

    // --- SCELTA PERIODO (Year / Month / Week) ---
    const periodButtons = document.querySelectorAll(".period-btn");

    function aggiornaPeriodo(periodo) {
        // ricarica i grafici in base al periodo
        caricaDati(periodo);
        // se vuoi anche il bar chart con stesso periodo:
        // drawBudgetChart(periodo);
    }

    periodButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // reset attivi
            periodButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            // aggiorna grafico
            const periodo = btn.dataset.periodo;
            aggiornaPeriodo(periodo);
        });
    });

    // Default → Week
    const defaultBtn = document.querySelector('.period-btn[data-periodo="settimana"]');
    if (defaultBtn) {
        defaultBtn.classList.add("active");
        aggiornaPeriodo("settimana");
    }

    // --- SCELTA ICONA ---
    const icons = document.querySelectorAll(".choose-icon .icon");
    icons.forEach(icon => {
        icon.addEventListener("click", () => {
            icons.forEach(i => i.classList.remove("icon-selected"));
            icon.classList.add("icon-selected");
        });
    });

    // --- CONFERMA NUOVA CATEGORIA ---
    const confirmButton = document.getElementById("confirm_button");
    if (confirmButton) {
        confirmButton.addEventListener("click", async () => {
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
            let iconPath = getComputedStyle(selectedIcon).content;
            iconPath = iconPath.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');

            if (!iconPath) {
                iconPath = `./images/${iconId}.png`;
            }

            if (!name || isNaN(limit)) {
                showWarningPopup("Inserisci un nome e un limite valido!");
                return;
            }

            const categoryData = {
                name: name,
                path: iconPath,
                limite: limit,
                spent
            };

            try {
                const res = await fetch(`http://${API_HOST}:8000/api.php?path=addCategory`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(categoryData)
                });

                const result = await res.json();

                if (res.ok) {
                    showWarningPopup("Categoria aggiunta con successo");
                    closePopup('category-popup', 'overlay');
                    loadCategories();
                } else {
                    showWarningPopup("Errore: " + result.error);
                }
            } catch (err) {
                console.error("Errore durante l'inserimento:", err);
                showWarningPopup("Errore durante l'inserimento della categoria");
            }
        });
    }

    // --- WARNING POPUP ---
    function showWarningPopup(message) {
        const overlay = document.getElementById("warning-overlay");
        const messageBox = document.getElementById("warning-message");

        if (messageBox) messageBox.textContent = message;
        if (overlay) overlay.style.display = "flex";
    }

    function hideWarningPopup() {
        const overlay = document.getElementById("warning-overlay");
        if (overlay) overlay.style.display = "none";
    }

    document.getElementById("OK").addEventListener("click", hideWarningPopup);

    // --- TAB GRAFICI PIE / BAR ---
    const tabs = document.querySelectorAll(".chart-tab");
    const pieBox = document.getElementById("chart-pie");
    const barBox = document.getElementById("chart-bar");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            if (tab.dataset.target === "pie") {
                pieBox.style.display = "flex";
                barBox.style.display = "none";
            } else {
                pieBox.style.display = "none";
                barBox.style.display = "flex";
            }
        });
    });




    // --- CARICA CATEGORIE E DISEGNA GRAFICO BAR ---
    loadCategories();
});




function openPopup(popup, overlay) {
    document.getElementById(popup).classList.add("category-popupactive");
    document.getElementById(overlay).classList.add("overlayactive");
}

function closePopup(popup, overlay) {
    document.getElementById(popup).classList.remove("category-popupactive");
    document.getElementById(overlay).classList.remove("overlayactive");
}

function search() {
    const input = document.getElementById("search").value.toLowerCase();
    const categories = document.querySelectorAll(".box-category");
    const container = document.querySelector(".container-category");

    let found = false;

    categories.forEach(cat => {
        const name = cat.querySelector(".category-name").textContent.toLowerCase();
        if (name.includes(input)) {
            cat.style.display = "";
            found = true;
        } else {
            cat.style.display = "none";
        }
    });

    // rimuovi messaggio precedente
    const noResult = document.querySelector(".no-results");
    if (noResult) noResult.remove();

    if (!found) {
        const msg = document.createElement("div");
        msg.classList.add("no-results");
        msg.textContent = `No results for your search`;
        msg.style.padding = "10px";
        msg.style.color = "gray";
        container.appendChild(msg);
    }
}

async function loadCategories() {
    try {
        const res = await fetch(`http://${API_HOST}:8000/api.php?path=categories`);
        const categories = await res.json();
        console.log(categories);

        if (!Array.isArray(categories)) return;

        const container = document.getElementById("container-category");
        container.innerHTML = "";

        categories.forEach(cat => {
            if (!cat.name) return;

            const box = document.createElement("div");
            box.className = "box-category";
            const color = categoryColors[cat.name] || "#ccc";
            box.style.backgroundColor = `${color}`;

            const iconDiv = document.createElement("div");
            iconDiv.className = "icon";
            iconDiv.id = cat.name.toLowerCase();
            console.log(cat.path);
            if (cat.path) {
                iconDiv.style.backgroundImage = `url('${cat.path}')`;
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
        });

        checkSpentLimits();
        drawBudgetChart();
    } catch (err) {
        console.error("Errore durante il caricamento categorie:", err);
    }
}

function checkSpentLimits() {
    const boxes = document.querySelectorAll(".box-category");
    boxes.forEach(box => {
        const limitDiv = box.querySelector(".category-limit");
        const spentDiv = box.querySelector(".category-spent");

        if (!limitDiv || !spentDiv) return;

        const limit = parseFloat(limitDiv.textContent.replace(/\$/g, "").trim());
        const spent = parseFloat(spentDiv.textContent.replace(/\$/g, "").trim());

        if (spent > limit) {
            spentDiv.style.backgroundColor = "red";
            spentDiv.style.color = "white";
        } else {
            spentDiv.style.backgroundColor = "";
            spentDiv.style.color = "";
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
        const limit = parseFloat(box.querySelector(".category-limit").textContent.replace(/\$/g, "").trim());
        const spend = parseFloat(box.querySelector(".category-spent").textContent.replace(/\$/g, "").trim());

        labels.push(name);
        limits.push(limit);
        spent.push(spend);

        backgroundColors.push(spend > limit ? 'red' : 'green');
    });

    const ctx = document.getElementById('budgetChart').getContext('2d');

    if (budgetChart) budgetChart.destroy();

    budgetChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Limit', data: limits, backgroundColor: 'blue' },
                { label: 'Spent', data: spent, backgroundColor: backgroundColors }
            ]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}
