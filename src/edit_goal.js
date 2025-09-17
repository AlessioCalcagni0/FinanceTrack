function goBack(){ window.location.href = "./goals.php"; }

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
          showPopup('Goal deleted');
          // refresh immediato comunque
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
    const res = await fetch(`./api.php?path=goal&id=${window.GOAL_ID}`);
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
    const res = await fetch('./api.php?path=update_goal', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if(data && data.success){
      showPopupAndBack('Your changes have been saved');
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
  if(!(amount>0)){ showPopup('Invalid amount'); return; }

  const prevSaved = num(CURRENT_GOAL && CURRENT_GOAL.saved_amount);
  const target    = num(CURRENT_GOAL && CURRENT_GOAL.target_amount);
  const willComplete = target > 0 && prevSaved < target && (prevSaved + amount) >= target;

  const payload = {
    goal_id: window.GOAL_ID,
    amount,
    source: document.getElementById('savingSource').value
  };
  try{
    const res = await fetch('./api.php?path=add_goal_funds', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if(data && data.success){
      await loadGoal();
      if (willComplete) {
        showGoalCompletedModal();
      } else {
        showPopup('Funds added');
      }
    }else{
      alert('Error: ' + (data.error || 'unknown'));
    }
  }catch(e){ alert('Network error'); console.error(e); }
}

async function handleDeleteGoal(){
  if(!window.GOAL_ID) return;
  
  confirmDeleteGoal('Delete this goal?\nThis will remove the goal and all its contributions.');

  try{
    const res = await fetch('./api.php?path=delete_goal', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ id: window.GOAL_ID })
    });
    const data = await res.json();
    if(data && data.success){
      showPopup('Goal deleted');
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

function showPopupAndBack(message, categories = []) {
    // Overlay
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "9999"
    });

    // Box popup
    const popup = document.createElement("div");
    Object.assign(popup.style, {
      backgroundColor: "#ffffffff",
      color: "black",
      padding: "20px",
      borderRadius: "10px",
      maxWidth: "400px",
      width: "90%",
      maxHeight: "70%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      overflowY: "auto",
      boxSizing: "border-box",
      textAlign: "center"
    });

    // Messaggio
    const msg = document.createElement("p");
    msg.textContent = message;
    Object.assign(msg.style, {
      marginBottom: "15px",
      textAlign: "center",
      fontSize: "16px"
    });
    popup.appendChild(msg);

    // Lista categorie (se presente)
    if (Array.isArray(categories) && categories.length > 0) {
      const list = document.createElement("div");
      Object.assign(list.style, {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        height: "125px",
        overflowY: "auto",
        width: "100%",
        alignItems: "center"
      });

      categories.forEach(cat => {
        const box = document.createElement("div");
        Object.assign(box.style, {
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "4px 8px",
          border: "2px solid black",
          borderRadius: "8px",
          backgroundColor: "#152C5C",
          width: "80%",
          height: "50px",
          justifyContent: "center",
          flexShrink: 0
        });

        const iconContainer = document.createElement("div");
        Object.assign(iconContainer.style, {
          width: "35px",
          height: "35px",
          borderRadius: "50%",
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        });

        const iconImg = document.createElement("img");
        iconImg.src = cat.path;
        iconImg.alt = cat.name;
        Object.assign(iconImg.style, {
          width: "80%",
          height: "80%",
          objectFit: "contain",
          borderRadius: "50%"
        });
        iconContainer.appendChild(iconImg);

        const nameDiv = document.createElement("div");
        nameDiv.textContent = cat.name;
        Object.assign(nameDiv.style, {
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          color: "white",
          fontSize: "14px"
        });

        box.appendChild(iconContainer);
        box.appendChild(nameDiv);
        list.appendChild(box);
      });

      popup.appendChild(list);
    }

    // Bottone OK
    const btn = document.createElement("button");
    btn.textContent = "OK";
    Object.assign(btn.style, {
      backgroundColor: "#07e90e",
      border: "none",
      padding: "8px 16px",
      marginTop: "15px",
      cursor: "pointer",
      borderRadius: "5px",
      alignSelf: "center"
    });
    btn.addEventListener("click", () => goBack());

    popup.appendChild(btn);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
  }

  function showPopup(message, categories = []) {
    // Overlay
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "9999"
    });

    // Box popup
    const popup = document.createElement("div");
    Object.assign(popup.style, {
      backgroundColor: "#ffffffff",
      color: "black",
      padding: "20px",
      borderRadius: "10px",
      maxWidth: "400px",
      width: "90%",
      maxHeight: "70%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      overflowY: "auto",
      boxSizing: "border-box",
      textAlign: "center"
    });

    // Messaggio
    const msg = document.createElement("p");
    msg.textContent = message;
    Object.assign(msg.style, {
      marginBottom: "15px",
      textAlign: "center",
      fontSize: "16px"
    });
    popup.appendChild(msg);

    // Lista categorie (se presente)
    if (Array.isArray(categories) && categories.length > 0) {
      const list = document.createElement("div");
      Object.assign(list.style, {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        height: "125px",
        overflowY: "auto",
        width: "100%",
        alignItems: "center"
      });

      categories.forEach(cat => {
        const box = document.createElement("div");
        Object.assign(box.style, {
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "4px 8px",
          border: "2px solid black",
          borderRadius: "8px",
          backgroundColor: "#152C5C",
          width: "80%",
          height: "50px",
          justifyContent: "center",
          flexShrink: 0
        });

        const iconContainer = document.createElement("div");
        Object.assign(iconContainer.style, {
          width: "35px",
          height: "35px",
          borderRadius: "50%",
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        });

        const iconImg = document.createElement("img");
        iconImg.src = cat.path;
        iconImg.alt = cat.name;
        Object.assign(iconImg.style, {
          width: "80%",
          height: "80%",
          objectFit: "contain",
          borderRadius: "50%"
        });
        iconContainer.appendChild(iconImg);

        const nameDiv = document.createElement("div");
        nameDiv.textContent = cat.name;
        Object.assign(nameDiv.style, {
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          color: "white",
          fontSize: "14px"
        });

        box.appendChild(iconContainer);
        box.appendChild(nameDiv);
        list.appendChild(box);
      });

      popup.appendChild(list);
    }

    // Bottone OK
    const btn = document.createElement("button");
    btn.textContent = "OK";
    Object.assign(btn.style, {
      backgroundColor: "#07e90e",
      border: "none",
      padding: "8px 16px",
      marginTop: "15px",
      cursor: "pointer",
      borderRadius: "5px",
      alignSelf: "center"
    });
    btn.addEventListener("click", () => goBack());

    popup.appendChild(btn);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
  }