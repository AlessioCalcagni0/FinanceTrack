
function readSharedTransactionsFromSession() {
    try {
        const raw = sessionStorage.getItem('shared_transactions');
        if (!raw) return [];
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
}

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


function applySessionDeltaToBalances() {
    const { totalDelta, myDelta } = computeSessionDeltasForToday();

    // Total Balance
    const totEl = document.getElementById("tot-balance");
    if (totEl) {
        const base = totEl.dataset.baseValue != null
            ? parseFloat(totEl.dataset.baseValue)
            : parseEuro(totEl.textContent);
        totEl.dataset.baseValue = String(base);
        totEl.textContent = formatEuro(base + totalDelta);
    }

    // Personal Balance (se presente)
    const personalEl = document.getElementById("personal-balance") || document.getElementById("my-balance");
    if (personalEl) {
        const baseP = personalEl.dataset.baseValue != null
            ? parseFloat(personalEl.dataset.baseValue)
            : parseEuro(personalEl.textContent);
        personalEl.dataset.baseValue = String(baseP);
        personalEl.textContent = formatEuro(baseP + myDelta);
    }
}

function applySessionDeltaToIncomeAndSpent() {
    const { spentDelta, incomeDelta } = computeSessionDeltasForToday();

    // Income
    const incEl = document.getElementById("income-sum");
    if (incEl) {
        const base = incEl.dataset.baseValue != null
            ? parseFloat(incEl.dataset.baseValue)
            : parseEuro(incEl.textContent);
        incEl.dataset.baseValue = String(base);
        incEl.textContent = formatEuro(base + incomeDelta);
    }

    // Spent
    const spEl = document.getElementById("spent-sum");
    if (spEl) {
        const base = spEl.dataset.baseValue != null
            ? parseFloat(spEl.dataset.baseValue)
            : parseEuro(spEl.textContent);
        spEl.dataset.baseValue = String(base);
        spEl.textContent = formatEuro(base + spentDelta);
    }
}

/** comodo quando devi ricalcolare tutto dopo i fetch */
function applyAllSessionDeltas() {
    applySessionDeltaToBalances();
    applySessionDeltaToIncomeAndSpent();
}

// Confronta se due date (ISO o Date) sono lo stesso giorno
function isSameDay(a, b = new Date()) {
    const da = new Date(a);
    const db = new Date(b);
    return (
        da.getFullYear() === db.getFullYear() &&
        da.getMonth() === db.getMonth() &&
        da.getDate() === db.getDate()
    );
}

// Crea e aggiunge una “card” transazione al container (stile Today)
function appendTransactionBox(container, { name, who, amount, tipo = 'expense', path = null }) {
    const box = document.createElement("div");
    box.className = "box-category";

    const iconDiv = document.createElement("div");
    iconDiv.className = "icon";
    if (path) {
        iconDiv.style.backgroundImage = `url('${path}')`;
        iconDiv.style.backgroundSize = "cover";
        iconDiv.style.backgroundPosition = "center";
    }

    const nameDiv = document.createElement("div");
    nameDiv.className = "transaction-name";
    // Mostro nome transazione e chi ha pagato (by …)
    nameDiv.textContent = `${name ?? "Senza nome"} • by ${who}`;

    const amountDiv = document.createElement("div");
    amountDiv.className = "amount";

    const amountNum = Number(amount) || 0;
    if (tipo === "income") {
        amountDiv.textContent =
            "+" + amountNum.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
        amountDiv.style.color = "white";
        amountDiv.style.backgroundColor = "green";
    } else {
        amountDiv.textContent =
            "-" + amountNum.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
        amountDiv.style.color = "white";
        amountDiv.style.backgroundColor = "#ff0000ff";
    }

    box.appendChild(iconDiv);
    box.appendChild(nameDiv);
    box.appendChild(amountDiv);
    container.appendChild(box);
}
function readSharedTransactionsFromSession() {
    try {
        const raw = sessionStorage.getItem('shared_transactions');
        if (!raw) return [];
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
}


function formatEuro(val) {
    return Number(val).toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + "€";
}

function parseEuro(text) {
    if (!text) return 0;
    const normalized = text
        .replace(/[^\d,.\-]/g, '')   // lascia cifre, virgola, punto e segno
        .replace(/\./g, '')          // rimuovi separatore migliaia
        .replace(',', '.');          // usa punto decimale
    const n = parseFloat(normalized);
    return Number.isFinite(n) ? n : 0;
}


function computeSessionDeltasForToday() {
  const sharedToday = readSharedTransactionsFromSession()
    .filter(entry => !entry.createdAt || isSameDay(entry.createdAt));

  // delta per i vari contatori
  let totalDelta  = 0; 
  let myDelta     = 0; 
  let spentDelta  = 0; 
  let incomeDelta = 0; 
  
  for (const entry of sharedToday) {
    const tot = Number(entry.total) || 0;

    // Le shared sono spese: impattano total e spent
    totalDelta -= tot;
    spentDelta += tot;

    // --- Calcolo impatto personale ---
    const payerIsMe = (entry.payer || '').trim().toLowerCase() === 'me';
    const mePart = (entry.split || []).find(
      p => (p.name || '').trim().toLowerCase() === 'me'
    );

    if (mePart) {
      // Caso 1: "Me" è nello split -> impatto = quota personale
      const myShare = Number(mePart.amount) || 0;
      myDelta -= myShare;
    } else if (payerIsMe) {
      // Caso 2: "Me" NON nello split ma è il payer -> impatto = totale
      myDelta -= tot;
    }
    // Caso 3: "Me" non è nello split e non è payer -> nessun impatto personale
  }

  return { totalDelta, myDelta, spentDelta, incomeDelta };
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

});

// 🔻 Aggiungi accountId ai fetch per i totali (opzionale ma consigliato)
async function loadIncome() {
    try {
        const accountId = getEffectiveAccountId();
        const url = new URL(`http://${API_HOST}:8000/api.php`);
        url.searchParams.set("path", "income_sum");
        if (accountId) url.searchParams.set("accountId", accountId);

        const resSum = await fetch(url.toString());
        const sumData = await resSum.json();

        const el = document.getElementById("income-sum");
        const base = Number(sumData.totale ?? 0);
        if (el) {
            el.dataset.baseValue = String(base);
            el.textContent = formatEuro(base);
        }

        // applica i delta da sessionStorage
        applySessionDeltaToIncomeAndSpent();
    } catch (err) {
        const el = document.getElementById("income-sum");
        if (el) el.textContent = "Errore caricamento entrate!";
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

        const el = document.getElementById("spent-sum");
        const base = Number(sumData.totale ?? 0);
        if (el) {
            el.dataset.baseValue = String(base);
            el.textContent = formatEuro(base);
        }

        // applica i delta da sessionStorage
        applySessionDeltaToIncomeAndSpent();
    } catch (err) {
        const el = document.getElementById("spent-sum");
        if (el) el.textContent = "Errore caricamento uscite!";
        console.error(err);
    }
}

async function loadBalance() {
    try {
        const qs = new URLSearchParams(window.location.search);
        const pBalance = qs.get("balance");       // es: "123.45" oppure null
        const pParts = qs.get("participants");  // es: "3"     oppure null
        const tot = document.getElementById("tot-balance");

        // Se ho parametri in query → usali
        if (pBalance !== null || pParts !== null) {
            // Normalizza balance da query (se assente/NaN => 0)
            const nRaw = Number(pBalance);
            const n = Number.isFinite(nRaw) ? nRaw : 0;

            if (tot) {
                const n = Number.isFinite(Number(pBalance)) ? Number(pBalance) : 0;
                tot.dataset.baseValue = String(n);
                tot.textContent = formatEuro(n);
                applyAllSessionDeltas();
            }

            // ► riga “Participants” (anche se pParts è null la nascondo)
            upsertParticipantsLine(pParts ?? "");

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
            const base = balance;
            tot.dataset.baseValue = String(base);
            tot.textContent = formatEuro(base);
            applyAllSessionDeltas();
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
const PEOPLE = ["Mario Bianchi", "Sara Bianchi"];
const getPersonByIndex = (i) => PEOPLE[i % PEOPLE.length];

// ── OGGI ───────────────────────────────────────────────────────────────────────
// ── TODAY / LASTWEEK ──────────────────────────────────────────────────────────
async function loadTodayTransactions() {
    try {
        const accountId = getEffectiveAccountId();
        const url = new URL(`http://${API_HOST}:8000/api.php`);
        url.searchParams.set("path", "today_transactions");
        if (accountId) url.searchParams.set("accountId", accountId);

        const res = await fetch(url.toString());
        const apiTransactions = await res.json();

        // Containers
        const todayContainer = document.getElementById("today-container");
        const lastweekContainer = document.getElementById("lastweek-container");

        if (todayContainer) todayContainer.innerHTML = "";
        if (lastweekContainer) lastweekContainer.innerHTML = "";

        // 1) Dati da backend → mettiamo in LASTWEEK
        if (Array.isArray(apiTransactions) && apiTransactions.length > 0) {
            apiTransactions.reverse().forEach((t, i) => {
                const who = getPersonByIndex(i); // PEOPLE fallback
                appendTransactionBox(lastweekContainer, {
                    name: t.nome ?? "Senza nome",
                    who,
                    amount: t.importo,
                    tipo: t.tipo === "income" ? "income" : "expense",
                    path: t.path || null
                });
            });
        } else if (lastweekContainer) {
            const msg = document.createElement("div");
            msg.className = "no-transactions";
            msg.textContent = "No transaction found in the last week";
            lastweekContainer.appendChild(msg);
        }

        // 2) Transazioni da sessionStorage → mettiamo in TODAY
        const shared = readSharedTransactionsFromSession()
            .filter(entry => !entry.createdAt || isSameDay(entry.createdAt))
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            let changes= sessionStorage.getItem("changes");
            if(changes){
                    appendTransactionBox(todayContainer, {
                        name: "Vacation",
                        who: "Me",
                        amount: 30,
                        tipo: "expense",
                        path: "/images/Travel.png"
                    });
             
                    document.getElementById("personal").textContent='190';
                   
                     applyAllSessionDeltas() ;
            }
                    


        // 3) aggiorna i saldi in base al sessionStorag
    } catch (err) {
        console.error("Errore durante il caricamento transazioni:", err);
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
        loadBalance()
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
