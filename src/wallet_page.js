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

        const fullDate = `${weekday} ${day}/${month}/${year}`;
        document.getElementById("today-date").textContent = fullDate;
    }

    const popup = document.getElementById("addAccountPopup");
    const overlay = document.getElementById("overlay");
    const openButton = document.getElementById("openAddAccount");
    const cancelButton = document.getElementById("cancel_button");
    const confirmButton = document.getElementById("confirm_button");
    const icons = document.querySelectorAll(".choose-icon .icon");

    // APRI POPUP
    openButton.addEventListener("click", () => {
        popup.classList.add("addaccount-popupactive");
        overlay.classList.add("overlayactive");
    });

    // CHIUDI POPUP con Cancel
    cancelButton.addEventListener("click", () => {
        popup.classList.remove("addaccount-popupactive");
        overlay.classList.remove("overlayactive");
        resetAddAccountForm();
    });

    // CHIUDI POPUP cliccando overlay
    overlay.addEventListener("click", () => {
        popup.classList.remove("addaccount-popupactive");
        overlay.classList.remove("overlayactive");
    });

    // Gestione icone selezionabili
    icons.forEach(icon => {
        icon.addEventListener("click", () => {
            icons.forEach(i => i.classList.remove("icon-selected"));
            icon.classList.add("icon-selected");
        });
    });

    // Calcolo balance in tempo reale
    const incomeInput = document.getElementById("accountIncome");
    const spentInput = document.getElementById("accountSpent");
    const balanceBox = document.getElementById("accountBalance");

    function updateBalance() {
        const income = parseFloat(incomeInput.value) || 0;
        const spent = parseFloat(spentInput.value) || 0;
        balanceBox.textContent = (income - spent) + " €";
    }

    incomeInput.addEventListener("input", updateBalance);
    spentInput.addEventListener("input", updateBalance);

    // Conferma → salva dati
    confirmButton.addEventListener("click", async () => {
        const selectedIcon = document.querySelector(".choose-icon .icon.icon-selected");
        const name = document.getElementById("accountName").value.trim();
        const type = document.getElementById("accountType").value.trim();
        const income = parseFloat(incomeInput.value) || 0;
        const spent = parseFloat(spentInput.value) || 0;
        const balance = income - spent;

        if (!selectedIcon || !name || !type) {
            showPopup("Compila tutti i campi e seleziona un'icona!", "error");
            return;
        }

        const accountData = {
            name: name,
            type: type,
            path: selectedIcon.dataset.img,
            income: income,
            spent: spent,
            balance: balance
        };

        try {
            const res = await fetch("http://192.168.1.12:8000/api.php?path=add_account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(accountData)
            });

            const result = await res.json();

            if (res.ok && result.success) {
                popup.classList.remove("addaccount-popupactive");
                overlay.classList.remove("overlayactive");
                resetAddAccountForm();
                loadAccounts();
                showPopup("Account creato con successo!", "success");
            } else {
                showPopup("Errore salvataggio account: " + (result.error || res.status), "error");
            }
        } catch (err) {
            console.error("Errore fetch add_account:", err);
            showPopup("Errore di connessione con il server!", "error");
        }
    });

    // aggiorna subito al caricamento
    UpdateDate();
    setInterval(UpdateDate, 60000); // aggiorna ogni minuto
    loadIncome();
    loadSpent();
    loadBalance();
    loadAccounts();
});

// --- FUNZIONI CARICAMENTO DATI ---
async function loadIncome() {
    try {
        const resSum = await fetch("http://192.168.1.12:8000/api.php?path=income_sum");
        const sumData = await resSum.json();
        document.getElementById("income-sum").textContent = (sumData.totale ?? 0) + "€";
    } catch (err) {
        document.getElementById("income-sum").textContent = "Errore caricamento entrate!";
        console.error(err);
    }
}

async function loadSpent() {
    try {
        const resSum = await fetch("http://192.168.1.12:8000/api.php?path=spent_sum");
        const sumData = await resSum.json();
        document.getElementById("spent-sum").textContent = (sumData.totale ?? 0) + "€";
    } catch (err) {
        document.getElementById("spent-sum").textContent = "Errore caricamento entrate!";
        console.error(err);
    }
}

async function loadBalance() {
    try {
        const [resIncome, resSpent] = await Promise.all([
            fetch("http://192.168.1.12:8000/api.php?path=income_sum"),
            fetch("http://192.168.1.12:8000/api.php?path=spent_sum")
        ]);

        const incomeData = await resIncome.json();
        const spentData = await resSpent.json();

        const balance = Number(incomeData.totale ?? 0) - Number(spentData.totale ?? 0);
        const tot = document.getElementById("tot-balance");
        if (tot) tot.textContent = balance + "€";
    } catch (err) {
        const el = document.getElementById("tot-balance");
        if (el) el.textContent = "Errore calcolo saldo!";
        console.error(err);
    }
}

