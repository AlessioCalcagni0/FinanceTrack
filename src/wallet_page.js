
function openMenu() {
    document.getElementsByClassName("back-arrow")[0].classList.add("show-menu");

    document.getElementById("menu-content").classList.toggle("show-menu");
    const overlay = document.getElementById("overlay-menu");
    overlay.style.opacity = "1";

}

function goTo() {
    const home = document.getElementById("home");
    const wallet = document.getElementById("wallet-icon");
    const goal = document.getElementById("goal-icon");
    const insights = document.getElementById("insights-icon");

    if (home) {
        home.addEventListener('click', () => {
            window.location.href = "../homepage.php";
        });
    }

    if (wallet) {
        wallet.addEventListener('click', () => {
            window.location.href = "../wallet_page.php";
        });
    }

    if (goal) {
        goal.addEventListener('click', () => {
            window.location.href = "../goals.php";
        });
    }

    if (insights) {
        insights.addEventListener('click', () => {
            window.location.href = "../insights.php";
        });
    }
}

window.onclick = function (event) {
    if (!event.target.matches('#menu') && !event.target.matches("menu-content")) {


        document.getElementsByClassName("back-arrow")[0].classList.remove("show-menu");
        const overlay = document.getElementById("overlay-menu");
        overlay.style.opacity = "0";
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

    document.getElementById("menu-content").classList.remove("show-menu");
    document.getElementsByClassName("back-arrow")[0].classList.remove("show-menu");
    const overlay = document.getElementById("overlay-menu");
    overlay.style.opacity = "0";
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
        if (typeof showPopup === 'function') showPopup('Error during image load: ' + e.message, 'error');
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    const profileBtn = document.getElementById("profile");

    const imageUrl = await fetchImage(1);
    if (imageUrl) {
        profileBtn.src = imageUrl;  // <-- set src, no background needed
    }

    profileBtn.addEventListener("click", () => {
        redirect("../account.php");
    });

    goTo();


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
    const openButton = document.getElementById("openAddAccount");
    const cancelButton = document.getElementById("cancel_button");
    const confirmButton = document.getElementById("confirm_button");
    const icons = document.querySelectorAll(".choose-icon .icon");
    const overlay = document.getElementById("overlay");

    // APRI POPUP
    openButton.addEventListener("click", () => {
        popup.classList.add("addaccount-popupactive");
        overlay.style.opacity = "1";
    });

    // CHIUDI POPUP con Cancel
    cancelButton.addEventListener("click", () => {
        popup.classList.remove("addaccount-popupactive");
        overlay.style.opacity = "0";
        resetAddAccountForm();
    });

    // CHIUDI POPUP cliccando overlay
    overlay.addEventListener("click", () => {
        popup.classList.remove("addaccount-popupactive");
        overlay.classList.remove("overlayactive");
    });

    const typeOptions = document.querySelectorAll('.choose-type .type-option');
    typeOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.choose-type .icon')
                .forEach(i => i.classList.remove('icon-selected'));

            const icon = opt.querySelector('.icon');
            icon.classList.add('icon-selected');

            selectedType = opt.dataset.type; // Bank | Card | Cash
            selectedIconPath = icon.dataset.img || null;

            renderTypeFields(selectedType);
        });
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

    confirmButton.addEventListener("click", async () => {
        const name = document.getElementById("accountName").value.trim();
        const income = parseFloat(document.getElementById("accountIncome").value) || 0;
        const spent = parseFloat(document.getElementById("accountSpent").value) || 0;
        const balance = income - spent;

        // validazioni base
        if (!selectedType) {
            showPopup("Select a wallet type (Bank or Card)!", { type: "info", lockOverlay: true });
            return;
        }
        if (!name) {
            showPopup("Choose a name for the wallet!", { type: "info", lockOverlay: true });
            return;
        }

        // validazioni specifiche e details
        const details = {};
        if (selectedType === "Bank") {
            const iban = (document.getElementById("iban")?.value || "").trim();
            if (!iban) {
                showPopup("Insert IBAN", { type: "error", lockOverlay: true });
                return;
            }
            details.iban = iban;

        } else if (selectedType === "Card") {
            const holder = (document.getElementById("cardHolder")?.value || "").trim();
            const number = (document.getElementById("cardNumber")?.value || "").replace(/\s+/g, "");
            const expiry = (document.getElementById("cardExpiry")?.value || "").trim();
            const cvv = (document.getElementById("cardCvv")?.value || "").trim();

            if (!holder || !number || !expiry || !cvv) {
                showPopup("Fill out all the field!", { type: "error", lockOverlay: true });
                return;
            }

            // limiti e formati minimi
            // se vuoi solo Visa/Mastercard, imposta max 16 anziché 19
            if (!/^\d{12,19}$/.test(number)) {
                showPopup("Card number invalid (12–19 cifre).", { type: "error", lockOverlay: true });
                return;
            }
            if (!/^\d{2}\/\d{2}$/.test(expiry)) {
                showPopup("Deadline invalid. Use format: MM/YY.", { type: "error", lockOverlay: true });
                return;
            }
            if (!/^\d{3,4}$/.test(cvv)) {
                showPopup("CVV invalid (3 or 4 digits).", { type: "error", lockOverlay: true });
                return;
            }

            details.card_holder = holder;
            details.card_number = number; // ⚠️ in produzione: tokenizza, non salvare PAN completo
            details.card_expiry = expiry;
            details.card_cvv = cvv;    // ⚠️ non salvare lato server
        }

        const accountData = {
            name,
            type: selectedType,
            path: selectedIconPath,
            income,
            spent,
            balance,
            details
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
                overlay.style.opacity = "0";
                resetAddAccountForm();
                if (typeof loadAccounts === "function") loadAccounts();
                showPopup("Wallet created successfully!", { type: "success", autocloseMs: 1500 });
            } else {
                showPopup("Error during wallet creation: " + (result.error || res.status), { type: "error", lockOverlay: true });
            }
        } catch (err) {
            console.error("Errore fetch add_account:", err);
            showPopup("Error in server connection!", { type: "error", lockOverlay: true });
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
                if (!result.success) throw new Error(result.error || "Error elimination");

                // Aggiorna contenuto popup con OK
                deletePopupTitle.textContent = `Account "${selectedAccountName}" deleted successfully.`;
                deletePopupButtons.innerHTML = "";
                const okBtn = document.createElement("button");
                okBtn.className = "success";
                okBtn.id = "deleteOkBtn"
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
                deletePopupTitle.textContent = "Error when deleting the wallet.";
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
        document.getElementById("income-sum").textContent = "Error in income loading!";
        console.error(err);
    }
}

