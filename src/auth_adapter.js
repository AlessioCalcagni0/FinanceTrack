// auth_adapter.js — page-scoped, no cross-binding, no error flash on success
(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const val = el => (el ? (el.value || '').trim() : '');

  // Page detection (robust): by path OR explicit form class
  const path = (location.pathname || '').toLowerCase();
  const explicitLoginForm  = $('.login-form');
  const explicitSignupForm = $('.signup-form');

  const onLoginPage  = explicitLoginForm || path.includes('login');
  const onSignupPage = explicitSignupForm || path.includes('signup') || path.includes('register');

  // Helpers
  function ensureErrorBox(form, id){
    let box = document.getElementById(id);
    if (!box) {
      box = document.createElement('div');
      box.id = id;
      box.style.cssText = 'color:#ef4444;margin-top:10px;font-size:14px;display:none;';
      form.appendChild(box);
    }
    return box;
  }
  function showErr(box, msg){ if(!box) return; box.textContent = msg || ''; box.style.display = msg ? 'block' : 'none'; }
  async function post(path, payload){
    const res = await fetch(`/api.php?path=${path}`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload || {})
    });
    let data = {};
    try { data = await res.json(); } catch(e){}
    return { ok: res.ok, data };
  }

  // Bind LOGIN only if clearly on login page
  function bindLogin(){
    const form = explicitLoginForm || $('form.login-form'); // explicit only
    if (!form) return;
    if (form.__bound) return; form.__bound = 'login';

    const emailEl = form.querySelector('#email, [name="email"], input[type="email"]');
    const passEl  = form.querySelector('#password, [name="password"], input[type="password"]');
    const submit  = form.querySelector('button[type="submit"], .primary, button');
    const errBox  = ensureErrorBox(form, 'loginError');

    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      showErr(errBox, ''); // clear
      if (submit) submit.disabled = true;

      const email = val(emailEl).toLowerCase();
      const password = val(passEl);
      if(!email || !password){
        showErr(errBox, 'Please enter email and password.');
        if (submit) submit.disabled = false;
        return;
      }

      try{
        const { ok, data } = await post('login', { email, password });
        if(!ok || !data.success){
          showErr(errBox, data.error || 'Invalid credentials');
          if (submit) submit.disabled = false;
          return;
        }
        // success: no error flash, go
        location.href = './homepage.php';
      }catch(err){
        showErr(errBox, 'Network error.');
        if (submit) submit.disabled = false;
      }
    });
  }

  // Bind SIGNUP only if clearly on signup page
  function bindSignup(){
    const form = explicitSignupForm || $('form.signup-form'); // explicit only
    if (!form) return;
    if (form.__bound) return; form.__bound = 'signup';

    const emailEl = form.querySelector('#email, [name="email"], input[type="email"]');
    const passEl  = form.querySelector('#password, [name="password"]');
    const pass2El = form.querySelector('#password2, [name="password2"]');
    const birthEl = form.querySelector('#birth, [name="birth"], input[type="date"]');
    const nameEl    = form.querySelector('#name, [name="name"]');
    const surnameEl = form.querySelector('#surname, [name="surname"]');
    const telEl     = form.querySelector('#tel, [name="tel"]');
    const submit  = form.querySelector('button[type="submit"], .primary, button');
    const errBox  = ensureErrorBox(form, 'signupError');

    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      showErr(errBox, ''); // clear
      if (submit) submit.disabled = true;

      const email = val(emailEl).toLowerCase();
      const password = val(passEl);
      const password2 = val(pass2El);
      const birth = val(birthEl);
      let name = val(nameEl);
      let surname = val(surnameEl);
      const tel = val(telEl);

      if(!email || !password || !birth){
        showErr(errBox, 'Please enter email, password and birth date.');
        if (submit) submit.disabled = false;
        return;
      }
      if (password2 && password !== password2){
        showErr(errBox, 'Passwords do not match.');
        if (submit) submit.disabled = false;
        return;
      }
      if(!name){ name = email.split('@')[0] || 'User'; }
      if(!surname){ surname = 'User'; }

      try{
        const { ok, data } = await post('signup', { name, surname, tel, birth, email, password });
        if(!ok || !data.success){
          showErr(errBox, data.error || 'Sign up failed.');
          if (submit) submit.disabled = false;
          return;
        }
        // success: no error flash
        location.href = './homepage.php';
      }catch(err){
        showErr(errBox, 'Network error.');
        if (submit) submit.disabled = false;
      }
    });
  }

  // Only one binding per page
  if (onLoginPage && !onSignupPage) {
    bindLogin();
  } else if (onSignupPage && !onLoginPage) {
    bindSignup();
  } else {
    // Ambiguo? Usiamo SOLO form con classi esplicite (per evitare doppi bind)
    bindLogin();
    bindSignup();
  }

  // Toggle password eye (se usi l’icona)
  window.togglePassword = window.togglePassword || function(){
    const input = document.getElementById("password");
    const icon  = document.getElementById("togglePasswordIcon");
    if (!input) return;
    const isPwd = input.type === "password";
    input.type = isPwd ? "text" : "password";
    if (icon) { icon.classList.toggle("fa-eye"); icon.classList.toggle("fa-eye-slash"); }
  };
})();
