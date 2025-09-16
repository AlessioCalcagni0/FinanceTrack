document.addEventListener('DOMContentLoaded', () => {
  loadHistory();
});

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

/* --- SVG icons (stroke, inherit color) --- */
const ICON_CHECK = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="10"></circle>
  <path d="M8 12l2.5 2.5L16 9"></path>
</svg>`;

const ICON_X = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="10"></circle>
  <path d="M15 9l-6 6M9 9l6 6"></path>
</svg>`;

const ICON_TRASH = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <polyline points="3 6 5 6 21 6"></polyline>
  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
  <path d="M10 11v6M14 11v6"></path>
  <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
</svg>`;

async function loadHistory(){
  const uid = (window.USER_ID && String(window.USER_ID).trim()) ? '&user_id=' + encodeURIComponent(window.USER_ID) : '';
  const res = await fetch('./api.php?path=goals' + uid);
  const goals = await res.json();

  const completed = Array.isArray(goals) ? goals.filter(isCompleted) : [];
  const missed    = Array.isArray(goals) ? goals.filter(isMissed)    : [];

  renderList(document.getElementById('completed'), completed, 'completed');
  renderList(document.getElementById('missed'), missed, 'missed');
}

function renderList(container, items, kind){
  container.innerHTML = '';
  if(!items || !items.length){
    container.innerHTML = '<p style="color:#6b7280;">No items.</p>';
    return;
  }
  items.forEach(g => {
    const name = pick(g, ['name','goal_name','title']) || 'Goal';
    const deadline = pick(g, ['deadline','due_date','target_date']);
    const saved = num(pick(g, ['saved_amount','saved','current_saved','progress_saved','amount_saved']));
    const target = num(pick(g, ['target_amount','target','goal_target','amount_target']));
    const pct = target>0 ? Math.min(100, Math.round((saved/target)*100)) : 0;

    const card = document.createElement('article');
    card.className = 'goal';

    const left = document.createElement('div');
    left.className = 'left';
    const glyph = document.createElement('div');
    glyph.className = 'glyph ' + (kind === 'completed' ? 'completed' : 'missed');
    glyph.innerHTML = (kind === 'completed') ? ICON_CHECK : ICON_X;
    left.appendChild(glyph);

    const mid = document.createElement('div');
    mid.className = 'mid';

    const nm = document.createElement('div');
    nm.className = 'name';
    nm.textContent = name;

    const dl = document.createElement('div');
    dl.className = 'deadline';
    dl.textContent = 'Deadline ' + fmtDMY(deadline);

    const bar = document.createElement('div');
    bar.className = 'bar';
    const fill = document.createElement('div');
    fill.className = 'fill';
    fill.style.width = pct + '%';
    bar.appendChild(fill);

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

    const right = document.createElement('div');
    right.className = 'right';
    const del = document.createElement('button');
    del.className = 'icon-btn danger';
    del.title = 'Delete';
    del.innerHTML = ICON_TRASH;
    del.addEventListener('click', () => confirmDeleteGoal(g.id, name));

    mid.appendChild(nm);
    mid.appendChild(dl);
    mid.appendChild(bar);
    mid.appendChild(values);

    card.appendChild(left);
    card.appendChild(mid);
    card.appendChild(right);
    right.appendChild(del);

    container.appendChild(card);
  });
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
        // URL robusto rispetto alla pagina corrente
        const API = new URL('api.php', window.location.href).toString();

        const res = await fetch(`${API}?path=delete_goal`, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ id }),
          cache: 'no-store'
        });

        // leggi raw e prova a fare parse: se non è JSON, log utili in console
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); }
        catch(parseErr){
          console.error('Delete goal: risposta non-JSON', { status: res.status, text });
          showPopup('Server error. Please try again.');
          return;
        }

        if(data && data.success){
          showPopup('Goal deleted', () => { if (typeof loadHistory === 'function') loadHistory(); });
          if (typeof loadHistory === 'function') loadHistory(); // refresh immediato
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

