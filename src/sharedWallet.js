document.addEventListener('DOMContentLoaded', () => {

    const burger = document.getElementById("burger");
    const menu = document.getElementById("menu-content");
    const overlay = document.getElementById("overlay");
    const backArrow = document.getElementById("back-arrow");

    function openMenu() {
        menu.classList.add("open");
        overlay.style.opacity = "1";
    }

    function closeMenu() {
        menu.classList.remove("open");
        overlay.style.opacity = "0";
    }

    burger.addEventListener("click", openMenu);
    backArrow.addEventListener("click", closeMenu);
    overlay.addEventListener("click", closeMenu); 

    const openButton = document.getElementById("createSwBtn");

    openButton.addEventListener("click", () => {
        window.location.href = "/create_sw.php"
    });


    const frame = document.getElementById("frame-accounts");
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


    (function () {
        const root = document.querySelector('#friends .friends-carousel');
        if (!root) return;

        const track = root.querySelector('.fc-track');
        const prev = root.querySelector('.fc-prev');
        const next = root.querySelector('.fc-next');
        const dotsWrap = document.querySelector('#friends .fc-dots');

        let index = 0;

        const cards = () => Array.from(track.children);

        function buildDots() {
            dotsWrap.innerHTML = '';
            cards().forEach((_, i) => {
                const d = document.createElement('div');
                d.className = 'fc-dot' + (i === index ? ' is-active' : '');
                d.role = 'button';
                d.tabIndex = 0;
                d.addEventListener('click', () => go(i));
                d.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') go(i); });
                dotsWrap.appendChild(d);
            });
        }

        function update() {
            const n = cards().length;
            if (n === 0) {
                track.style.transform = 'translateX(0)';
                prev.disabled = true; next.disabled = true;
                dotsWrap.innerHTML = '';
                return;
            }
            index = (index + n) % n;
            track.style.transform = `translateX(${-index * 100}%)`;
            dotsWrap.querySelectorAll('.fc-dot').forEach((el, i) =>
                el.classList.toggle('is-active', i === index)
            );
            const disable = n <= 1;
            prev.disabled = disable; next.disabled = disable;
        }

        function go(i) { index = (i + cards().length) % Math.max(cards().length, 1); update(); }

        prev.addEventListener('click', () => go(index - 1));
        next.addEventListener('click', () => go(index + 1));

        // Swipe mobile
        let startX = null;
        root.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
        root.addEventListener('touchend', e => {
            if (startX == null) return;
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 30) go(index + (dx < 0 ? 1 : -1));
            startX = null;
        }, { passive: true });

        // Ricostruisce quando i dati sono pronti
        document.querySelector('#friends')?.addEventListener('friends:loaded', (e) => {
            index = 0;
            buildDots();
            update();
        });

        // Prima init (se ci sono già card in HTML)
        buildDots(); update();
    })();




    (function () {
        // ——— Carousel setup
        const root = document.querySelector('#invites');
        if (!root) return;

        const track = root.querySelector('.iv-track');
        const cards = () => Array.from(track.children); // live getter (cambiano quando rimuovi)
        const prev = root.querySelector('.iv-prev');
        const next = root.querySelector('.iv-next');
        const dotsWrap = root.querySelector('.iv-dots');
        const toast = document.getElementById('invite-toast');

        let index = 0;

        // dots
        function buildDots() {
            dotsWrap.innerHTML = '';
            cards().forEach((_, i) => {
                const d = document.createElement('div');
                d.className = 'iv-dot' + (i === index ? ' is-active' : '');
                d.addEventListener('click', () => go(i));
                dotsWrap.appendChild(d);
            });
        }

        function update() {
            // protezione su index fuori range
            if (cards().length === 0) {
                track.style.transform = 'translateX(0)';
                dotsWrap.innerHTML = '';
                return;
            }
            index = (index + cards().length) % cards().length;
            track.style.transform = `translateX(${-index * 100}%)`;
            dotsWrap.querySelectorAll('.iv-dot').forEach((el, i) => el.classList.toggle('is-active', i === index));
        }

        function go(i) { index = (i + cards().length) % cards().length; update(); }

        prev.addEventListener('click', () => go(index - 1));
        next.addEventListener('click', () => go(index + 1));

        function attachActions(card) {
            const acceptBtn = card.querySelector('.iv-accept');
            const declineBtn = card.querySelector('.iv-decline');

            acceptBtn.addEventListener('click', async () => {
                const group = `INVITE_ACCEPT card#${card.dataset.id || '??'}`;
                console.group(group);
                try {
                    const invId = Number(card.dataset.id);
                    const uid = (typeof CURRENT_USER_ID !== 'undefined') ? CURRENT_USER_ID : 1;
                    const wId = Number(card.dataset.walletId || 0);

                    console.log('payload →', { invId, uid, wId, API_HOST });

                    const res = await fetch(`http://${API_HOST}:8000/api.php?path=invitation_accept`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            invitation_id: invId,
                            receiver_id: uid,
                            wallet_id: wId > 0 ? wId : undefined
                        })
                    });

                    const raw = await res.clone().text();
                    console.log('HTTP', res.status, res.statusText);
                    console.log('raw body ←', raw);

                    let out;
                    try { out = JSON.parse(raw); } catch (e) {
                        console.error('JSON parse fail:', e);
                        throw new Error('Risposta non-JSON dal server');
                    }
                    console.log('json ←', out);

                    if (!res.ok || out.error) {
                        throw new Error(out?.error || `HTTP ${res.status}`);
                    }
                    if (!out.wallet) throw new Error('API ok, ma manca "wallet" nella risposta');

                    // verifiche client-side richieste
                    const myName = (window.CURRENT_USER_FULLNAME || 'Mario Rossi').trim();
                    const slots = [
                        out.wallet.partecipant_name_surname1,
                        out.wallet.partecipant_name_surname2,
                        out.wallet.partecipant_name_surname3
                    ].map(s => (s || '').trim()).filter(Boolean);

                    console.log('participants after accept →', slots);
                    const imThere = slots.some(n => n.toLowerCase() === myName.toLowerCase());
                    if (!imThere) {
                        console.warn('⚠️ Il mio nome non risulta tra i partecipanti dopo l’accept');
                    }

                    // append card al volo
                    appendWalletCard(out.wallet);

                    // animazione + UI update (safe)
                    card.classList.add('accepting');
                    card.addEventListener('animationend', () => {
                        card.remove();
                        if (typeof buildDots === 'function') try { buildDots(); } catch (e) { console.warn(e); }
                        if (typeof update === 'function') try { update(); } catch (e) { console.warn(e); }
                        if (typeof showToast === 'function') showToast('✅ Ora fai parte di questo Wallet');
                    }, { once: true });

                } catch (e) {
                    console.error('ACCEPT ERROR →', e);
                    if (typeof showToast === 'function') showToast('⚠️ Errore durante l\'accettazione');
                } finally {
                    console.groupEnd(group);
                }
            });

            declineBtn.addEventListener('click', async () => {
                // (opzionale) chiama API declina qui
                // await fetch('/api/invitations/decline?id='+card.dataset.id, { method:'POST' })

                card.classList.add('declining');
                card.addEventListener('animationend', () => {
                    const removedIndex = cards().indexOf(card);
                    card.remove();
                    if (removedIndex <= index) index = Math.max(0, index - 1);
                    buildDots(); update();
                }, { once: true });
            });
        }

        cards().forEach(attachActions);

        function showToast(msg) {
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2200);
        }

        buildDots(); update();
    })();

    const btn = document.getElementById('invite-friend-btn');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        const link =
            btn.dataset.link ||
            `${location.origin}/invite?code=${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`;

        try {
            await copyToClipboard(link);
            showBottomToast('✅ Link copiato negli appunti', 'success');  // usa il toast in fondo pagina
        } catch (e) {
            console.error(e);
            showBottomToast('⚠️ Impossibile copiare il link', 'error');
        }
    });

    (function () {
        const root = document.querySelector('#invites');
        if (!root) return;

        const carousel = root.querySelector('.invites-carousel');
        const track = root.querySelector('.iv-track');
        const prev = root.querySelector('.iv-prev');
        const next = root.querySelector('.iv-next');
        const dotsWrap = root.querySelector('.iv-dots');
        const toast = document.getElementById('invite-toast');

        // msg "no pending"
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'iv-empty';
        emptyMsg.textContent = 'No pending invitations left';
        // lo mettiamo dopo i dots
        dotsWrap.insertAdjacentElement('afterend', emptyMsg);

        const cards = () => Array.from(track.children);
        let index = 0;

        function setEmptyState(isEmpty) {
            if (isEmpty) {
                carousel.style.display = 'none';
                dotsWrap.style.display = 'none';
                emptyMsg.style.display = 'block';
            } else {
                carousel.style.display = '';
                dotsWrap.style.display = '';
                emptyMsg.style.display = 'none';
            }
        }

        function buildDots() {
            dotsWrap.innerHTML = '';
            if (cards().length === 0) { setEmptyState(true); return; }
            setEmptyState(false);
            cards().forEach((_, i) => {
                const d = document.createElement('div');
                d.className = 'iv-dot' + (i === index ? ' is-active' : '');
                d.addEventListener('click', () => go(i));
                dotsWrap.appendChild(d);
            });
        }

        function update() {
            const n = cards().length;
            if (n === 0) { setEmptyState(true); return; }
            setEmptyState(false);

            index = (index + n) % n;
            track.style.transform = `translateX(${-index * 100}%)`;

            dotsWrap.querySelectorAll('.iv-dot')
                .forEach((el, i) => el.classList.toggle('is-active', i === index));

            // disabilita frecce con 0/1 card
            const disable = n <= 1;
            prev.disabled = disable;
            next.disabled = disable;
        }

        function go(i) { index = (i + cards().length) % Math.max(cards().length, 1); update(); }

        prev.addEventListener('click', () => go(index - 1));
        next.addEventListener('click', () => go(index + 1));

        // Accept / Decline con rimozione card e check stato vuoto
        function attachActions(card) {
            const acceptBtn = card.querySelector('.iv-accept');
            const declineBtn = card.querySelector('.iv-decline');

            acceptBtn.addEventListener('click', async () => {
                try {
                    const invId = Number(card.dataset.id);          // assicurati di settare data-id = id invito
                    const uid = (typeof CURRENT_USER_ID !== 'undefined') ? CURRENT_USER_ID : 1;

                    const res = await fetch(`http://${API_HOST}:8000/api.php?path=invitation_accept`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ invitation_id: invId, receiver_id: uid })
                    });
                    const out = await res.json().catch(() => ({}));
                    if (!res.ok || out.error) throw new Error(out.error || `HTTP ${res.status}`);

                    // animazione + rimozione card
                    card.classList.add('accepting');
                    card.addEventListener('animationend', () => {
                        card.remove();
                        // ricostruisci dots/viewport come fai già
                        buildDots(); update();
                        showToast('✅ Ora fai parte di questo Wallet');
                        // opzionale: ricarica la lista wallet dell’utente per vedere il nuovo wallet
                        loadWallets(uid);
                    }, { once: true });
                } catch (e) {
                    console.error(e);
                    showToast('⚠️ Errore durante l\'accettazione');
                }
            });

            declineBtn.addEventListener('click', () => {
                card.classList.add('declining');
                card.addEventListener('animationend', () => {
                    const removedIndex = cards().indexOf(card);
                    card.remove();
                    if (removedIndex <= index) index = Math.max(0, index - 1);
                    buildDots(); update();
                }, { once: true });
            });
        }

        cards().forEach(attachActions);

        function showToast(msg) {
            if (!toast) return;
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2200);
        }

        buildDots();
        update();
    })();


    loadWallets(1);
    loadFriends(1);
    loadInvitations(1);
});



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

