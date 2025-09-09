let CURRENT_PHOTO = ""; // path relativo salvato in DB (es. "uploads/avatars/xxx.jpg")

document.addEventListener('DOMContentLoaded', () => {
  loadMe();

  // logout
  document.getElementById('btnLogout')?.addEventListener('click', async () => {
    try{
      await fetch('/api.php?path=logout');
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
      const res = await fetch('/api.php?path=upload_photo', { method:'POST', body: fd });
      const data = await res.json();
      if(res.ok && data.success){
        CURRENT_PHOTO = data.photo; // es. "uploads/avatars/xyz.jpg"
      }else{
        alert(data.error || 'Upload failed');
      }
    }catch(e){
      alert('Network error uploading photo');
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
      const res = await fetch('/api.php?path=update_user', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if(!res.ok || !data.success){
        if(err){ err.textContent = data.error || 'Save failed.'; err.style.display='block'; }
        return;
      }
      alert('Profile updated');
      // opzionale: ricarica me
      await loadMe();
    }catch(e){
      if(err){ err.textContent='Network error.'; err.style.display='block'; }
    }
  });
});

async function loadMe(){
  try{
    const res = await fetch('/api.php?path=me');
    if(res.status === 401){ location.href = './login.php'; return; }
    const data = await res.json();
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