async function loadSpent() {
    try {
        const resSum = await fetch(`http://${API_HOST}:8000/api.php?path=spent_sum`);
        const sumData = await resSum.json();
        document.getElementById("spent-sum").textContent = (sumData.totale ?? 0) + "€";
    } catch (err) {
        document.getElementById("spent-sum").textContent = "Error in income loading!";
        console.error(err);
    }
}

async function loadBalance() {
    console.log(`${API_HOST}`);
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
            typeDiv.textContent = acc.type + ":    " + acc.balance + " €";

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

            // quando clicco, vado su account.html con name e balance in query string
            viewBtn.addEventListener("click", () => {
                const params = new URLSearchParams({
                    id: acc.id,
                    name: acc.name || "",
                    balance: String(acc.balance ?? "")
                });
                // cambia "account.html" con il path reale della tua pagina di dettaglio
                window.location.href = `/account_page.php?${params.toString()}`;
            });

            const btnContainer = document.createElement("div");
            btnContainer.className = "account-btns";

            btnContainer.appendChild(modifyBtn);
            btnContainer.appendChild(viewBtn);

            nameIcon.appendChild(nameDiv);
            nameIcon.appendChild(iconDiv);
            info.appendChild(typeDiv);
            info.appendChild(lastSyncDiv);

            box.appendChild(nameIcon);
            box.appendChild(info);
            box.appendChild(btnContainer);

            frame.appendChild(box);
        });
    } catch (err) {
        console.error("Error account:", err);
    }
}

