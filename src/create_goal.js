function goBack(){
  window.location.href = "./goals.php";
}

async function handleSubmit(e){
  e.preventDefault();
  const payload = {
    user_id: 1,
    name: document.getElementById('goalName').value.trim(),
    goal_type: document.getElementById('goalType').value,
    target_amount: parseFloat(document.getElementById('targetAmount').value || "0"),
    deadline: document.getElementById('deadline').value || null,
    saving_source: document.getElementById('savingSource').value
  };
  if(!payload.name){ alert("Goal name is required"); return false; }

  try{
    const res = await fetch('/api.php?path=create_goal', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if(data && data.success){
      alert('Goal created');
      goBack();
    }else{
      alert('Error: ' + (data.error || 'unknown'));
    }
  }catch(e){
    alert('Network error'); console.error(e);
  }
  return false;
}