async function loadWallets(userId) {
    const uid = userId ?? (typeof CURRENT_USER_ID !== "undefined" ? CURRENT_USER_ID : null);
    if (!uid) {
        console.error("loadWallets: userId mancante");
        return;
    }

    const frame = document.getElementById("frame-accounts");
    if (!frame) {
        console.error('Elemento #frame-accounts non trovato nel DOM');
        return;
    }

    try {
        const url = `http://${API_HOST}:8000/api.php?path=sharedAccounts&user=${encodeURIComponent(uid)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        /** @type {Array<{
         *  id:number, name:string, balance:number, path?:string, color?:string,
         *  partecipant_num?:number, last_sync?:string
         * }>} */
        const wallets = await res.json();

        frame.innerHTML = "";

        wallets.forEach(w => {
            if (!w.name) return;

            // Wrapper card
            const box = document.createElement("div");
            box.className = "account-box wallet-box";

            // Icona / immagine da path o colore fallback
            const iconDiv = document.createElement("div");
            iconDiv.className = "icon wallet";
            if (w.path) {
                iconDiv.style.backgroundImage = `url('${w.path}')`;
                iconDiv.style.backgroundSize = "cover";
                iconDiv.style.backgroundPosition = "center";
            } else if (w.color) {
                iconDiv.style.background = w.color;
            }

            // Colonna info
            const info = document.createElement("div");
            info.className = "info";

            // Riga nome + icona
            const nameIcon = document.createElement("div");
            nameIcon.className = "name-Icon";
            nameIcon.style.display = "flex";
            nameIcon.style.flexDirection = "column";

            const nameDiv = document.createElement("div");
            nameDiv.className = "account-name";
            nameDiv.textContent = w.name;

            // Meta: partecipanti
            const otherNames = [
                w.partecipant_name_surname1,
                w.partecipant_name_surname2,
                w.partecipant_name_surname3
            ].map(v => (v ?? '').trim()).filter(v => v.length > 0);

            const participantsCount = 1 + otherNames.length; // 1 = me stesso

            const metaDiv = document.createElement("div");
            metaDiv.className = "account-type";
            metaDiv.textContent = `Partecipanti: ${participantsCount}`;

            // Balance con etichetta "Balance : 200"
            const balanceDiv = document.createElement("div");
            balanceDiv.className = "account-balance";
            const formatted = (Number(w.balance) || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
            balanceDiv.textContent = `Balance : ${formatted}` + "€";

            const lastSyncDiv = document.createElement("div");
            lastSyncDiv.className = "account-lastsync";

            // dividi etichetta e data in due <span>
            const labelSpan = document.createElement("span");
            labelSpan.textContent = "Last sync:";

            const dateSpan = document.createElement("span");
            dateSpan.className = "lastsync-date";
            dateSpan.textContent = " " + (w.last_sync ?? "-");

            // Role: ...
            const roleDiv = document.createElement("div");
            roleDiv.className = "account-role";
            roleDiv.textContent = `Role: ${getMyRole(w)}`;

            lastSyncDiv.appendChild(labelSpan);
            lastSyncDiv.appendChild(dateSpan);

            // Pulsante modifica (se ti serve)
            const modifyBtn = document.createElement("button");

            modifyBtn.className = "account-modify-btn";
            modifyBtn.textContent = "Modify";
            modifyBtn.addEventListener("click", () => openModifyWalletPopup?.(w));

            const viewBtn = document.createElement("button");
            viewBtn.className = "account-view-btn";
            viewBtn.textContent = "View";

            viewBtn.addEventListener("click", () => {
                const role = getMyRole(w);
                const balanceRaw = Number(w.balance) || 0;
                const url = buildSharedPageUrl({
                    name: w.name,
                    participants: participantsCount,
                    role,
                    balance: balanceRaw
                });
                window.location.href = url;
            });

            const btnContainer = document.createElement("div");
            btnContainer.className = "account-btns";
            btnContainer.appendChild(viewBtn);
            if (getMyRole(w) != "Viewer") {
                btnContainer.appendChild(modifyBtn);
            }

            // Montaggio
            nameIcon.appendChild(nameDiv);
            nameIcon.appendChild(iconDiv);

            info.appendChild(metaDiv);
            info.appendChild(roleDiv);
            info.appendChild(balanceDiv);
            info.appendChild(lastSyncDiv);

            box.appendChild(nameIcon);
            box.appendChild(info);
            btnContainer.appendChild(viewBtn)
            if (getMyRole(w) != "Viewer") {
                btnContainer.appendChild(modifyBtn);
            }
            box.appendChild(btnContainer);
            frame.appendChild(box);
        });
    } catch (err) {
        console.error("Errore durante il caricamento wallets:", err);
    }
}

function openModifyWalletPopup(w) {
    const overlay = document.getElementById('swOverlay');
    const modal = document.getElementById('swEditPopup');

    const myName = ((window.CURRENT_USER_FULLNAME || '').trim()) || 'Mario Rossi';
    const norm = (s) => (s ?? '').toString().toLowerCase().trim();
    const VALID = ['editor', 'admin', 'viewer'];
    const roleNow = (r) => VALID.includes(norm(r)) ? (norm(r)[0].toUpperCase() + norm(r).slice(1)) : 'Viewer';

    const people = [
        { idx: 1, name: w.partecipant_name_surname1, role: w.participant_role1 },
        { idx: 2, name: w.partecipant_name_surname2, role: w.participant_role2 },
        { idx: 3, name: w.partecipant_name_surname3, role: w.participant_role3 },
    ].filter(p => (p.name ?? '').trim().length);

    modal.innerHTML = `
    <div class="sw-header">
      <div>
        <div class="sw-title">Manage participants</div>
        <div class="sw-sub">${w.name}</div>
      </div>
      <button class="sw-cancel" id="swCloseBtn">Close</button>
    </div>

    <div class="sw-list" id="swList"></div>

    <div class="sw-footer">
      <div class="sw-footer-left"></div>
      <div class="sw-footer-right">
        <button type="button" class="sw-quit" id="swQuitBtn" style="display:none">Delete</button>
        <button class="sw-save" id="swSaveBtn">Save changes</button>
      </div>
    </div>
  `;

    const list = modal.querySelector('#swList');
    const footerLeft = modal.querySelector('.sw-footer-left');
    const quitBtn = modal.querySelector('#swQuitBtn');

    function updateInviteVisibility() {
        const count = list.querySelectorAll('.sw-person').length;
        let btn = modal.querySelector('#swInviteBtn');
        if (count < 3) {
            if (!btn) {
                btn = document.createElement('button');
                btn.className = 'sw-invite';
                btn.id = 'swInviteBtn';
                btn.textContent = 'Invite friends';
                btn.addEventListener('click', openInvitePopup);
                footerLeft.appendChild(btn);
            }
        } else if (btn) {
            btn.remove();
        }
    }

    function refreshQuitButton() {
        const rows = Array.from(list.querySelectorAll('.sw-person'));
        if (rows.length === 0) {
            quitBtn.style.display = '';
        } else {
            quitBtn.style.display = 'none';
        }
    }


    function renderPerson(p) {
        const row = document.createElement('div');
        row.className = 'sw-person';
        row.dataset.idx = String(p.idx);

        const rNow = roleNow(p.role);
        row.innerHTML = `
      <div class="sw-person-row">
        <div class="sw-person-name">${p.name}</div>
        <button class="sw-remove" title="Remove">Remove</button>
      </div>
      <div class="sw-roles" role="radiogroup" aria-label="Role">
        ${['Editor', 'Admin', 'Viewer'].map(opt => `
          <label class="sw-role">
            <input type="radio" name="role-${p.idx}" value="${opt}" ${norm(rNow) === norm(opt) ? 'checked' : ''}>
            ${opt}
          </label>`).join('')}
      </div>
    `;

        // Rimozione con fallback se non esiste animazione CSS
        row.querySelector('.sw-remove').addEventListener('click', () => {
            row.classList.add('removing');
            let removed = false;
            const kill = () => {
                if (removed) return;
                removed = true;
                row.remove();
                updateInviteVisibility();
                refreshQuitButton();
            };
            row.addEventListener('animationend', kill, { once: true });
            setTimeout(kill, 300); // fallback se non c’è animazione
        });

        list.appendChild(row);
    }

    people.forEach(renderPerson);
    updateInviteVisibility();
    refreshQuitButton();

    // Azione QUIT (TODO: implementa la tua API/azione reale)
    quitBtn.addEventListener('click', async () => {
        try {
            // esempio: mostra solo un popup ora
            if (typeof showPopup === 'function') showPopup('Quit eseguito (TODO API)', 'success');
            // qui potresti chiamare una API es: /api.php?path=wallet_quit
            // e chiudere il modal / rimuovere la card dal DOM principale
        } catch (e) {
            console.error(e);
            if (typeof showPopup === 'function') showPopup('Errore Quit: ' + e.message, 'error');
        }
    });

    function closeModal() {
        overlay.classList.remove('active');
        modal.classList.remove('active');
        document.getElementById('swInvitePopup')?.classList.remove('active');
    }
    overlay.onclick = closeModal;
    modal.querySelector('#swCloseBtn').onclick = closeModal;

    // ----- Invite popup mock -----
    function ensureInviteModal() {
        let inv = document.getElementById('swInvitePopup');
        if (!inv) { inv = document.createElement('div'); inv.id = 'swInvitePopup'; document.body.appendChild(inv); }
        inv.innerHTML = `
      <div class="inv-header">
        <div class="inv-title">Invite friends to "${w.name}"</div>
        <button class="inv-close" id="invCloseBtn">Close</button>
      </div>
      <div class="inv-list">
        <div class="inv-item"><div class="inv-name">Mario Rossi</div><button class="inv-btn is-already" data-state="already">Already invited</button></div>
        <div class="inv-item"><div class="inv-name">Giulia Bianchi</div><button class="inv-btn" data-state="idle">Invite</button></div>
        <div class="inv-item"><div class="inv-name">Luca Verdi</div><button class="inv-btn" data-state="idle">Invite</button></div>
        <div class="inv-item"><div class="inv-name">Anna Neri</div><button class="inv-btn" data-state="idle">Invite</button></div>
      </div>
    `;
        inv.querySelector('#invCloseBtn').addEventListener('click', () => inv.classList.remove('active'));
        inv.querySelectorAll('.inv-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const state = btn.dataset.state;
                if (state === 'already' || state === 'invited') return;
                btn.dataset.state = 'invited';
                btn.textContent = 'Invited';
                btn.classList.add('is-invited');
                // dopo un “Invite” ci sono >1 partecipanti → nascondi Quit
                quitBtn.style.display = 'none';
            });
        });
        return inv;
    }
    function openInvitePopup() { ensureInviteModal().classList.add('active'); }

    // ----- SAVE -----
    modal.querySelector('#swSaveBtn').addEventListener('click', async () => {
        const survivors = Array.from(list.querySelectorAll('.sw-person')).map(row => {
            const i = Number(row.dataset.idx);
            const sel = row.querySelector(`input[name="role-${i}"]:checked`);
            return { name: row.querySelector('.sw-person-name').textContent, role: sel ? sel.value : 'Viewer' };
        }).slice(0, 3);

        try {
            const res = await fetch(`http://${API_HOST}:8000/api.php?path=save_sw_changes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wallet_id: w.id, participants: survivors })
            });
            const out = await res.json().catch(() => ({}));
            if (!res.ok || out.error) throw new Error(out.error || `HTTP ${res.status}`);
            if (typeof showPopup === 'function') showPopup('Participants updated', 'success');
            closeModal();
            loadWallets(1);
        } catch (e) {
            console.error(e);
            if (typeof showPopup === 'function') showPopup('Errore salvataggio: ' + e.message, 'error');
        }
    });

    overlay.classList.add('active');
    modal.classList.add('active');
}