// --- MODIFY POPUP ---
function openModifyPopup(account) {
    const popup = document.getElementById("modifyAccountPopup");
    const overlay = document.getElementById("overlay");

    const nameInput = document.getElementById("modifyAccountName");
    const idInput = document.getElementById("modifyAccountId");
    const icons = document.querySelectorAll("#modifyAccountPopup .choose-icon .icon");

    // Popola i campi
    nameInput.value = account.name || "";
    idInput.value = account.id || "";

    // Mostra popup e overlay
    popup.classList.add("addaccount-popupactive");
    overlay.style.opacity = "1";

    // CANCEL
    document.getElementById("modifyCancelBtn").onclick = () => {
        popup.classList.remove("addaccount-popupactive");
        overlay.style.opacity = "0";
    };

    // CONFIRM
    document.getElementById("modifyConfirmBtn").onclick = async () => {


        const newData = {
            id: 1,
            name: nameInput.value.trim(),
        };

        if (!newData.name) {
            showPopup("Name can't be empty!", "error");
            return;
        }

        try {
            const res = await fetch(`http://${API_HOST}:8000/api.php?path=update_account`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newData)
            });

            // Leggo come testo per debug
            const rawText = await res.text();
            console.log("🔍 Raw response text:", rawText);

            let result;
            try {
                result = JSON.parse(rawText);
                console.log("✅ Parsed JSON:", result);
            } catch (parseErr) {
                console.error("❌ JSON parse error:", parseErr);
                throw new Error("Response was not valid JSON");
            }

            if (res.ok && result.success) {
                popup.classList.remove("addaccount-popupactive");
                overlay.classList.remove("overlayactive");

                nameInput.value = "";

                showPopup("Wallet successfully updated!", "success");
                
                loadAccounts();
                
            } else {
                console.warn("⚠️ Server returned error:", result.error || res.status);
                showPopup("Error in the update: " + (result.error || res.status), "error");
            }
        } catch (err) {
            console.error("Errore fetch update_account:", err);
            showPopup("Error during server connection!", "error");
        }
    };
}

function resetAddAccountForm() {
    // campi base
    const nameEl = document.getElementById("accountName");
    const incomeEl = document.getElementById("accountIncome");
    const spentEl = document.getElementById("accountSpent");
    const balanceEl = document.getElementById("accountBalance");
    const typeFields = document.getElementById("typeFields");

    if (nameEl) nameEl.value = "";
    if (incomeEl) incomeEl.value = "";
    if (spentEl) spentEl.value = "";
    if (balanceEl) balanceEl.textContent = "0 €";
    if (typeFields) typeFields.innerHTML = "";

    // compat: se esiste ancora accountType nel DOM lo svuoto, ma non è più usato
    const legacyType = document.getElementById("accountType");
    if (legacyType) legacyType.value = "";

    // deseleziona icone (nuovo e vecchio selettore)
    document.querySelectorAll(".choose-type .icon, .choose-icon .icon")
        .forEach(i => i.classList.remove("icon-selected"));

    // reset stato selezione globale (se definite globalmente)
    try {
        if (typeof selectedType !== "undefined") selectedType = null;
        if (typeof selectedIconPath !== "undefined") selectedIconPath = null;
    } catch (_) { /* no-op */ }
}

function showPopup(message, options = {}) {
    const {
        type = "info",        // "success" | "error" | "info"
        lockOverlay = false,  // <-- se true, NON rimuovo l'overlay su OK
        autocloseMs = null
    } = options;

    const popup = document.getElementById("successPopup");
    const popupText = document.getElementById("successText");
    const overlay = document.getElementById("overlay");
    const okBtn = document.getElementById("successOkBtn");

    if (!popup || !popupText || !overlay || !okBtn) {
        console.warn("Popup elements not found in DOM");
        alert(message);
        return;
    }

    // testo
    popupText.textContent = message;

    // classi di stato
    popup.classList.remove("is-success", "is-error", "is-info");
    popup.classList.add(
        type === "success" ? "is-success" :
        type === "error"   ? "is-error"   : "is-info"
    );

    // mostra popup + overlay
    popup.style.display = "flex";
    overlay.classList.add("overlayactive");
    overlay.style.opacity = "1";

    // rimuovi vecchi listener dall'OK
    const okBtnClone = okBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(okBtnClone, okBtn);
    const newOkBtn = document.getElementById("successOkBtn");

    // click OK
    newOkBtn.onclick = () => {
        // chiudo solo il popup
        popup.style.display = "none";
        if (!lockOverlay) {
            // nei casi normali, chiudo anche l'overlay
            overlay.classList.remove("overlayactive");
            overlay.style.opacity = "0";
        }
        // se lockOverlay === true, lascio overlay attivo
    };

    // disabilito chiusura via overlay-click
    overlay.onclick = (e) => {
        if (e.target.id !== "overlay") return;
        // non faccio nulla: l'overlay resta
    };

    // autoclose opzionale
    if (autocloseMs && Number.isFinite(autocloseMs)) {
        setTimeout(() => {
            if (popup.style.display !== "none") {
                popup.style.display = "none";
                if (!lockOverlay) {
                    overlay.classList.remove("overlayactive");
                    overlay.style.opacity = "0";
                }
            }
        }, autocloseMs);
    }
}



