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
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sign Up – FinanceTrack</title>
  <link rel="stylesheet" href="signup.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
  <!-- ok tenerlo: fa solo il toggle dell'occhio -->
  <script src="signup.js"></script>
</head>
<body>
  <div class="container">
    <h1>FinanceTrack</h1>
    <h2>Create an account</h2>
    <p>Enter your credentials to sign up for this app</p>

    <!-- aggiunta class e id per binding pulito -->
    <form class="signup-form" id="signupForm">
      <label>Email</label>
      <!-- aggiunti id e name -->
      <input type="email" id="email" name="email" placeholder="Enter your email" required />

      <label>Password</label>
      <div class="password-field">
        <!-- aggiunto name="password" -->
        <input type="password" id="password" name="password" placeholder="Enter your password" required />
        <span class="eye-icon" onclick="togglePassword()">
          <i class="fa-solid fa-eye" id="togglePasswordIcon"></i>
        </span>
      </div>

      <label>Date of birth</label>
      <!-- aggiunti id/name e required per rispettare l’API -->
      <input type="date" id="birth" name="birth" required />

      <!-- box error dedicato, così niente “flash” -->
      <div id="signupError" style="display:none;color:#ef4444;margin-top:10px;font-size:14px;"></div>

      <button type="submit">Sign Up</button>
    </form>

    <div class="separator"><span>or</span></div>

    <p class="login-text">
      Already have an account?
      <a href="login.php">Sign in</a>
    </p>

    <button class="social-button google" type="button">
      <i class="fa-brands fa-google"></i>
      <span>Continue with Google</span>
    </button>

    <button class="social-button apple" type="button">
      <i class="fa-brands fa-apple"></i>
      <span>Continue with Apple</span>
    </button>


    <p class="terms">
      By signing up, you agree to our<br />
      <a href="terms.html">Terms of Service</a> and
      <a href="privacy.html">Privacy Policy</a>
    </p>
  </div>

  <!-- adapter che binda SOLO alla .signup-form -->
  <script src="auth_adapter.js" defer></script>
</body>
</html>