function showPopup(message, type = "success") {
    const popup = document.getElementById("successPopup");
    const textEl = document.getElementById("successText");
    const overlay = document.getElementById("overlay");

    if (popup && textEl && overlay) {
        textEl.textContent = message;
        popup.style.display = "flex";
        overlay.classList.add("overlayactive");

        const okBtn = document.getElementById("successOkBtn");
        if (okBtn) {
            okBtn.replaceWith(okBtn.cloneNode(true));
            const newOkBtn = document.getElementById("successOkBtn");
            newOkBtn.onclick = () => {
                popup.style.display = "none";
                overlay.classList.remove("overlayactive");
            };
        }
        overlay.onclick = () => {
            popup.style.display = "none";
            overlay.classList.remove("overlayactive");
        };
        return;
    }

    // Fallback: toast volante
    let t = document.createElement('div');
    t.style.position = 'fixed';
    t.style.left = '50%';
    t.style.bottom = '24px';
    t.style.transform = 'translateX(-50%)';
    t.style.padding = '10px 16px';
    t.style.background = type === 'error' ? '#e74c3c' : '#2A60BA';
    t.style.color = '#fff';
    t.style.borderRadius = '10px';
    t.style.boxShadow = '0 4px 16px rgba(0,0,0,.2)';
    t.textContent = message;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
}


