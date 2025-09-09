document.addEventListener('DOMContentLoaded', () => {
  window.redirect = window.redirect || function(url){ window.location.href = url; };
  window.goHome = window.goHome || function(){ window.location.href = "./homepage.php"; };

  loadScore();
  loadGoals();
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

    // Show only active goals
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
      left.innerHTML = '<div class="glyph">🏆</div>';

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
      const remind = document.createElement('button');
      remind.className = 'icon-btn';
      remind.title = 'Remind';
      remind.textContent = '🔔';

      const edit = document.createElement('a');
      edit.className = 'icon-btn';
      edit.title = 'Edit';
      edit.href = './edit_goal.php?id=' + g.id;
      edit.textContent = '✎';

      const del = document.createElement('button');
      del.className = 'icon-btn danger';
      del.title = 'Delete';
      del.textContent = '🗑';
      del.addEventListener('click', () => confirmDeleteGoal(g.id, name));

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