let selectedType = null;     // 'Bank' | 'Card' | 'Cash'
let selectedIconPath = null; // path icona scelta

// ===== Render dinamico campi (allineati al form) =====
function renderTypeFields(type) {
    const typeFields = document.getElementById('typeFields');
    typeFields.innerHTML = '';

    if (type === 'Bank') {
        typeFields.innerHTML = `
      <h2>IBAN</h2>
      <label for="iban" class="field-label">IBAN</label>
      <input
        type="text"
        id="iban"
        class="number_input"
        placeholder="Es. IT60 X054 2811 1010 0000 0123 456"
        autocomplete="off"
        inputmode="text"
        maxlength="34">
    `;
    } else if (type === 'Card') {
        typeFields.innerHTML = `
      <h2>Card Details</h2>

      <label for="cardHolder" class="field-label">Cardholder name</label>
      <input
        type="text"
        id="cardHolder"
        class="number_input"
        placeholder="Nome come sulla carta"
        autocomplete="cc-name"
      >

      <label for="cardNumber" class="field-label">Card number</label>
      <input
        type="text"
        id="cardNumber"
        class="number_input"
        placeholder="1234 5678 9012 3456"
        autocomplete="cc-number"
        inputmode="numeric"
        maxlength="23"   
        >
      

      <label for="cardExpiry" class="field-label">Expiry (MM/YY)</label>
      <input
        type="text"
        id="cardExpiry"
        class="number_input"
        placeholder="MM/YY"
        autocomplete="cc-exp"
        inputmode="numeric"
        maxlength="5"
      >

      <label for="cardCvv" class="field-label">CVV</label>
      <div class="input-wrap">
        <input
          type="password"
          id="cardCvv"
          class="number_input"
          placeholder="CVV"
          autocomplete="cc-csc"
          inputmode="numeric"
          maxlength="3"
        >
        <button
          type="button"
          class="eye-toggle"
          aria-controls="cardCvv"
          aria-label="Mostra CVV"
          title="Mostra/Nascondi CVV"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5c5 0 9.27 3.11 11 7-1.73 3.89-6 7-11 7S2.73 15.89 1 12c1.73-3.89 6-7 11-7zm0 3a4 4 0 100 8 4 4 0 000-8z"/>
          </svg>
        </button>
      </div>
    `;

        // ------- Helper locali per cifre + cap massimo -------
        const allowOnlyDigitsCap = (el, maxDigits) => {
            const sanitize = () => {
                const digits = el.value.replace(/\D/g, '').slice(0, maxDigits);
                el.value = digits;
            };
            const onBeforeInput = (e) => {
                if (e.inputType === 'insertFromPaste') return; // gestiamo nel paste
                if (e.data && /\D/.test(e.data)) e.preventDefault();
            };
            el.addEventListener('beforeinput', onBeforeInput);
            el.addEventListener('input', sanitize);
            el.addEventListener('paste', (e) => {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text') || '';
                const digits = paste.replace(/\D/g, '').slice(0, maxDigits);
                const start = el.selectionStart ?? el.value.length;
                const end = el.selectionEnd ?? el.value.length;
                const current = el.value;
                const next = (current.slice(0, start) + digits + current.slice(end)).replace(/\D/g, '').slice(0, maxDigits);
                el.value = next;
                // riposiziona il cursore
                const pos = (start + digits.length);
                requestAnimationFrame(() => el.setSelectionRange(pos, pos));
                el.dispatchEvent(new Event('input', { bubbles: true }));
            });
            // blocca alcune key non-digit ma consenti controlli base
            el.addEventListener('keydown', (e) => {
                const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
                if (allowedKeys.includes(e.key) || (e.ctrlKey || e.metaKey)) return;
                if (!/^\d$/.test(e.key)) e.preventDefault();
            });
        };

        // ------- Numero carta: cifra-only + max 19 + spazi visuali -------
        const numberEl = typeFields.querySelector('#cardNumber');
        const formatCardNumber = () => {
            const digits = numberEl.value.replace(/\D/g, '').slice(0, 19);
            numberEl.value = digits.replace(/(.{4})/g, '$1 ').trim();
        };
        // per il cap ci appoggiamo a un dummy input "virtuale": gestiamo noi
        numberEl.addEventListener('input', formatCardNumber);
        numberEl.addEventListener('paste', (e) => {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text') || '';
            const digits = paste.replace(/\D/g, '').slice(0, 19);
            numberEl.value = digits.replace(/(.{4})/g, '$1 ').trim();
        });
        numberEl.addEventListener('beforeinput', (e) => {
            if (e.inputType !== 'insertText') return;
            if (e.data && /\D/.test(e.data)) e.preventDefault();
            const digits = numberEl.value.replace(/\D/g, '');
            if (digits.length >= 19) e.preventDefault();
        });
        numberEl.addEventListener('keydown', (e) => {
            const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', ' '];
            if (allowedKeys.includes(e.key) || (e.ctrlKey || e.metaKey)) return;
            if (!/^\d$/.test(e.key)) e.preventDefault();
        });

        // ------- Scadenza: solo cifre + max 4 + formato MM/YY -------
        const expEl = typeFields.querySelector('#cardExpiry');
        allowOnlyDigitsCap(expEl, 4);
        const formatExpiry = () => {
            const digits = expEl.value.replace(/\D/g, '').slice(0, 4);
            expEl.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
        };
        expEl.addEventListener('input', formatExpiry);
        expEl.addEventListener('paste', (e) => {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text') || '';
            const digits = paste.replace(/\D/g, '').slice(0, 4);
            expEl.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
        });

        // ------- CVV: solo cifre + max 4 -------
        const cvvEl = typeFields.querySelector('#cardCvv');
        allowOnlyDigitsCap(cvvEl, 4);

        // ------- Toggle mostra/nascondi CVV + cambio icona -------
        const eyeBtn = typeFields.querySelector('.eye-toggle');

        const svgEyeOn = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5c5 0 9.27 3.11 11 7-1.73 3.89-6 7-11 7S2.73 15.89 1 12c1.73-3.89 6-7 11-7zm0 3a4 4 0 100 8 4 4 0 000-8z"/>
      </svg>`;
        const svgEyeOff = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2 3.27L3.28 2 22 20.72 20.73 22l-2.42-2.42A12.3 12.3 0 0112 19c-5 0-9.27-3.11-11-7a12.77 12.77 0 012.93-4.22L2 3.27zM7.12 8.4A9.74 9.74 0 003 12c1.73 3.89 6 7 11 7 1.43 0 2.8-.24 4.06-.68l-2.3-2.3A4.99 4.99 0 0112 17a5 5 0 01-4.88-6.1zm6.35 1.76l-2.73-2.73A4 4 0 0116 12c0 .54-.11 1.05-.31 1.52l-2.22-2.22z"/>
      </svg>`;

        eyeBtn?.addEventListener('click', () => {
            const isPassword = cvvEl.type === 'password';
            cvvEl.type = isPassword ? 'text' : 'password';
            eyeBtn.setAttribute('aria-label', isPassword ? 'Nascondi CVV' : 'Mostra CVV');
            eyeBtn.classList.toggle('is-on', isPassword);
            eyeBtn.innerHTML = isPassword ? svgEyeOff : svgEyeOn;
        });

    } else if (type === 'Cash') {
        typeFields.innerHTML = '';
    }
}

function redirect(location) {
    window.location.href = location;
}