function getMyRole(w) {
    const r = (w.user_role || '').toString().trim().toLowerCase();
    if (!r) return 'Viewer';
    return r.charAt(0).toUpperCase() + r.slice(1); // es. "editor" -> "Editor"
}


async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }
    // fallback non-HTTPS
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    if (!ok) throw new Error('execCommand copy failed');
}

function showCopyToast(anchorBtn, message, success = true) {
    let toast = document.getElementById('copy-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'copy-toast';
        toast.className = 'copy-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        // inserisci proprio sotto il bottone
        anchorBtn.insertAdjacentElement('afterend', toast);
    }

    toast.classList.remove('error', 'show');
    if (!success) toast.classList.add('error');

    toast.innerHTML = `<span class="icon">${success ? '✅' : '⚠️'}</span><span>${message}</span>`;

    // piccola animazione
    requestAnimationFrame(() => toast.classList.add('show'));

    // auto-hide
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 2200);
}

function showBottomToast(message, variant = 'success') {
    const toast = document.getElementById('invite-toast');
    if (!toast) return;
    toast.classList.remove('show', 'success', 'error');
    if (variant) toast.classList.add(variant);
    toast.textContent = message;
    // trigger animazione
    requestAnimationFrame(() => toast.classList.add('show'));
    clearTimeout(showBottomToast._t);
    showBottomToast._t = setTimeout(() => toast.classList.remove('show'), 2200);
}

