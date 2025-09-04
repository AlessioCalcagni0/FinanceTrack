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
    function UpdateDate() {
        const oggi = new Date();

        // Giorno della settimana (es: Mon, Tue, Wed...)
        const options = { weekday: 'short' };
        const weekday = oggi.toLocaleDateString("en-US", options);

        // Data numerica (es: 28/08/2025)
        const day = String(oggi.getDate()).padStart(2, "0");
        const month = String(oggi.getMonth() + 1).padStart(2, "0");
        const year = oggi.getFullYear();

        // Componi stringa finale
        const fullDate = `${weekday} ${day}/${month}/${year}`;

        document.getElementById("today-date").textContent = fullDate;
    }

    // aggiorna subito al caricamento
    UpdateDate;

    // opzionale: aggiorna ogni minuto
    setInterval(UpdateDate, 1);
    loadIncome();
    loadSpent();
    loadBalance();
    loadTodayTransactions();
    loadLastWeekTransactions();

    const btn = document.getElementById('syncBtn');
    const loader = document.getElementById('loader');
    const notification = document.getElementById('notification');

    btn.addEventListener('click', () => {
        // Mostra loader e disabilita bottone
        loader.style.display = 'block';
        btn.disabled = true;
        btn.style.opacity = 0.7;

        // Simula caricamento di 2 secondi
        setTimeout(() => {
            loader.style.display = 'none';
            btn.disabled = false;
            btn.style.opacity = 1;

             // Aggiorna le transazioni odierne dopo la sincronizzazione
            loadTodayTransactions();

            // Mostra notifica
            notification.style.display = 'block';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 2000); // sparisce dopo 2 secondi
        }, 2000);
    });
});

async function loadIncome() {
    try {
        // Somma
        const resSum = await fetch("http://192.168.1.12:8000/api.php?path=income_sum");
        const sumData = await resSum.json();
        console.log(sumData);
        document.getElementById("income-sum").textContent =
            (sumData.totale ?? 0) + "€";

    } catch (err) {
        document.getElementById("income-sum").textContent = "Errore caricamento entrate!";
        console.error(err);
    }
}

async function loadSpent() {
    try {
        // Somma
        const resSum = await fetch("http://192.168.1.12:8000/api.php?path=spent_sum");
        const sumData = await resSum.json();
        console.log(sumData);
        document.getElementById("spent-sum").textContent =
            (sumData.totale ?? 0) + "€";

    } catch (err) {
        document.getElementById("spent-sum").textContent = "Errore caricamento entrate!";
        console.error(err);
    }
}

async function loadBalance() {
    try {
        // Chiamate parallele
        const [resIncome, resSpent] = await Promise.all([
            fetch("http://192.168.1.12:8000/api.php?path=income_sum"),
            fetch("http://192.168.1.12:8000/api.php?path=spent_sum")
        ]);

        const incomeData = await resIncome.json();
        const spentData = await resSpent.json();

        const income = Number(incomeData.totale ?? 0);
        const spent = Number(spentData.totale ?? 0);

        const balance = income - spent;

        // Mostra nel frontend
        const tot = document.getElementById("tot-balance");
        if (tot) {
            tot.textContent = balance + "€";

        }

    } catch (err) {
        const el = document.getElementById("tot-balance");
        if (el) el.textContent = "Errore calcolo saldo!";
        console.error(err);
    }
}

async function loadTodayTransactions() {
    try {
        console.log("Inizio caricamento transazioni odierne...");

        const res = await fetch("http://192.168.1.12:8000/api.php?path=today_transactions");
        console.log("Fetch completato, status:", res.status);

        const transactions = await res.json();
        console.log("Dati ricevuti dal backend:", transactions);

        if (!Array.isArray(transactions)) {
            console.error("Errore: transactions non è un array!", transactions);
            return;
        }

        const container = document.getElementById("today-container");
        container.innerHTML = "";

        // 🔹 Se non ci sono transazioni → messaggio
        if (transactions.length === 0) {
            const msg = document.createElement("div");
            msg.className = "no-transactions";
            msg.textContent = "No transaction has been done for today";
            container.appendChild(msg);
            return;
        }

        // 🔹 Invertiamo ordine (ultimo inserito per primo)
        transactions.reverse().forEach((t) => {
            const box = document.createElement("div");
            box.className = "box-category";

            // Icona
            const iconDiv = document.createElement("div");
            iconDiv.className = "icon";
            if (t.path) {
                iconDiv.style.backgroundImage = `url('${t.path}')`;
                iconDiv.style.backgroundSize = "cover";
                iconDiv.style.backgroundPosition = "center";
            }

            // Nome
            const nameDiv = document.createElement("div");
            nameDiv.className = "transaction-name";
            nameDiv.textContent = t.nome ?? "Senza nome";

            // Importo
            const amountDiv = document.createElement("div");
            amountDiv.className = "amount";
            if (t.tipo === "income") {
                amountDiv.textContent = "+" + t.importo + " €";
                amountDiv.style.color = "#08fc00";
            } else {
                amountDiv.textContent = "-" + t.importo + " €";
                amountDiv.style.color = "#ff0000ff";
            }

            // Append ordine: icona → nome → importo
            box.appendChild(iconDiv);
            box.appendChild(nameDiv);
            box.appendChild(amountDiv);

            container.appendChild(box);
        });

        console.log("Caricamento transazioni odierne completato!");
    } catch (err) {
        console.error("Errore durante il caricamento transazioni odierne:", err);
    }
}


async function loadLastWeekTransactions() {
    try {
        console.log("Inizio caricamento transazioni settimana scorsa...");

        const res = await fetch("http://192.168.1.12:8000/api.php?path=last_week_transactions");
        console.log("Fetch completato, status:", res.status);

        const transactions = await res.json();
        console.log("Dati ricevuti dal backend:", transactions);

        if (!Array.isArray(transactions)) {
            console.error("Errore: transactions non è un array!", transactions);
            return;
        }

        const container = document.getElementById("lastweek-container");
        container.innerHTML = "";

        transactions.forEach((t) => {
            const box = document.createElement("div");
            box.className = "box-category";

            // Icona
            const iconDiv = document.createElement("div");
            iconDiv.className = "icon";
            if (t.path) {
                iconDiv.style.backgroundImage = `url('${t.path}')`;
                iconDiv.style.backgroundSize = "cover";
                iconDiv.style.backgroundPosition = "center";
            }

            // Nome
            const nameDiv = document.createElement("div");
            nameDiv.className = "transaction-name";
            nameDiv.textContent = t.nome ?? "Senza nome";

            // Importo
            const amountDiv = document.createElement("div");
            amountDiv.className = "amount";
            if (t.tipo === "income") {
                amountDiv.textContent = "+" + t.importo + " €";
                amountDiv.style.color = "green";
            } else {
                amountDiv.textContent = "-" + t.importo + " €";
                amountDiv.style.color = "red";
            }

            box.appendChild(iconDiv);
            box.appendChild(nameDiv);
            box.appendChild(amountDiv);

            container.prepend(box);
        });

        console.log("Caricamento transazioni settimana scorsa completato!");
    } catch (err) {
        console.error("Errore durante il caricamento transazioni settimana scorsa:", err);
    }
}