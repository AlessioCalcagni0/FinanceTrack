let CURRENT_PHOTO = ""; // path relativo salvato in DB (es. "uploads/avatars/xxx.jpg")

document.addEventListener('DOMContentLoaded', () => {
  loadMe();

  // logout
  document.getElementById('btnLogout')?.addEventListener('click', async () => {
    try{
      await fetch(`http://${API_HOST}:8000/api.php?path=logout`);
    }catch(e){}
    location.href = './login.php';
  });
  

  // change photo
  const btnPhoto = document.getElementById('btnChangePhoto');
  const fileInput = document.getElementById('filePhoto');
  const avatarImg = document.getElementById('avatarImg');
  btnPhoto?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', async () => {
    if(!fileInput.files || !fileInput.files[0]) return;
    const file = fileInput.files[0];
    // preview
    const url = URL.createObjectURL(file);
    if (avatarImg) avatarImg.src = url;

    // upload
    const fd = new FormData();
    fd.append('photo', file);
    try{
      const res = await fetch(`http://${API_HOST}:8000/api.php?path=upload_photo`, { method:'POST', body: fd });
      const data = await res.json();
      if(res.ok && data.success){
        CURRENT_PHOTO = data.photo; // es. "uploads/avatars/xyz.jpg"
      }else{
        showPopup(data.error || 'Upload failed');
      }
    }catch(e){
      showPopup('Network error uploading photo');
    }
  });

  // save form
  document.getElementById('accountForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = document.getElementById('formError');
    if (err) { err.style.display='none'; err.textContent=''; }

    const payload = {
      name:    document.getElementById('name').value.trim(),
      surname: document.getElementById('surname').value.trim(),
      birth:   document.getElementById('birth').value,
      tel:     document.getElementById('tel').value.trim(),
      photo:   CURRENT_PHOTO || null
      // email non modificabile qui (se vuoi, aggiungiamo endpoint dedicato per cambio email)
    };

    if(!payload.name || !payload.surname || !payload.birth){
      if(err){ err.textContent='Please fill in required fields.'; err.style.display='block'; }
      return;
    }

    try{
      const res = await fetch(`http://${API_HOST}:8000/api.php?path=update_user`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if(!res.ok || !data.success){
        if(err){ err.textContent = data.error || 'Save failed.'; err.style.display='block'; }
        return;
      }
      showPopup('Profile updated');
      // opzionale: ricarica me
      await loadMe();
    }catch(e){
      if(err){ err.textContent='Network error.'; err.style.display='block'; }
    }
  });
});

async function loadMe(){
  try{
    const res = await fetch(`http://${API_HOST}:8000/api.php?path=me`);
    const data = await res.json();
    console.log("data:d",data);
    const u = data && data.user ? data.user : null;
    if(!u) return;

    document.getElementById('name').value = u.name || '';
    document.getElementById('surname').value = u.surname || '';
    document.getElementById('birth').value = (u.birth || '').slice(0,10);
    document.getElementById('tel').value = u.tel || '';
    document.getElementById('email').value = u.email || '';

    CURRENT_PHOTO = u.photo || '';
    const avatarImg = document.getElementById('avatarImg');
    if (avatarImg){
      if (CURRENT_PHOTO){
        // l'API salva "uploads/avatars/xxx.jpg" relativo alla root del progetto
        avatarImg.src = '../' + CURRENT_PHOTO;
      } else {
        avatarImg.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(defaultAvatarSVG(u.name, u.surname));
      }
    }
  }catch(e){ /* ignore */ }
}

function defaultAvatarSVG(name, surname){
  const initials = ((name||' ').charAt(0) + (surname||' ').charAt(0)).toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">
    <rect width="100%" height="100%" rx="48" ry="48" fill="#E5E7EB"/>
    <text x="50%" y="53%" text-anchor="middle" font-size="34" font-family="Inter, sans-serif" fill="#111" font-weight="800">${initials}</text>
  </svg>`;
}


  function goBack(){
    if (document.referrer && history.length > 1) {
      history.back();
    } else {
      window.location.href = './homepage.php'; // fallback: cambia se vuoi
    }
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