async function loadFriends(userId) {
    const uid = userId ?? (typeof CURRENT_USER_ID !== "undefined" ? CURRENT_USER_ID : null);
    if (!uid) { console.error("loadFriends: userId mancante"); return; }

    const root = document.querySelector('#friends');
    if (!root) return;

    const track = root.querySelector('.fc-track');
    const dotsWrap = root.querySelector('.fc-dots');
    if (!track || !dotsWrap) return;

    try {
        const url = `http://${API_HOST}:8000/api.php?path=friends&user=${encodeURIComponent(uid)}`;
        const res = await fetch(url);

        if (!res.ok) {
            let errText = '';
            try { errText = await res.text(); } catch { }
            console.error('friends API error payload:', errText);
            throw new Error(`HTTP ${res.status}`);
        }

        /** @type {Array<{id:number, friend_id:number, friend_name:string}>} */
        const friends = await res.json();

        track.innerHTML = "";
        dotsWrap.innerHTML = "";

        if (!friends.length) {
            const empty = document.createElement('div');
            empty.className = 'iv-empty';
            empty.textContent = 'No friends yet';
            dotsWrap.insertAdjacentElement('afterend', empty);
            root.dispatchEvent(new CustomEvent('friends:loaded', { detail: { count: 0 } }));
            return;
        }

        friends.forEach(f => {
            const card = document.createElement('div');
            card.className = 'friend-card';
            card.innerHTML = `
        <div class="fc-avatar"><img src="/images/icons8-profile-24.png" alt=""></div>
        <div class="fc-name"></div>`;
            card.querySelector('.fc-name').textContent = f.friend_name;
            track.appendChild(card);
        });

        root.dispatchEvent(new CustomEvent('friends:loaded', { detail: { count: friends.length } }));
    } catch (e) {
        console.error("Errore loadFriends:", e);
    }
}

