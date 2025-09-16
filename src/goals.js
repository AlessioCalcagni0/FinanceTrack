
function openMenu() {
    document.getElementsByClassName("back-arrow")[0].classList.add("show-menu");

    document.getElementById("menu-content").classList.toggle("show-menu");
    const overlay = document.getElementById("overlay-menu");
    overlay.style.opacity="1";

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

function closeMenu() {
   
    document.getElementById("menu-content").classList.remove("show-menu");
    document.getElementsByClassName("back-arrow")[0].classList.remove("show-menu");
    const overlay = document.getElementById("overlay-menu");
    overlay.style.opacity="0";
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



    // aggiorna subito al caricamento
    
});


function showPopup(message, options = {}) {
    const {
        type = "info",        // "success" | "error" | "info"
        closeOverlay = false  // true: al click su OK si chiude anche overlay
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

    // classi di stato (per eventuali stili diversi)
    popup.classList.remove("is-success", "is-error", "is-info");
    popup.classList.add(
        type === "success" ? "is-success" :
            type === "error" ? "is-error" : "is-info"
    );

    // mostra popup + overlay
    popup.style.display = "flex";
    overlay.classList.add("overlayactive");

    // rimuovi vecchi listener dall'OK
    const okBtnClone = okBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(okBtnClone, okBtn);
    const newOkBtn = document.getElementById("successOkBtn");

    // click OK → chiude il popup
    newOkBtn.onclick = () => {
        popup.style.display = "none";
        if (closeOverlay) {
            overlay.classList.remove("overlayactive");
        }
    };

    // click overlay → non fa nulla (così l’utente deve premere OK)
    overlay.onclick = (e) => {
        if (e.target.id !== "overlay") return;
        // lasciamo overlay attivo sempre, finché non chiudi da OK
    };
}


function redirect(location) {
    window.location.href = location;
}



document.addEventListener('DOMContentLoaded', () => {
  window.redirect = window.redirect || function(url){ window.location.href = url; };
  window.goHome = window.goHome || function(){ window.location.href = "./homepage.php"; };

  loadScore();
  loadGoals();
  const okBtn = document.getElementById('gc-ok');
if (okBtn) okBtn.addEventListener('click', closeGoalCompletedModal);

});

/* ---------- utils ---------- */
function pick(obj, keys){
  for(const k of keys){ if(obj && obj[k] !== undefined && obj[k] !== null) return obj[k]; }
  return undefined;
}
function num(v){ const n = parseFloat(v); return isNaN(n) ? 0 : n; }

function fmtEUR(n){
  try { return new Intl.NumberFormat('en-GB', {style:'currency', currency:'EUR'}).format(Number(n||0)); }
  catch(e){ return (n||0) + " €"; }
}
function fmtDMY(iso){
  if(!iso) return '—';
  const m = String(iso).match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})/);
  if(m) return m[3] + '/' + m[2] + '/' + m[1];
  return iso;
}
function isCompleted(g){
  const saved  = num(pick(g, ['saved_amount','saved','current_saved','progress_saved','amount_saved']));
  const target = num(pick(g, ['target_amount','target','goal_target','amount_target']));
  return target > 0 && saved >= target;
}
function isMissed(g){
  const saved  = num(pick(g, ['saved_amount','saved','current_saved','progress_saved','amount_saved']));
  const target = num(pick(g, ['target_amount','target','goal_target','amount_target']));
  const deadline = pick(g, ['deadline','due_date','target_date']);
  const todayStr = new Date().toISOString().slice(0,10);
  return !!deadline && deadline < todayStr && saved < target;
}

function showGoalCompletedModal(){
  document.body.classList.add('modal-open');
  const ov = document.getElementById('goal-complete-overlay');
  if (ov) ov.classList.remove('hidden');
  loadScore();
}
function closeGoalCompletedModal(){
  const ov = document.getElementById('goal-complete-overlay');
  if (ov) ov.classList.add('hidden');
  document.body.classList.remove('modal-open');
}
function completedKey(id){ return `goal_completed_popup_${id}`; }


/* ---------- SVG icons (feather-like, stroke=currentColor) ---------- */
const ICON_TRASH = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <polyline points="3 6 5 6 21 6"></polyline>
  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
  <path d="M10 11v6M14 11v6"></path>
  <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
</svg>`;

const ICON_EDIT = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M12 20h9"></path>
  <path d="M16.5 3.5l4 4-11 11-4 1 1-4z"></path>
</svg>`;

const ICON_BELL = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
  <path d="M13.73 21a2 2 0 01-3.46 0"></path>
