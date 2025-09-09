function goBack(){ window.location.href = "./goals.php"; }

let CURRENT_GOAL = null;

document.addEventListener('DOMContentLoaded', () => {
  loadGoal();
  const okBtn = document.getElementById('gc-ok');
  if (okBtn) okBtn.addEventListener('click', () => {
    closeGoalCompletedModal();
    window.location.href = "./goals_history.php";
  });
});

function num(v){ const n = parseFloat(v); return isNaN(n) ? 0 : n; }

async function loadGoal(){
  if(!window.GOAL_ID) return;
  try{
    const res = await fetch(`/api.php?path=goal&id=${window.GOAL_ID}`);
    const g = await res.json();
    if(g && g.id){
      CURRENT_GOAL = g;
      document.getElementById('goalName').value = g.name || '';
      document.getElementById('goalType').value = g.goal_type || '';
      document.getElementById('targetAmount').value = g.target_amount || '';
      document.getElementById('deadline').value = g.deadline || '';
      document.getElementById('savingSource').value = g.saving_source || '';
    }
  }catch(e){ console.error('loadGoal', e); }
}

async function handleSubmit(e){
  e.preventDefault();
  const payload = {
    id: window.GOAL_ID,
    name: document.getElementById('goalName').value.trim(),
    goal_type: document.getElementById('goalType').value,
    target_amount: parseFloat(document.getElementById('targetAmount').value || "0"),
    deadline: document.getElementById('deadline').value || null,
    saving_source: document.getElementById('savingSource').value
  };
  try{
    const res = await fetch('/api.php?path=update_goal', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if(data && data.success){
      alert('Goal saved');
      goBack();
    }else{
      alert('Error: ' + (data.error || 'unknown'));
    }
  }catch(e){ alert('Network error'); console.error(e); }
  return false;
}

async function handleAddFunds(){
  const val = prompt("Add amount (€):");
  if(!val) return;
  const amount = parseFloat(val);
  if(!(amount>0)){ alert('Invalid amount'); return; }

  const prevSaved = num(CURRENT_GOAL && CURRENT_GOAL.saved_amount);
  const target    = num(CURRENT_GOAL && CURRENT_GOAL.target_amount);
  const willComplete = target > 0 && prevSaved < target && (prevSaved + amount) >= target;

  const payload = {
    goal_id: window.GOAL_ID,
    amount,
    source: document.getElementById('savingSource').value
  };
  try{
    const res = await fetch('/api.php?path=add_goal_funds', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if(data && data.success){
      await loadGoal();
      if (willComplete) {
        showGoalCompletedModal();
      } else {
        alert('Funds added');
      }
    }else{
      alert('Error: ' + (data.error || 'unknown'));
    }
  }catch(e){ alert('Network error'); console.error(e); }
}

async function handleDeleteGoal(){
  if(!window.GOAL_ID) return;
  const ok = confirm('Delete this goal?\nThis will remove the goal and all its contributions.');
  if(!ok) return;
  try{
    const res = await fetch('/api.php?path=delete_goal', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ id: window.GOAL_ID })
    });
    const data = await res.json();
    if(data && data.success){
      alert('Goal deleted');
      window.location.href = './goals.php';
    }else{
      alert('Delete failed: ' + (data.error || 'not found'));
    }
  }catch(e){ alert('Network error'); console.error(e); }
}

function showGoalCompletedModal(){
  document.body.classList.add('modal-open');
  const ov = document.getElementById('goal-complete-overlay');
  if (ov) ov.classList.remove('hidden');
}

function closeGoalCompletedModal(){
  const ov = document.getElementById('goal-complete-overlay');
  if (ov) ov.classList.add('hidden');
  document.body.classList.remove('modal-open');
}