async function loadInvitations(userId) {
    const uid = userId ?? (typeof CURRENT_USER_ID !== "undefined" ? CURRENT_USER_ID : null);
    if (!uid) { console.error("loadInvitations: userId mancante"); return; }

    const root = document.querySelector('#invites');
    if (!root) return;

    const carousel = root.querySelector('.invites-carousel');
    const track = root.querySelector('.iv-track');
    const prev = root.querySelector('.iv-prev');
    const next = root.querySelector('.iv-next');
    const dotsWrap = root.querySelector('.iv-dots');
    const toast = document.getElementById('invite-toast');

    const cards = () => Array.from(track.children);
    let index = 0;

    function showToast(msg) { if (!toast) return; toast.textContent = msg; toast.classList.add('show'); clearTimeout(showToast._t); showToast._t = setTimeout(() => toast.classList.remove('show'), 2200); }
    function setEmptyState(isEmpty) { carousel.style.display = isEmpty ? 'none' : ''; dotsWrap.style.display = isEmpty ? 'none' : ''; if (isEmpty) { if (!root.querySelector('.iv-empty')) { const e = document.createElement('div'); e.className = 'iv-empty'; e.textContent = 'No pending invitations left'; root.appendChild(e); } } else root.querySelector('.iv-empty')?.remove(); }
    function buildDots() { dotsWrap.innerHTML = ''; cards().forEach((_, i) => { const d = document.createElement('div'); d.className = 'iv-dot' + (i === index ? ' is-active' : ''); d.addEventListener('click', () => go(i)); dotsWrap.appendChild(d); }); }
    function update() { const n = cards().length; if (n === 0) { setEmptyState(true); return; } setEmptyState(false); index = (index + n) % n; track.style.transform = `translateX(${-index * 100}%)`; dotsWrap.querySelectorAll('.iv-dot').forEach((el, i) => el.classList.toggle('is-active', i === index)); const disable = n <= 1; prev.disabled = disable; next.disabled = disable; }
    function go(i) { index = (i + cards().length) % Math.max(cards().length, 1); update(); }

    function attachActions(card) {
        const acceptBtn = card.querySelector('.iv-accept');
        const declineBtn = card.querySelector('.iv-decline');

        acceptBtn.addEventListener('click', async () => {
            try {
                console.log("QUA");
                const invId = Number(card.dataset.id);
                const uid = (typeof CURRENT_USER_ID !== 'undefined') ? CURRENT_USER_ID : 1;
                const wId = Number(card.dataset.walletId || 0);

                const res = await fetch(`http://${API_HOST}:8000/api.php?path=invitation_accept`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        invitation_id: invId,
                        receiver_id: uid,
                        wallet_id: wId > 0 ? wId : undefined
                    })
                });
                console.log(res);
                const out = await res.json().catch(() => ({}));
                if (!res.ok || out.error) throw new Error(out.error || `HTTP ${res.status}`);

                card.classList.add('accepting');
                card.addEventListener('animationend', () => {
                    card.remove();
                    buildDots(); update();
                    showToast('✅ Ora fai parte di questo Wallet');
                    loadWallets(uid);              // ricarica lista wallet dell'utente
                }, { once: true });
            } catch (e) {
                console.error(e);
                showToast('⚠️ Errore durante l\'accettazione');
            }
        });


        declineBtn.addEventListener('click', async () => {
            // TODO: chiama la tua API di decline se/quando la implementi
            card.classList.add('declining');
            card.addEventListener('animationend', () => {
                const removedIndex = cards().indexOf(card);
                card.remove();
                if (removedIndex <= index) index = Math.max(0, index - 1);
                buildDots(); update();
            }, { once: true });
        });
    }

    try {
        const res = await fetch(`http://${API_HOST}:8000/api.php?path=invitations&user=${encodeURIComponent(uid)}`);
        if (!res.ok) {
            let err = ''; try { err = await res.text(); } catch { }
            console.error('invitations API error payload:', err);
            throw new Error(`HTTP ${res.status}`);
        }
        const invites = await res.json();

        track.innerHTML = ''; dotsWrap.innerHTML = '';
        if (!invites.length) { setEmptyState(true); return; }

        invites.forEach(inv => {
            const fullName = `${inv.sender_first_name ?? ''} ${inv.sender_last_name ?? ''}`.trim();
            const dd = String(inv.sent_day).padStart(2, '0');
            const mm = String(inv.sent_month).padStart(2, '0');
            const balance = Number(inv.wallet_balance ?? 0);
            const balanceFmt = isNaN(balance) ? `${inv.wallet_balance} €` : balance.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' €';

            const card = document.createElement('div');
            card.className = 'invite-card';
            card.dataset.id = String(inv.id);
            if (inv.wallet_id != null) card.dataset.walletId = String(inv.wallet_id);   // <— importantissimo

            card.innerHTML = `
        <div class="iv-avatar"><img src="/images/icons8-profile-24.png" alt=""></div>
        <div class="iv-name"></div>
        <div class="iv-date"></div>

        <div class="iv-wallet">Wallet: <strong></strong></div>
        <div class="iv-stats">
          <span class="iv-balance"></span>
          <span class="iv-participants"></span>
        </div>

        <div class="iv-actions">
          <button class="iv-accept">Accept</button>
          <button class="iv-decline">Decline</button>
        </div>
      `;

            card.querySelector('.iv-name').textContent = fullName || '—';
            card.querySelector('.iv-date').textContent = `Sent: ${dd}/${mm}`;
            card.querySelector('.iv-wallet strong').textContent = inv.wallet_name ?? '—';
            card.querySelector('.iv-balance').textContent = `Balance: ${balanceFmt}`;
            card.querySelector('.iv-participants').textContent = `Participants: ${inv.participants_count ?? 1}`;

            attachActions(card);
            track.appendChild(card);
        });

        buildDots(); update();
        prev.addEventListener('click', () => go(index - 1));
        next.addEventListener('click', () => go(index + 1));

        let startX = null;
        carousel.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
        carousel.addEventListener('touchend', e => {
            if (startX == null) return;
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 30) go(index + (dx < 0 ? 1 : -1));
            startX = null;
        },
            { passive: true });

    } catch (e) {
        console.error('Errore loadInvitations:', e);
        showToast('⚠️ Errore caricamento inviti');
    }
}

