<?php
session_start();
$user_id = $_SESSION['user_id'] ?? "1";
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Goals History – FinanceTrack</title>

  <link rel="stylesheet" href="../wallet_page.css" />
  <link rel="stylesheet" href="goals.css" />

  <style>
    /* Simple top bar without hamburger */
    .topbar{
      position: sticky; top: 0; z-index: 20;
      display: flex; align-items: center; gap: 10px;
      padding: 14px 16px; background: #fff; border-bottom: 1px solid #eee;
    }
    .topbar h1{
      margin: 0; font-size: 22px; font-weight: 800; color: #000;
    }
    .topbar .back{
      text-decoration: none; color: #111; font-size: 20px;
      background:#fff; border:1px solid #e5e7eb; border-radius:10px; padding:6px 10px;
      box-shadow: 0 2px 6px rgba(0,0,0,.06);
    }
    .topbar .back:active{ transform: translateY(1px); }
  </style>

  <script src="../wallet_page.js"></script>
  <script>window.USER_ID = "<?= htmlspecialchars($user_id, ENT_QUOTES) ?>";</script>
  <script src="goals_history.js" defer></script>
</head>
<body>

  <!-- Clean header: back + title (no hamburger) -->
  <header class="topbar">
    <a class="back" href="./goals.php" aria-label="Back to Goals">←</a>
    <h1>Goals History</h1>
  </header>

  <main class="content">
    <h2 class="section-title">Completed</h2>
    <section id="completed" class="list"></section>

    <h2 class="section-title" style="margin-top:22px;">Missed</h2>
    <section id="missed" class="list"></section>

    <div style="height:80px"></div>
  </main>

  <!-- Keep the bottom tab bar identical to Wallet -->
  <div class="tabbar-wrap">
    <?php
    $wallet_html = @file_get_contents(__DIR__ . '/../wallet_page.html');
    if ($wallet_html && preg_match('/(<svg[^>]*id="tabBar"[^>]*>.*?<\\/svg>)/is', $wallet_html, $m2)) {
      echo $m2[1];
    }
    ?>
  </div>

</body>
</html>
