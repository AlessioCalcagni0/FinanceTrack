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
            const res = await fetch(`http://${API_HOST}:8000/api.php?path=add_account`, {
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

    const frame = document.getElementById("frame-account");
    const arrow = document.querySelector("#direction-arrow i");

    frame.addEventListener("scroll", () => {
        const isAtBottom =
            frame.scrollTop + frame.clientHeight >= frame.scrollHeight - 1;

        if (isAtBottom) {
            arrow.classList.remove("fa-angle-down");
            arrow.classList.add("fa-angle-up");
        } else {
            arrow.classList.remove("fa-angle-up");
            arrow.classList.add("fa-angle-down");
        }
    });

    // opzionale: scroll cliccando sulla freccia
    arrow.parentElement.addEventListener("click", () => {
        const isAtBottom =
            frame.scrollTop + frame.clientHeight >= frame.scrollHeight - 1;

        if (isAtBottom) {
            frame.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            frame.scrollTo({ top: frame.scrollHeight, behavior: "smooth" });
        }
    });



    const deleteOverlay = document.getElementById("deleteOverlay");
    const deleteConfirmPopup = document.getElementById("deleteConfirmPopup");
    const deletePopupTitle = document.getElementById("deletePopupTitle");
    const deletePopupButtons = document.getElementById("deletePopupButtons");

    const deleteBtn = document.getElementById("delete-account-btn");
    const modifyPopup = document.getElementById("modifyAccountPopup");

    let selectedAccountId = null;
    let selectedAccountName = null;

    // Funzione per aprire Delete Popup
    function openDeletePopup(account) {
        selectedAccountId = account.id;
        selectedAccountName = account.name;

        deletePopupTitle.textContent = `Are you sure you want to delete "${account.name}"?`;

        // Svuota e crea bottoni dinamicamente
        deletePopupButtons.innerHTML = "";

        const cancelBtn = document.createElement("button");
        cancelBtn.id = "deleteCancelBtn";
        cancelBtn.textContent = "Cancel";
        cancelBtn.addEventListener("click", closeDeletePopup);

        const confirmBtn = document.createElement("button");
        confirmBtn.id = "deleteConfirmBtn";
        confirmBtn.className = "danger";
        confirmBtn.textContent = "Delete";
        confirmBtn.addEventListener("click", confirmDelete);

        deletePopupButtons.appendChild(cancelBtn);
        deletePopupButtons.appendChild(confirmBtn);

        deleteOverlay.classList.add("overlayactive");
        deleteConfirmPopup.style.display = "block";
    }

    // Funzione per chiudere popup
    function closeDeletePopup() {
        deleteOverlay.classList.remove("overlayactive");
        deleteConfirmPopup.style.display = "none";
    }

   function confirmDelete() {
    if (!selectedAccountId) return;

    fetch(`http://${API_HOST}:8000/api.php?path=delete_account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedAccountId })
    })
    .then(res => res.json())
    .then(result => {
        if (!result.success) throw new Error(result.error || "Errore eliminazione");

        // Aggiorna contenuto popup con OK
        deletePopupTitle.textContent = `Account "${selectedAccountName}" deleted successfully.`;
        deletePopupButtons.innerHTML = "";
        const okBtn = document.createElement("button");
        okBtn.className = "success";
        okBtn.id ="deleteOkBtn"
        okBtn.textContent = "OK";
        deletePopupButtons.appendChild(okBtn);

        // Listener OK chiude tutti i popup
        okBtn.addEventListener("click", () => {
            deleteConfirmPopup.style.display = "none";
            modifyPopup.style.display = "none";
            deleteOverlay.classList.remove("overlayactive");
            document.getElementById("overlay").classList.remove("overlayactive");
            loadAccounts();
        });
    })
    .catch(err => {
        console.error(err);
        deletePopupTitle.textContent = "Errore durante l'eliminazione dell'account.";
    });
}

    // Listener sul pulsante Delete nel Modify popup
    deleteBtn.addEventListener("click", () => {
        const account = {
            id: document.getElementById("modifyAccountId").value,
            name: document.getElementById("modifyAccountName").value
        };
        openDeletePopup(account);
    });

    // Chiudi cliccando overlay
    deleteOverlay.addEventListener("click", closeDeletePopup);


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
        const resSum = await fetch(`http://${API_HOST}:8000/api.php?path=income_sum`);
        const sumData = await resSum.json();
        document.getElementById("income-sum").textContent = (sumData.totale ?? 0) + "€";
    } catch (err) {
        document.getElementById("income-sum").textContent = "Errore caricamento entrate!";
        console.error(err);
    }
}

async function loadSpent() {
    try {
        const resSum = await fetch(`http://${API_HOST}:8000/api.php?path=spent_sum`);
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
            fetch(`http://${API_HOST}:8000/api.php?path=income_sum`),
            fetch(`http://${API_HOST}:8000/api.php?path=spent_sum`)
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
        const res = await fetch(`http://${API_HOST}:8000/api.php?path=accounts`);
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

            const viewBtn = document.createElement("button");
            viewBtn.className = "account-view-btn";
            viewBtn.textContent = "View";

            const btnContainer = document.createElement("div");
            btnContainer.className = "account-btns";

            btnContainer.appendChild(modifyBtn);
            btnContainer.appendChild(viewBtn);

            nameIcon.appendChild(nameDiv);
            nameIcon.appendChild(iconDiv);
            info.appendChild(typeDiv);
            info.appendChild(balanceDiv);
            info.appendChild(lastSyncDiv);

            box.appendChild(nameIcon);
            box.appendChild(info);
            box.appendChild(btnContainer);
        
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

    // Popola i campi
    nameInput.value = account.name || "";
    typeInput.value = account.type || "";
    idInput.value = account.id || "";

    // Gestione icone selezionate
    icons.forEach(icon => {
        icon.classList.remove("icon-selected");
        if (icon.dataset.img === account.path) icon.classList.add("icon-selected");

        icon.onclick = () => {
            icons.forEach(i => i.classList.remove("icon-selected"));
            icon.classList.add("icon-selected");
        };
    });

    // Mostra popup e overlay
    popup.classList.add("addaccount-popupactive");
    overlay.classList.add("overlayactive");

    // CANCEL
    document.getElementById("modifyCancelBtn").onclick = () => {
        popup.classList.remove("addaccount-popupactive");
        overlay.classList.remove("overlayactive");
    };

    // CONFIRM
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
            const res = await fetch(`http://${API_HOST}:8000/api.php?path=update_account`, {
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

function showPopup(message, type = "success") {
    const popup = document.getElementById("successPopup");
    const popupText = document.getElementById("successText");
    const overlay = document.getElementById("overlay");

    popupText.textContent = message;
    popup.style.display = "flex";

    // Assicurati overlay attivo
    overlay.classList.add("overlayactive");

    // OK button
    const okBtn = document.getElementById("successOkBtn");
    okBtn.replaceWith(okBtn.cloneNode(true));
    const newOkBtn = document.getElementById("successOkBtn");

    newOkBtn.onclick = () => {
        popup.style.display = "none";
        overlay.classList.remove("overlayactive");
    };

    // Overlay cliccabile per chiudere popup
    overlay.onclick = () => {
        popup.style.display = "none";
        overlay.classList.remove("overlayactive");
    };
}