function myFullName() {
    // usa variabile globale se c'è, altrimenti fallback richiesto
    const n = (window.CURRENT_USER_FULLNAME || "").trim();
    return n || "Mario Rossi";
}

function appendWalletCard(w) {
    const frame = document.getElementById("frame-accounts");
    if (!frame) return;

    // evita duplicati se la card esiste già (mettiamo un data-attr con id)
    if (frame.querySelector(`.account-box[data-wallet-id="${w.id}"]`)) return;

    // Wrapper card
    const box = document.createElement("div");
    box.className = "account-box wallet-box";
    box.dataset.walletId = String(w.id);

    // Icona / immagine
    const iconDiv = document.createElement("div");
    iconDiv.className = "icon wallet";
    if (w.path) {
        iconDiv.style.backgroundImage = `url('${w.path}')`;
        iconDiv.style.backgroundSize = "cover";
        iconDiv.style.backgroundPosition = "center";
    } else if (w.color) {
        iconDiv.style.background = w.color;
    }

    // Colonna info
    const info = document.createElement("div");
    info.className = "info";

    // Riga nome + icona
    const nameIcon = document.createElement("div");
    nameIcon.className = "name-Icon";
    nameIcon.style.display = "flex";
    nameIcon.style.flexDirection = "column";

    const nameDiv = document.createElement("div");
    nameDiv.className = "account-name";
    nameDiv.textContent = w.name;

    // Partecipanti
    const others = [w.partecipant_name_surname1, w.partecipant_name_surname2, w.partecipant_name_surname3]
        .map(v => (v || '').trim()).filter(Boolean);
    const participantsCount = Math.max(Number(w.partecipant_num || 0), others.length);

    const metaDiv = document.createElement("div");
    metaDiv.className = "account-type";
    metaDiv.textContent = `Partecipanti: ${participantsCount}`;

    // Ruolo
    const roleDiv = document.createElement("div");
    roleDiv.className = "account-role";
    roleDiv.textContent = `Role: ${getMyRole(w)}`;

    // Balance
    const balanceDiv = document.createElement("div");
    balanceDiv.className = "account-balance";
    const formatted = (Number(w.balance) || 0).toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    balanceDiv.textContent = `Balance : ${formatted}€`;

    // Last sync
    const lastSyncDiv = document.createElement("div");
    lastSyncDiv.className = "account-lastsync";
    const labelSpan = document.createElement("span");
    labelSpan.textContent = "Last sync:";
    const dateSpan = document.createElement("span");
    dateSpan.className = "lastsync-date";
    dateSpan.textContent = " " + (w.last_sync ?? "-");
    lastSyncDiv.appendChild(labelSpan);
    lastSyncDiv.appendChild(dateSpan);

    // Bottone Modify se non Viewer
    const modifyBtn = document.createElement("button");
    modifyBtn.className = "account-modify-btn";
    modifyBtn.textContent = "Modify";
    modifyBtn.addEventListener("click", () => openModifyWalletPopup?.(w));


    // Montaggio
    nameIcon.appendChild(nameDiv);
    nameIcon.appendChild(iconDiv);

    info.appendChild(metaDiv);
    info.appendChild(roleDiv);
    info.appendChild(balanceDiv);
    info.appendChild(lastSyncDiv);

    box.appendChild(nameIcon);
    box.appendChild(info);
    if (getMyRole(w) !== "Viewer") {
        box.appendChild(modifyBtn);
    }

    // inserisci in cima
    frame.insertBefore(box, frame.firstChild);
}
function buildSharedPageUrl({ name, participants, role, balance }) {
    const normBalance = Number.isFinite(Number(balance))
        ? Number(balance).toFixed(2)   // "1234.50"
        : '';                           // fallback vuoto

    const params = new URLSearchParams({
        name: name ?? '',
        participants: String(participants ?? ''),
        role: role ?? '',
        balance: normBalance
    });
    return `/shared_page.php?${params.toString()}`;
}