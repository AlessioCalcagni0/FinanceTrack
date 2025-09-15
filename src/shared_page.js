

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
    document.getElementsByClassName("back-arrow")[0].classList.add("show-menu");

    document.getElementById("menu-content").classList.toggle("show-menu");
    const overlay = document.getElementById("overlay");
    overlay.classList.add("overlayactive");

}
function closeMenu() {

    document.getElementById("menu-content").classList.remove("show-menu");
    document.getElementsByClassName("back-arrow")[0].classList.remove("show-menu");
    const overlay = document.getElementById("overlay");
    overlay.classList.remove("overlayactive");
}

window.onclick = function (event) {
    if (!event.target.matches('#menu') && !event.target.matches("menu-content")) {


        document.getElementsByClassName("back-arrow")[0].classList.remove("show-menu");
        const overlay = document.getElementById("overlay");
        overlay.classList.remove("overlayactive");
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



   
    
    window.currentAccountId = getAccountIdFromURL();
    console.log(window.currentAccountId);
    function UpdateDate() {
        const oggi = new Date();
        const options = { weekday: 'short' };
        const weekday = oggi.toLocaleDateString("en-US", options);
        const day = String(oggi.getDate()).padStart(2, "0");
        const month = String(oggi.getMonth() + 1).padStart(2, "0");
        const year = oggi.getFullYear();
        const fullDate = `${weekday} ${day}/${month}/${year}`;
    }
    

    // ✅ invoca davvero la funzione
    UpdateDate();
    // ✅ aggiorna ogni minuto (60000 ms)
    setInterval(UpdateDate, 60000);

    loadName();
    loadIncome();
    loadSpent();
    loadBalance();
    loadTodayTransactions();
    loadLastWeekTransactions();

});

// 🔻 Aggiungi accountId ai fetch per i totali (opzionale ma consigliato)
async function loadIncome() {
    try {
        const accountId = getEffectiveAccountId();
        console.log(accountId);
        const url = new URL(`http://${API_HOST}:8000/api.php`);
        url.searchParams.set("path", "income_sum");
        if (accountId) url.searchParams.set("accountId", accountId);

        const resSum = await fetch(url.toString());
        const sumData = await resSum.json();

        document.getElementById("income-sum").textContent =
            ((sumData.totale ?? 0)) + "€";
    } catch (err) {
        document.getElementById("income-sum").textContent = "Errore caricamento entrate!";
        console.error(err);
    }
}

async function loadSpent() {
    try {
        const accountId = getEffectiveAccountId();
        const url = new URL(`http://${API_HOST}:8000/api.php`);
        url.searchParams.set("path", "spent_sum");
        if (accountId) url.searchParams.set("accountId", accountId);

        const resSum = await fetch(url.toString());
        const sumData = await resSum.json();

        document.getElementById("spent-sum").textContent =
            ((sumData.totale ?? 0)) + "€";
    } catch (err) {
        document.getElementById("spent-sum").textContent = "Errore caricamento uscite!";
        console.error(err);
    }
}

async function loadBalance() {
    try {
        const qs = new URLSearchParams(window.location.search);
        const pBalance = qs.get("balance");      // es: "123.45"
        const pParts = qs.get("participants"); // es: "3"
        const tot = document.getElementById("tot-balance");

        // Se ho parametri in query → usali
        if ((pBalance !== null) || (pParts !== null)) {
            // balance
            let balText = "";
            if (pBalance !== null && pBalance !== "") {
                const n = Number(pBalance);
                balText = Number.isFinite(n)
                    ? n.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + "€"
                    : `${pBalance}€`;
            }
            if (tot) tot.textContent = balText;

            // ► Participants tra "Total Balance" e data
            upsertParticipantsLine(pParts);

            return; // non chiamare API se i parametri sono presenti
        }

        // Fallback via API (nessun parametro in query)
        const accountId = getEffectiveAccountId();

        const urlIncome = new URL(`http://${API_HOST}:8000/api.php`);
        urlIncome.searchParams.set("path", "income_sum");
        if (accountId) urlIncome.searchParams.set("accountId", accountId);

        const urlSpent = new URL(`http://${API_HOST}:8000/api.php`);
        urlSpent.searchParams.set("path", "spent_sum");
        if (accountId) urlSpent.searchParams.set("accountId", accountId);

        const [resIncome, resSpent] = await Promise.all([
            fetch(urlIncome.toString()),
            fetch(urlSpent.toString())
        ]);

        const incomeData = await resIncome.json();
        const spentData = await resSpent.json();

        const income = Number(incomeData.totale ?? 0);
        const spent = Number(spentData.totale ?? 0);
        const balance = income - spent;

        if (tot) {
            tot.textContent = balance.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + "€";
        }

        // Nessun valore partecipanti in questo caso → nascondi la riga se esiste
        upsertParticipantsLine(null);

    } catch (err) {
        const el = document.getElementById("tot-balance");
        if (el) el.textContent = "Errore calcolo saldo!";
        console.error(err);
    }
}



// Persone disponibili
const PEOPLE = ["Mario Rossi", "Giulia Bianchi"];
const getPersonByIndex = (i) => PEOPLE[i % PEOPLE.length];

