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
    const res = await fetch('/api.php?path=goals_score' + uid);
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
    const res = await fetch('/api.php?path=goals' + uid);
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
  const ok = confirm(`Delete "${name}"?\nThis will remove the goal and its contributions.`);
  if(!ok) return;
  try{
    const res = await fetch('/api.php?path=delete_goal', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({id})
    });
    const data = await res.json();
    if(data && data.success){
      loadGoals();
    }else{
      alert('Delete failed: ' + (data.error || 'not found'));
    }
  }catch(e){
    alert('Network error'); console.error(e);
  }
}

async function addFundsToGoal(g){
  const name = (g && (g.name || g.goal_name || g.title)) || 'goal';
  const val = prompt(`Add amount (€) to "${name}":`);
  if(!val) return;

  const amount = parseFloat(String(val).replace(',', '.')); // FIX 1: supporto virgola
  if(!(amount > 0)){ alert('Invalid amount'); return; }

  // valori attuali dalla lista
  const saved0  = Number(pick(g, ['saved_amount','saved','current_saved','progress_saved','amount_saved']) ?? 0);
  const target0 = Number(pick(g, ['target_amount','target','goal_target','amount_target']) ?? 0);

  // Controllo ottimistico: se già sappiamo che superiamo il target, prepariamoci a mostrare il popup
  const willReach = target0 > 0 && (saved0 + amount) >= target0; // FIX 2: check ottimistico

  try{
    // 1) aggiungo i fondi
    const res = await fetch('/api.php?path=add_goal_funds', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ goal_id: g.id, amount, source: null })
    });
    const data = await res.json();
    if(!data || !data.success){
      alert('Error: ' + (data && data.error ? data.error : 'unknown'));
      return;
    }

    // 2) ricarico il goal aggiornato e verifico (no-cache!)
    const fres = await fetch('/api.php?path=goal&id=' + encodeURIComponent(g.id), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' } // FIX 3: niente cache
    });
    const fdata = await fres.json();

    let finalSaved = saved0 + amount;
    let finalTarget = target0;

    if(fdata && fdata.success){
      const go = fdata.goal || fdata.data || fdata;
      finalSaved  = Number(go.saved_amount ?? go.saved ?? go.current_saved ?? go.progress_saved ?? go.amount_saved ?? finalSaved);
      finalTarget = Number(go.target_amount ?? go.target ?? go.goal_target ?? go.amount_target ?? finalTarget);
    }

    // Mostra popup (una sola volta per goal)
    if(finalTarget > 0 && finalSaved >= finalTarget){
      const k = completedKey(g.id);
      if(localStorage.getItem(k) !== '1'){
        localStorage.setItem(k, '1');
        showGoalCompletedModal();
      }
    }else if(willReach){
      // fallback: nel rarissimo caso in cui l'API non abbia ancora riflesso l'update
      const k = completedKey(g.id);
      if(localStorage.getItem(k) !== '1'){
        localStorage.setItem(k, '1');
        showGoalCompletedModal();
      }
    }

    // 3) aggiorno la lista
    loadGoals();

  }catch(e){
    alert('Network error'); console.error(e);
  }
}




