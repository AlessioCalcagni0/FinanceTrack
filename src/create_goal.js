function goBack(){
  window.location.href = "./goals.php";
}

async function handleSubmit(e){
  e.preventDefault();
  const targetRaw = document.getElementById('targetAmount').value || "0";
  const targetParsed = parseFloat(String(targetRaw).replace(',', '.')) || 0; // supporta 10,5

  const payload = {
    user_id: 1,
    name: document.getElementById('goalName').value.trim(),
    goal_type: document.getElementById('goalType').value,
    target_amount: targetParsed,
    deadline: document.getElementById('deadline').value || null,
    saving_source: document.getElementById('savingSource').value
  };
  if(!payload.name){ showPopup("Goal name is required"); return false; }

  try{
    const res = await fetch("./api.php?path=create_goal", {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if(data && data.success){
      // --- costruisci il messaggio del popup ---
      const parts = ["Goal created."];

      // se c'è una deadline futura, calcola la quota settimanale
      if (payload.deadline && payload.target_amount > 0) {
        const today = new Date();
        const dl = new Date(payload.deadline + 'T23:59:59');
        if (!isNaN(dl.getTime()) && dl > today) {
          const ms = dl - today;
          const weeks = Math.max(1, Math.ceil(ms / (1000*60*60*24*7))); // almeno 1 settimana
          const weekly = payload.target_amount / weeks;

          const weeklyText = new Intl.NumberFormat('en-GB', {
            style: 'currency', currency: 'EUR', maximumFractionDigits: 2
          }).format(weekly);

          parts.push(`To reach this goal you'll need to save ${weeklyText} per week.`);
        }
      }

      showPopupAndBack(parts.join('\n')); // \n verrà mostrato a capo (vedi fix sotto)
    }else{
      alert('Error: ' + (data.error || 'unknown'));
    }
  }catch(e){
    alert('Network error'); console.error(e);
  }
  return false;
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