// ── OGGI ───────────────────────────────────────────────────────────────────────
async function loadTodayTransactions() {
    try {
        const accountId = getEffectiveAccountId();
        const url = new URL(`http://${API_HOST}:8000/api.php`);
        url.searchParams.set("path", "today_transactions");
        if (accountId) url.searchParams.set("accountId", accountId);

        const res = await fetch(url.toString());
        const transactions = await res.json();
        console.log(transactions);

        if (!Array.isArray(transactions)) {
            console.error("Errore: transactions non è un array!", transactions);
            return;
        }

        const container = document.getElementById("today-container");
        container.innerHTML = "";

        if (transactions.length === 0) {
            const msg = document.createElement("div");
            msg.className = "no-transactions";
            msg.textContent = "No transaction has been done for today";
            container.appendChild(msg);
            return;
        }

        // Mostra dalla più recente alla meno recente
        transactions.reverse().forEach((t, i) => {
            const box = document.createElement("div");
            box.className = "box-category";

            const iconDiv = document.createElement("div");
            iconDiv.className = "icon";
            if (t.path) {
                iconDiv.style.backgroundImage = `url('${t.path}')`;
                iconDiv.style.backgroundSize = "cover";
                iconDiv.style.backgroundPosition = "center";
            }

            const nameDiv = document.createElement("div");
            nameDiv.className = "transaction-name";
            const who = getPersonByIndex(i);
            nameDiv.textContent = `${t.nome ?? "Senza nome"} • by ${who}`;

            const amountDiv = document.createElement("div");
            amountDiv.className = "amount";
            if (t.tipo === "income") {
                amountDiv.textContent = "+" + t.importo + " €";
                amountDiv.style.color = "white";
                amountDiv.style.backgroundColor= "green";
            } else {
                amountDiv.textContent = "-" + t.importo + " €";
                amountDiv.style.color = "white";
                amountDiv.style.backgroundColor= "#ff0000ff";
            }

            box.appendChild(iconDiv);
            box.appendChild(nameDiv);
            box.appendChild(amountDiv);
            container.appendChild(box);
        });
    } catch (err) {
        console.error("Errore durante il caricamento transazioni odierne:", err);
    }
}

// ── SETTIMANA SCORSA ──────────────────────────────────────────────────────────
async function loadLastWeekTransactions() {
    try {
        const accountId = getEffectiveAccountId();
        const url = new URL(`http://${API_HOST}:8000/api.php`);
        url.searchParams.set("path", "last_week_transactions");
        if (accountId) url.searchParams.set("accountId", accountId);

        const res = await fetch(url.toString());
        const transactions = await res.json();

        if (!Array.isArray(transactions)) {
            console.error("Errore: transactions non è un array!", transactions);
            return;
        }

        const container = document.getElementById("lastweek-container");
        container.innerHTML = "";

        if (transactions.length === 0) {
            const msg = document.createElement("div");
            msg.className = "no-transactions";
            msg.textContent = "No transaction for the last week";
            msg.style.textAlign = "center";
            msg.style.color = "gray";
            msg.style.padding = "10px";
            container.appendChild(msg);
            return;
        }

        transactions.forEach((t, i) => {
            const box = document.createElement("div");
            box.className = "box-category";

            const iconDiv = document.createElement("div");
            iconDiv.className = "icon";
            if (t.path) {
                iconDiv.style.backgroundImage = `url('${t.path}')`;
                iconDiv.style.backgroundSize = "cover";
                iconDiv.style.backgroundPosition = "center";
            }

            const nameDiv = document.createElement("div");
            nameDiv.className = "transaction-name";

            const nameLine = document.createElement("div");
            nameLine.textContent = t.nome ?? "Senza nome";

            const personLine = document.createElement("div");
            personLine.className = "transaction-person";
            personLine.textContent = "by " + getPersonByIndex(i);

            nameDiv.appendChild(nameLine);
            nameDiv.appendChild(personLine);

            const amountDiv = document.createElement("div");
            amountDiv.className = "amount";
            if (t.tipo === "income") {
                amountDiv.textContent = "+" + t.importo + " €";
                amountDiv.style.color = "white";
                amountDiv.style.backgroundColor= "green";
            } else {
                amountDiv.textContent = "-" + t.importo + " €";
                amountDiv.style.color = "white";
                amountDiv.style.backgroundColor= "#ff0000ff";
            }

            box.appendChild(iconDiv);
            box.appendChild(nameDiv);
            box.appendChild(amountDiv);

            // prepend per avere la più recente in alto, come facevi già
            container.prepend(box);
        });
    } catch (err) {
        console.error("Errore durante il caricamento transazioni settimana scorsa:", err);
    }
}

function loadName() {
    const qs = new URLSearchParams(window.location.search);
    const name = qs.get("name") || "Account";

    const nameDiv = document.getElementById("account-name");
    if (nameDiv) {
        nameDiv.textContent = name;
    }
}


function getAccountIdFromURL() {
    const qs = new URLSearchParams(window.location.search);
    const id = qs.get("id");
    console.log(id);
    return id && id !== "all" ? id : null;
}


function getEffectiveAccountId() {

    return window.currentAccountId ?? getAccountIdFromURL();
}

async function setCurrentAccount(id) {
    window.currentAccountId = id ? String(id) : null;

    // (opzionale) aggiorna la UI delle card se usi .account-item
    document.querySelectorAll(".account-item").forEach(el => {
        const sel = String(el.dataset.id) === String(id);
        el.classList.toggle("selected", sel);
        el.setAttribute("aria-selected", sel ? "true" : "false");
    });

    // ricarica i dati con il nuovo account
    await Promise.allSettled([
        loadIncome(),
        loadSpent(),
        loadBalance(),
        loadTodayTransactions(),
        loadLastWeekTransactions()
    ]);

    // se in pagina hai anche i grafici con i bottoni periodo:
    if (typeof showChart === "function") {
        const activePeriod = document.querySelector(".chart-buttons button.active")?.id.replace("btn-", "") || "week";
        await showChart(activePeriod);
    }
}
function upsertParticipantsLine(value) {
    const line = document.getElementById("participants-line");
    if (!line) return;

    if (value == null || value === "") {
        line.textContent = "";
        line.style.display = "none";
    } else {
        line.textContent = `Participants: ${value}`;
        line.style.display = "";
    }
}
