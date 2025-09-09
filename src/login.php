<?php
session_start();
// Se sei già loggato vai in home (cambia destinazione se vuoi Goals)
if (isset($_SESSION['user_id'])) {
  header("Location: ./homepage.php");
  exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Log In – FinanceTrack</title>
  <link rel="stylesheet" href="login.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
  <!-- RIMOSSO: <script src="login.js"></script> (duplicato) -->
</head>
<body>
  <div class="container">
    <h1>FinanceTrack</h1>
    <h2>Log into your account</h2>
    <p>Enter your credentials to log in for this app</p>

    <form class="login-form" id="loginForm">
      <label>Email</label>
      <input type="email" id="email" name="email" placeholder="Enter your email" required />

      <label>Password</label>
      <div class="password-field">
        <input type="password" id="password" name="password" placeholder="Enter your password" required />
        <span class="eye-icon" onclick="togglePassword()">
          <i class="fa-solid fa-eye" id="togglePasswordIcon"></i>
        </span>
      </div>

      <button type="submit">Log In</button>
      <!-- opzionale: un box errori dedicato per evitare “flash” -->
      <div id="loginError" style="display:none;color:#ef4444;margin-top:10px;font-size:14px;"></div>
    </form>

    <div class="forgot">
      <a href="#">Forgotten password?</a>
    </div>

    <div class="separator"><span>or</span></div>

    <button class="social-button google" type="button">
      <i class="fa-brands fa-google"></i>
      <span>Continue with Google</span>
    </button>

    <button class="social-button apple" type="button">
      <i class="fa-brands fa-apple"></i>
      <span>Continue with Apple</span>
    </button>


    <p class="signup-text">
      Don't have an account?
      <a href="signup.php">Sign up</a>
    </p>
  </div>

  <!-- tieni SOLO questi due script -->
  <script src="login.js"></script>
  <script src="auth_adapter.js" defer></script>
</body>
</html>
