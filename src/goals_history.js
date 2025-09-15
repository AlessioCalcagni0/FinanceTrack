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
  const res = await fetch('/api.php?path=goals' + uid);
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
  const ok = confirm(`Delete "${name}"?\nThis will remove the goal and its contributions.`);
  if(!ok) return;
  try{
    const res = await fetch('/api.php?path=delete_goal', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({id})
    });
    const data = await res.json();
    if(data && data.success){
      loadHistory();
    }else{
      alert('Delete failed: ' + (data.error || 'not found'));
    }
  }catch(e){
    alert('Network error'); console.error(e);
  }
}