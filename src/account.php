<?php
session_start();

$user_id =  1 ;
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Account – FinanceTrack</title>

  <!-- Se vuoi navbar/tabbar identiche alla wallet, puoi includere i css della wallet qui -->
  <link rel="stylesheet" href="account.css"/>
  <script>
    window.USER_ID = "<?= htmlspecialchars($user_id, ENT_QUOTES) ?>";
  </script>
  <script src="account.js" defer></script>
</head>
<body>

  <!-- Header semplice senza burger -->
  <header class="topbar">
    <h1>Account</h1>
    <button id="btnLogout" class="logout">Log out</button>
  </header>

  <main class="container">
    <section class="card">
      <div class="avatar-wrap">
        <img id="avatarImg" class="avatar" src="" alt="Profile photo" />
        <button id="btnChangePhoto" class="change-photo" type="button">Change photo</button>
        <input id="filePhoto" type="file" accept="image/*" hidden />
      </div>

      <form id="accountForm" class="form">
        <div class="grid">
          <label class="field">
            <span class="label">First name</span>
            <input type="text" id="name" placeholder="Your name" required/>
          </label>
          <label class="field">
            <span class="label">Last name</span>
            <input type="text" id="surname" placeholder="Your surname" required/>
          </label>
        </div>

        <div class="grid">
          <label class="field">
            <span class="label">Birth date</span>
            <input type="date" id="birth" required/>
          </label>
          <label class="field">
            <span class="label">Phone (optional)</span>
            <input type="text" id="tel" placeholder="+39 333 1234567"/>
          </label>
        </div>

        <label class="field">
          <span class="label">Email</span>
          <input type="email" id="email" placeholder="you@example.com" disabled/>
        </label>

        <div id="formError" class="error" style="display:none;"></div>

        <button class="primary" type="submit">Save changes</button>
      </form>
    </section>
  </main>

</body>
</html>
