let categoryColors = {};
let currentPeriod = "settimana";   // periodo selezionato (week di default)
let categoriesCache = [];          // cache categorie (per i "limit")

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

window.onclick = function (event) {
    if (!event.target.matches('#menu') && !event.target.matches("menu-content")) {
        document.getElementsByClassName("back-arrow")[0].classList.remove("show-menu");
        const overlay = document.getElementById("overlay-menu");
        overlay.style.opacity="0";
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

document.addEventListener('DOMContentLoaded', () => {
   
    // --- GRAFICO PIE --- //

    const ctx = document.getElementById('myChart').getContext('2d');
    let pieChart;

    async function caricaDati(periodo = currentPeriod) {
        const res = await fetch(`http://${API_HOST}:8000/api.php?path=api/spese&periodo=${encodeURIComponent(periodo)}`);
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

        // mapping robusto: chiavi alternative se cambiano i nomi
        const labels = dati.map(d => d.categoria ?? d.category ?? d.name ?? "(unknown)");
        const values = dati.map(d => Number(d.totale ?? d.total ?? d.value ?? d.amount ?? 0));

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

        // mappa categoria → colore (riusabile altrove)
        categoryColors = {};
        labels.forEach((lab, i) => {
            categoryColors[lab] = colors[i % colors.length];
        });
    }

    // --- SCELTA PERIODO (Year / Month / Week) --- //
    const periodButtons = document.querySelectorAll(".period-btn");

    function aggiornaPeriodo(periodo) {
        currentPeriod = periodo;
        caricaDati(periodo);         // aggiorna pie
        drawBudgetChart(periodo);    // aggiorna bar
    }

    periodButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            periodButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const periodo = btn.dataset.periodo;
            aggiornaPeriodo(periodo);
        });
    });

    // Default → Week (settimana)
    const defaultBtn = document.querySelector('.period-btn[data-periodo="settimana"]');
    if (defaultBtn) defaultBtn.classList.add("active");
    aggiornaPeriodo("settimana");

    // --- SCELTA ICONA --- //
    const icons = document.querySelectorAll(".choose-icon .icon");
    icons.forEach(icon => {
        icon.addEventListener("click", () => {
            icons.forEach(i => i.classList.remove("icon-selected"));
            icon.classList.add("icon-selected");
        });
    });

    // --- CONFERMA NUOVA CATEGORIA --- //
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

            // prova a leggere il path dalla CSS content, fallback su /images/<id>.png
            let iconPath = getComputedStyle(selectedIcon).content;
            iconPath = iconPath.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
            if (!iconPath) iconPath = `./images/${iconId}.png`;

            if (!name || isNaN(limit)) {
                showWarningPopup("Inserisci un nome e un limite valido!");
                return;
            }

            const categoryData = {
                name,
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
                    loadCategories();            // ricarica elenco categorie
                    drawBudgetChart(currentPeriod); // riallinea bar chart
                    caricaDati(currentPeriod);      // riallinea pie chart
                } else {
                    showWarningPopup("Errore: " + result.error);
                }
            } catch (err) {
                console.error("Errore durante l'inserimento:", err);
                showWarningPopup("Errore durante l'inserimento della categoria");
            }
        });
    }

    // --- WARNING POPUP --- //
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
    const okBtn = document.getElementById("OK");
    if (okBtn) okBtn.addEventListener("click", hideWarningPopup);

    // --- TAB GRAFICI PIE / BAR --- //
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
                drawBudgetChart(currentPeriod); // assicura refresh quando si passa al bar
            }
        });
    });

    // --- CARICA CATEGORIE E DISEGNA GRAFICO BAR --- //
    loadCategories();
    // popola cards e cache + disegna bar chart sul periodo corrente

   


    

});

// --------------------------
// Utility popup open/close
// --------------------------
function openPopup(popup, overlay) {
    document.getElementById(popup).classList.add("category-popupactive");
    document.getElementById(overlay).style.opacity="1";
}
function closePopup(popup, overlay) {
    document.getElementById(popup).classList.remove("category-popupactive");
    document.getElementById(overlay).style.opacity="0";
}

// --------------------------
// Ricerca categorie
// --------------------------
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

// --------------------------
// Carica categorie (cache) e disegna BAR
// --------------------------
async function loadCategories() {
    try {
        const res = await fetch(`http://${API_HOST}:8000/api.php?path=categories`);
        const categories = await res.json();
        console.log(categories);

        if (!Array.isArray(categories)) return;

        // salva in cache per i "limit"
        categoriesCache = categories;

        // render lista categorie
        const container = document.getElementById("container-category");
        if (container) {
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
        }

        checkSpentLimits();

        // disegna/aggiorna bar chart con il periodo corrente
        await drawBudgetChart(currentPeriod);
    } catch (err) {
        console.error("Errore durante il caricamento categorie:", err);
    }
}

// --------------------------
// Highlight spese > limite (solo UI delle card)
// --------------------------
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

// --------------------------
// BAR CHART collegato al periodo
// --------------------------
let budgetChart;

async function drawBudgetChart(periodo = "settimana") {
    try {
        // 1) assicurati di avere le categorie (per i limiti)
        if (!Array.isArray(categoriesCache) || categoriesCache.length === 0) {
            const resCats = await fetch(`http://${API_HOST}:8000/api.php?path=categories`);
            categoriesCache = await resCats.json();
        }

        // 2) spese aggregate per categoria nel periodo selezionato
        const res = await fetch(`http://${API_HOST}:8000/api.php?path=api/spese&periodo=${encodeURIComponent(periodo)}`);
        const datiRaw = await res.json();

        if (!Array.isArray(datiRaw)) {
            console.error("api/spese non ha restituito un array");
            return;
        }

        // Se l'API mischia entrate/uscite, tieni solo gli OUTCOME
        const dati = datiRaw.filter(d => (d.type ?? d.tipo ?? 'outcome') === 'outcome');

        // Mappe: limite per categoria (da categories) e speso per categoria (da api/spese)
        const limitByCat = new Map(
            categoriesCache.map(c => [c.name, Number(c.limite ?? 0)])
        );
        const spentByCat = new Map(
            dati.map(d => [
                (d.category ?? d.categoria ?? d.name ?? "(unknown)"),
                Number(d.total ?? d.totale ?? d.value ?? d.amount ?? 0)
            ])
        );

        // Etichette = tutte le categorie note
        const labels = Array.from(limitByCat.keys());
        const limits = labels.map(l => limitByCat.get(l) ?? 0);
        const spent = labels.map(l => spentByCat.get(l) ?? 0);

        const backgroundColors = spent.map((v, i) => v > limits[i] ? 'red' : 'red');

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
    } catch (err) {
        console.error("Errore drawBudgetChart:", err);
    }
}
function goTo() {

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
};
