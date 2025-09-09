<?php
session_start();
$user_id = $_SESSION['user_id'] ?? "1";
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Settings – FinanceTrack</title>
  <link rel="stylesheet" href="../wallet_page.css" />
  <link rel="stylesheet" href="settings.css" />
  <script src="../wallet_page.js"></script>
  <script src="settings.js" defer></script>
</head>
<body>

  <!-- Navbar identical to wallet_page -->
  <div class="navbar">
    <!--THREE BARS MENU-->
    <div class="dropdown">
      <img id="menu" onclick="openMenu()" src="../src/images/icons8-menu-30.png" alt="menu missing">
      <img onclick="closeMenu()" class="back-arrow" src="../src/images/icons8-back-arrow-50.png" >

      <div id="menu-content" class="dropdown-content">
        <h2 style="margin-top: 50%;" onclick="goHome()">Home</h2>
        <h2>Wallets</h2>
        <a href="../wallet_page.html">All Accounts</a>
        <a href="./sharedWallet.php">Shared Wallets</a>
        <a href="#">Cash Account</a>
        <h2>Insights</h2>
        <a href="./insights.php">Dashboard</a>
        <a href="../categories.html">Spending by Category</a>
        <h2>Goals</h2>
        <a href="#">Overview</a>
        <a href="#">New Goal</a>
        <h2>Settings</h2>
      </div>
    </div>

    <div id="title">Settings</div>

    <div class="nav-actions">
      <img id="bell" src="../src/images/icons8-notification-50.png" alt="notify"/>
      <img id="user" src="../src/images/icons8-user-48.png" alt="user"/>
    </div>
  </div>

  <!-- Content -->
  <main class="content">
    <section class="item">
      <h3><a href="mailto:support@financetrack.com">Contact Support</a></h3>
      <p>Reach out to our team for help with technical issues or questions. We usually respond within 24 hours.</p>
    </section>

    <section class="item">
      <h3><a href="privacy.html">Privacy Policy</a></h3>
      <p>Learn how we collect, store and protect your personal data. Your privacy is our top priority.</p>
    </section>

    <section class="item">
      <h3><a href="terms.html">Terms of Service</a></h3>
      <p>Review the rules that govern your use of the app. Using the app means you agree to these terms.</p>
    </section>

    <section class="item">
      <h3><a href="mailto:feedback@financetrack.com">Send Feedback</a></h3>
      <p>Provide feedback on your experience. We use your input to improve functionality.</p>
    </section>

    <div class="version">Version 1.0</div>
  </main>

  <!-- TabBar identical to wallet_page -->
  <div style="margin-top:100px;">
    <?php
    // include just the tabBar svg from wallet_page.html
    $wallet_html = file_get_contents(__DIR__ . '/../wallet_page.html');
    if (preg_match('/(<svg[^>]*id="tabBar"[^>]*>.*?<\\/svg>)/s', $wallet_html, $m)) {
      echo $m[1];
    }
    ?>
  </div>
</body>
</html>