</svg>`;

const ICON_BELL_OFF = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M13.73 21a2 2 0 01-3.46 0"></path>
  <path d="M18 8a6 6 0 00-9.33-5"></path>
  <path d="M5.22 5.22C5 5.81 4.9 6.4 4.9 7c0 7-3 9-3 9h14"></path>
  <path d="M1 1l22 22"></path>
</svg>`;

const ICON_TROPHY = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M8 21h8"></path>
  <path d="M12 17v4"></path>
  <path d="M7 4h10v4a5 5 0 0 1-10 0V4z"></path>
  <path d="M5 8a2 2 0 1 1 0-4h2"></path>
  <path d="M19 8a2 2 0 1 0 0-4h-2"></path>
</svg>`;

/* ---------- reminders state (persist locally) ---------- */
function remindKey(id){ return `goal_remind_${id}`; }
function getRemindState(id){
  try{ const v = localStorage.getItem(remindKey(id)); if(v===null) return true; return v === '1'; }
  catch(e){ return true; }
}
function setRemindState(id, on){
  try{ localStorage.setItem(remindKey(id), on ? '1' : '0'); }catch(e){}
}
function renderBell(btn, on){
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  btn.title = on ? 'Disable reminder' : 'Enable reminder';
  btn.innerHTML = on ? ICON_BELL : ICON_BELL_OFF;
}

/* ---------- API calls ---------- */
async function loadScore(){
  try{
    const uid = (window.USER_ID && String(window.USER_ID).trim()) ? '&user_id=' + encodeURIComponent(window.USER_ID) : '';
    const res = await fetch('./api.php?path=goals_score' + uid);
    const data = await res.json();
    var green = document.querySelector('.score .card.green .num');
    var red   = document.querySelector('.score .card.red .num');
    if(green) green.textContent = (data && data.reached) ? data.reached : 0;
    if(red)   red.textContent   = (data && data.missed)  ? data.missed  : 0;
  }catch(e){ console.error('score error', e); }
}

async function loadGoals(){
  var listEl = document.querySelector('.list');
  if(!listEl) return;
  listEl.innerHTML = '';
  try{
    const uid = (window.USER_ID && String(window.USER_ID).trim()) ? '&user_id=' + encodeURIComponent(window.USER_ID) : '';
    const res = await fetch('./api.php?path=goals' + uid);
    const goals = await res.json();
    if(!Array.isArray(goals) || goals.length===0){
      listEl.innerHTML = '<p style="color:#6b7280;">No goals yet. Create a new goal.</p>';
      return;
    }

    const active = goals.filter(g => !(isCompleted(g) || isMissed(g)));
    if(active.length === 0){
      listEl.innerHTML = '<p style="color:#6b7280;">No active goals. Create a new goal.</p>';
      return;
    }

    active.forEach(function(g){
      const name = pick(g, ['name','goal_name','title']) || 'Goal';
      const deadline = pick(g, ['deadline','due_date','target_date']);
      const saved = num(pick(g, ['saved_amount','saved','current_saved','progress_saved','amount_saved']));
      const target = num(pick(g, ['target_amount','target','goal_target','amount_target']));
      const pct = target>0 ? Math.min(100, Math.round((saved/target)*100)) : 0;

      const item = document.createElement('article');
      item.className = 'goal';

      const left = document.createElement('div');
      left.className = 'left';
      const glyph = document.createElement('div');
      glyph.className = 'glyph trophy';

      const trophyImg = document.createElement('img');
      trophyImg.src = './images/icons8-trophy-96.png'; // <-- il tuo file
      trophyImg.alt = 'Goal';
      trophyImg.className = 'trophy-img';

      glyph.appendChild(trophyImg);
      left.appendChild(glyph);


      const mid = document.createElement('div');
      mid.className = 'mid';

      const nm = document.createElement('div');
      nm.className = 'name';
      nm.textContent = name;
      mid.appendChild(nm);

      const dl = document.createElement('div');
      dl.className = 'deadline';
      dl.textContent = 'Deadline ' + fmtDMY(deadline);
      mid.appendChild(dl);

      const bar = document.createElement('div');
      bar.className = 'bar';
      const fill = document.createElement('div');
      fill.className = 'fill';
      fill.style.width = pct + '%';
      bar.appendChild(fill);
      mid.appendChild(bar);

      const values = document.createElement('div');
      values.className = 'values';
      const sv = document.createElement('span');
      sv.className = 'saved';
      sv.textContent = fmtEUR(saved) + ' (saved)';
      const tg = document.createElement('span');
      tg.className = 'target';
      tg.textContent = fmtEUR(target) + ' (target)';
      values.appendChild(sv);
      values.appendChild(tg);
      mid.appendChild(values);

      const right = document.createElement('div');
      right.className = 'right';

      // Bell (toggle)
      const remind = document.createElement('button');
      remind.className = 'icon-btn';
      remind.setAttribute('type','button');
      remind.title = 'Remind';
      const initialOn = getRemindState(g.id);
      renderBell(remind, initialOn);
      remind.addEventListener('click', () => {
        const now = remind.getAttribute('aria-pressed') !== 'true';
        renderBell(remind, now);
        setRemindState(g.id, now);
      });

      // Edit (pencil)
      const edit = document.createElement('a');
      edit.className = 'icon-btn';
      edit.title = 'Edit';
      edit.href = './edit_goal.php?id=' + g.id;
      edit.innerHTML = ICON_EDIT;

      // Delete (trash)
      const del = document.createElement('button');
      del.className = 'icon-btn danger';
      del.title = 'Delete';
      del.setAttribute('type','button');
      del.innerHTML = ICON_TRASH;
      del.addEventListener('click', () => confirmDeleteGoal(g.id, name));

      // Add funds
      const addf = document.createElement('button');
      addf.className = 'icon-btnn';
      addf.setAttribute('type','button');
      addf.textContent = 'Add funds';
      addf.title = 'Add funds';
      addf.addEventListener('click', () => addFundsToGoal(g));
      left.appendChild(addf);

      right.appendChild(remind);
      right.appendChild(edit);
      right.appendChild(del);

      item.appendChild(left);
      item.appendChild(mid);
      item.appendChild(right);

      listEl.appendChild(item);
    });
  }catch(e){
    console.error('list error', e);
    listEl.innerHTML = '<p style="color:#ef4444;">Failed to load goals.</p>';
  }
}

async function confirmDeleteGoal(id, name){
  openConfirm({
    title: `Delete "${name}"?`,
    message: 'This will remove the goal and its contributions.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    confirmColor: '#ef4444', // rosso "danger"
    onConfirm: async () => {
      try{
        const res = await fetch('./api.php?path=delete_goal', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ id })
        });
        const data = await res.json();
        if(data && data.success){
          // opzionale: piccolo popup "Saved/Deleted"
          showPopup('Goal deleted', () => {
            loadGoals();
            if (typeof loadScore === 'function') loadScore(); // se hai i KPI
          });
          // refresh immediato comunque
          loadGoals();
          if (typeof loadScore === 'function') loadScore();
        }else{
          showPopup('Delete failed: ' + (data?.error || 'not found'));
        }
      }catch(e){
        console.error(e);
        showPopup('Network error');
      }
    }
  });
}


async function addFundsToGoal(g){
  const name = (g && (g.name || g.goal_name || g.title)) || 'goal';

  // chiedi l'importo con popup input
  const amount = await openAmountPrompt({
    title: 'Add funds',
    message: `How much do you want to add to “${name}”?`,
    placeholder: 'e.g. 100.00',
    confirmText: 'Add funds',
    cancelText: 'Cancel'
  });
  if (amount == null) return; // annullato

  // valori attuali dalla lista
  const saved0  = Number(pick(g, ['saved_amount','saved','current_saved','progress_saved','amount_saved']) ?? 0);
  const target0 = Number(pick(g, ['target_amount','target','goal_target','amount_target']) ?? 0);

  // check ottimistico
  const willReach = target0 > 0 && (saved0 + amount) >= target0;

  try{
    // 1) aggiungo i fondi
    const res = await fetch('./api.php?path=add_goal_funds', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ goal_id: g.id, amount, source: null })
    });
    const data = await res.json();
    if(!data || !data.success){
      showPopup('Error: ' + (data && data.error ? data.error : 'unknown'));
      return;
    }

    // 2) ricarico il goal aggiornato e verifico (no-cache!)
    const fres = await fetch('./api.php?path=goal&id=' + encodeURIComponent(g.id), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    const fdata = await fres.json();

    let finalSaved = saved0 + amount;
    let finalTarget = target0;

    if(fdata && fdata.success){
      const go = fdata.goal || fdata.data || fdata;
      finalSaved  = Number(go.saved_amount ?? go.saved ?? go.current_saved ?? go.progress_saved ?? go.amount_saved ?? finalSaved);
      finalTarget = Number(go.target_amount ?? go.target ?? go.goal_target ?? go.amount_target ?? finalTarget);
    }

    // Popup "goal completed" una sola volta
    const k = completedKey(g.id);
    if (finalTarget > 0 && finalSaved >= finalTarget){
      if(localStorage.getItem(k) !== '1'){
        localStorage.setItem(k, '1');
        showGoalCompletedModal();
      }
    }else if (willReach){
      if(localStorage.getItem(k) !== '1'){
        localStorage.setItem(k, '1');
        showGoalCompletedModal();
      }
    }

    // 3) feedback e refresh
    showPopup('Funds added', () => {
      loadGoals();
      if (typeof loadScore === 'function') loadScore();
    });
    loadGoals();
    if (typeof loadScore === 'function') loadScore();

  }catch(e){
    console.error(e);
    showPopup('Network error');
  }
}



/* ===== Popup "OK" stile add_transaction (1 bottone) ===== */
function showPopup(message, onOk){
  const ov = document.createElement('div');
  ov.setAttribute('role', 'dialog');
  ov.setAttribute('aria-modal', 'true');
  Object.assign(ov.style, {
    position:'fixed', inset:'0', background:'rgba(0,0,0,.45)',
    display:'flex', alignItems:'center', justifyContent:'center',
    zIndex:'9999', padding:'16px'
  });

  const card = document.createElement('div');
  Object.assign(card.style, {
    width:'min(92vw, 420px)', background:'#fff', borderRadius:'18px',
    boxShadow:'0 12px 28px rgba(0,0,0,.18)', padding:'18px 16px', textAlign:'center'
  });

  const p = document.createElement('p');
  p.textContent = String(message ?? '');
  Object.assign(p.style, { margin:'0 0 14px', color:'#374151', fontSize:'14px' });

  const ok = document.createElement('button');
  ok.type = 'button';
  ok.textContent = 'OK';
  Object.assign(ok.style, {
    border:'none', background:'#07e90e', color:'#fff', fontWeight:'800',
    padding:'12px 16px', borderRadius:'12px', cursor:'pointer',
    boxShadow:'0 6px 18px rgba(31,76,207,.25)'
  });
  ok.addEventListener('click', () => {
    try { document.body.removeChild(ov); } catch(_) {}
    document.body.style.overflow = '';
    if (typeof onOk === 'function') onOk();
  });

  card.appendChild(p);
  card.appendChild(ok);
  ov.appendChild(card);
  document.body.appendChild(ov);
  document.body.style.overflow = 'hidden';

  const onKey = (e) => {
    if (e.key === 'Escape') {
      try { document.body.removeChild(ov); } catch(_) {}
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    }
  };
  document.addEventListener('keydown', onKey);
}

/* ===== Popup di conferma (2 bottoni) riutilizzabile ===== */
function openConfirm(opts){
  const o = Object.assign({
    title: 'Are you sure?',
    message: 'This action cannot be undone.',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmColor: '#1f4ccf', // blu default
    onConfirm: null
  }, opts||{});

  const ov = document.createElement('div');
  ov.setAttribute('role', 'dialog');
  ov.setAttribute('aria-modal', 'true');
  Object.assign(ov.style, {
    position:'fixed', inset:'0', background:'rgba(0,0,0,.45)',
    display:'flex', alignItems:'center', justifyContent:'center',
    zIndex:'9999', padding:'16px'
  });

  const card = document.createElement('div');
  Object.assign(card.style, {
    width:'min(92vw, 420px)', background:'#fff', borderRadius:'18px',
    boxShadow:'0 12px 28px rgba(0,0,0,.18)', padding:'18px 16px', textAlign:'center'
  });

  const h = document.createElement('h2');
  h.textContent = o.title;
  Object.assign(h.style, { margin:'0 0 6px', fontSize:'20px', fontWeight:'800', color:'#0B4E92' });

  const p = document.createElement('p');
  p.textContent = o.message;
  Object.assign(p.style, { margin:'0 0 14px', color:'#374151', fontSize:'14px' });

  const row = document.createElement('div');
  Object.assign(row.style, { display:'flex', gap:'10px', justifyContent:'flex-end' });

  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.textContent = o.cancelText;
  Object.assign(cancel.style, {
    flex:'1 1 0', background:'#fff', color:'#111', border:'1px solid #e5e7eb',
    padding:'12px 16px', borderRadius:'12px', fontWeight:'700', cursor:'pointer'
  });
  cancel.addEventListener('click', close);

  const confirm = document.createElement('button');
  confirm.type = 'button';
  confirm.textContent = o.confirmText;
  Object.assign(confirm.style, {
    flex:'1 1 0', border:'none', background:o.confirmColor, color:'#fff',
    padding:'12px 16px', borderRadius:'12px', fontWeight:'800', cursor:'pointer',
    boxShadow:'0 6px 18px rgba(0,0,0,.15)'
  });
  confirm.addEventListener('click', () => {
    close();
    if (typeof o.onConfirm === 'function') o.onConfirm();
  });

  function close(){
    try { document.body.removeChild(ov); } catch(_) {}
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
  }

  ov.addEventListener('click', (e) => {
    const clickInside = card.contains(e.target);
    if (!clickInside) close();
  });

  const onKey = (e) => { if (e.key === 'Escape') close(); };

  row.appendChild(cancel);
  row.appendChild(confirm);
  card.appendChild(h);
  card.appendChild(p);
  card.appendChild(row);
  ov.appendChild(card);
  document.body.appendChild(ov);
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', onKey);
}


/* ===== Popup input (amount) – stile inline come gli altri ===== */
function openAmountPrompt(opts){
  const o = Object.assign({
    title: 'Add funds',
    message: '',
    placeholder: 'Amount (€)',
    confirmText: 'Add',
    cancelText: 'Cancel',
  }, opts||{});

  return new Promise(resolve => {
    const ov = document.createElement('div');
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    Object.assign(ov.style, {
      position:'fixed', inset:'0', background:'rgba(0,0,0,.45)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:'9999', padding:'16px'
    });

    const card = document.createElement('div');
    Object.assign(card.style, {
      width:'min(92vw, 420px)', background:'#fff', borderRadius:'18px',
      boxShadow:'0 12px 28px rgba(0,0,0,.18)', padding:'18px 16px', textAlign:'center'
    });

    const h = document.createElement('h2');
    h.textContent = o.title;
    Object.assign(h.style, { margin:'0 0 6px', fontSize:'20px', fontWeight:'800', color:'#0B4E92' });

    const p = document.createElement('p');
    p.textContent = o.message;
    Object.assign(p.style, { margin:'0 0 12px', color:'#374151', fontSize:'14px' });

    const input = document.createElement('input');
    input.type = 'number';
    input.inputMode = 'decimal';
    input.step = '0.01';
    input.placeholder = o.placeholder;
    Object.assign(input.style, {
      width:'100%', border:'1px solid #e5e7eb', borderRadius:'12px',
      padding:'12px 14px', fontSize:'16px', margin:'0 0 10px'
    });

    const err = document.createElement('div');
    err.textContent = '';
    Object.assign(err.style, { color:'#ef4444', fontSize:'12px', minHeight:'16px', margin:'0 0 6px' });

    const row = document.createElement('div');
    Object.assign(row.style, { display:'flex', gap:'10px', justifyContent:'flex-end' });

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.textContent = o.cancelText;
    Object.assign(cancel.style, {
      flex:'1 1 0', background:'#fff', color:'#111', border:'1px solid #e5e7eb',
      padding:'12px 16px', borderRadius:'12px', fontWeight:'700', cursor:'pointer'
    });

    const confirm = document.createElement('button');
    confirm.type = 'button';
    confirm.textContent = o.confirmText;
    Object.assign(confirm.style, {
      flex:'1 1 0', border:'none', background:'#22c55e', color:'#fff',
      padding:'12px 16px', borderRadius:'12px', fontWeight:'800', cursor:'pointer',
      boxShadow:'0 6px 18px rgba(0,0,0,.15)'
    });

    function close(v){
      try { document.body.removeChild(ov); } catch(_) {}
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      resolve(v);
    }

    cancel.addEventListener('click', () => close(null));
    confirm.addEventListener('click', () => {
      const raw = String(input.value || '').trim().replace(',', '.');
      const n = parseFloat(raw);
      if (!(n > 0)) {
        err.textContent = 'Please enter a valid amount';
        input.focus();
        return;
      }
      close(n);
    });

    const onKey = (e) => {
      if (e.key === 'Escape') close(null);
      if (e.key === 'Enter') confirm.click();
    };

    ov.addEventListener('click', (e) => { if (!card.contains(e.target)) close(null); });

    row.appendChild(cancel);
    row.appendChild(confirm);
    card.appendChild(h);
    if (o.message) card.appendChild(p);
    card.appendChild(input);
    card.appendChild(err);
    card.appendChild(row);
    ov.appendChild(card);
    document.body.appendChild(ov);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);

    setTimeout(() => input.focus(), 0);
  });
}