// --- CARICAMENTO ACCOUNTS ---
async function loadAccounts() {
    try {
        const res = await fetch("http://192.168.1.12:8000/api.php?path=accounts");
        const accounts = await res.json();
        const frame = document.getElementById("frame-account");
        frame.innerHTML = "";

        accounts.forEach(acc => {
            if (!acc.name) return;

            const box = document.createElement("div");
            box.className = "account-box";

            const iconDiv = document.createElement("div");
            iconDiv.className = `icon ${acc.type.toLowerCase()}`;
            if (acc.path) {
                iconDiv.style.backgroundImage = `url('${acc.path}')`;
                iconDiv.style.backgroundSize = "cover";
                iconDiv.style.backgroundPosition = "center";
            }

            const info = document.createElement("div");
            info.className = "info";

            const nameIcon = document.createElement("div");
            nameIcon.className = "name-Icon";

            const nameDiv = document.createElement("div");
            nameDiv.className = "account-name";
            nameDiv.textContent = acc.name;

            const typeDiv = document.createElement("div");
            typeDiv.className = "account-type";
            typeDiv.textContent = acc.type;

            const balanceDiv = document.createElement("div");
            balanceDiv.className = "account-balance";
            balanceDiv.textContent = acc.balance + " €";

            const lastSyncDiv = document.createElement("div");
            lastSyncDiv.className = "account-lastsync";
            lastSyncDiv.textContent = 'Last sync: ' + acc.last_sync;

            const modifyBtn = document.createElement("button");
            modifyBtn.className = "account-modify-btn";
            modifyBtn.textContent = "Modify";
            modifyBtn.addEventListener("click", () => openModifyPopup(acc));

            nameIcon.appendChild(nameDiv);
            nameIcon.appendChild(iconDiv);
            info.appendChild(typeDiv);
            info.appendChild(balanceDiv);
            info.appendChild(lastSyncDiv);

            box.appendChild(nameIcon);
            box.appendChild(info);
            box.appendChild(modifyBtn);
            frame.appendChild(box);
        });
    } catch (err) {
        console.error("Errore durante il caricamento accounts:", err);
    }
}

// --- MODIFY POPUP ---
function openModifyPopup(account) {
    const popup = document.getElementById("modifyAccountPopup");
    const overlay = document.getElementById("overlay");

    const nameInput = document.getElementById("modifyAccountName");
    const typeInput = document.getElementById("modifyAccountType");
    const idInput = document.getElementById("modifyAccountId");
    const icons = document.querySelectorAll("#modifyAccountPopup .choose-icon .icon");

    nameInput.value = account.name || "";
    typeInput.value = account.type || "";
    idInput.value = account.id || "";

    icons.forEach(icon => {
        icon.classList.remove("icon-selected");
        if (icon.dataset.img === account.path) icon.classList.add("icon-selected");

        icon.onclick = () => {
            icons.forEach(i => i.classList.remove("icon-selected"));
            icon.classList.add("icon-selected");
        };
    });

    popup.classList.add("addaccount-popupactive");
    overlay.classList.add("overlayactive");

    document.getElementById("modifyCancelBtn").onclick = () => {
        popup.classList.remove("addaccount-popupactive");
        overlay.classList.remove("overlayactive");
    };

    document.getElementById("modifyConfirmBtn").onclick = async () => {
        const selectedIcon = document.querySelector("#modifyAccountPopup .icon.icon-selected");
        if (!selectedIcon) {
            showPopup("Seleziona un'icona!", "error");
            return;
        }

        const newData = {
            id: idInput.value,
            name: nameInput.value.trim(),
            type: typeInput.value.trim(),
            path: selectedIcon.dataset.img
        };

        if (!newData.name || !newData.type) {
            showPopup("Nome e tipo non possono essere vuoti!", "error");
            return;
        }

        try {
            const res = await fetch("http://192.168.1.12:8000/api.php?path=update_account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newData)
            });

            const result = await res.json();

            if (res.ok && result.success) {
                popup.classList.remove("addaccount-popupactive");
                overlay.classList.remove("overlayactive");

                nameInput.value = "";
                typeInput.value = "";
                icons.forEach(i => i.classList.remove("icon-selected"));

                showPopup("Account modificato con successo!", "success");
                loadAccounts();
            } else {
                showPopup("Errore aggiornamento: " + (result.error || res.status), "error");
            }
        } catch (err) {
            console.error("Errore fetch update_account:", err);
            showPopup("Errore di connessione con il server!", "error");
        }
    };
}

// --- RESET FORM ADD ACCOUNT ---
function resetAddAccountForm() {
    document.getElementById("accountName").value = "";
    document.getElementById("accountType").value = "";
    document.getElementById("accountIncome").value = "";
    document.getElementById("accountSpent").value = "";
    document.getElementById("accountBalance").textContent = "0 €";

    const icons = document.querySelectorAll(".choose-icon .icon");
    icons.forEach(icon => icon.classList.remove("icon-selected"));
}

// --- SHOW POPUP ---
function showPopup(message, type = "success") {
    const successPopup = document.getElementById("successPopup");
    const successText = document.getElementById("successText");
    const overlay = document.getElementById("overlay");

    successText.textContent = message;
    successPopup.style.display = "flex";

    if (type === "success") overlay.classList.add("overlayactive");

    const okBtn = document.getElementById("successOkBtn");
    okBtn.replaceWith(okBtn.cloneNode(true));
    const newOkBtn = document.getElementById("successOkBtn");

    newOkBtn.onclick = () => {
        successPopup.style.display = "none";
        if (type === "success") overlay.classList.remove("overlayactive");
    };

    if (type === "success") {
        overlay.onclick = () => {
            successPopup.style.display = "none";
            overlay.classList.remove("overlayactive");
        };
    } else {
        overlay.onclick = null;
    }
}
