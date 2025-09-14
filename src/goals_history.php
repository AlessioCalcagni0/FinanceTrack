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
  /* Top bar senza hamburger, titolo centrato */
  .topbar{
    position: sticky; top: 0; z-index: 20;
    display: flex; align-items: center; justify-content: center;
    padding: 14px 16px; background: #fff; border-bottom: 1px solid #eee;
  }
  .topbar h1{
    margin: 0; font-size: 22px; font-weight: 800; color: #000;
  }
  .topbar .back{
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    text-decoration: none; color: #111; font-size: 20px;
    background:#fff; border:1px solid #e5e7eb; border-radius:10px; padding:6px 10px;
    box-shadow: 0 2px 6px rgba(0,0,0,.06);
  }
  .topbar .back:active{ transform: translateY(calc(-50% + 1px)); }

  /* --- ICONS (flat, no gray square) --- */
  .goal .left .glyph{
    width: 36px; height: 36px;
    display:flex; align-items:center; justify-content:center;
    background: none; border: none; padding: 0; /* <— niente quadratino */
  }
  .goal .left .glyph svg{ width: 28px; height: 28px; }
  .goal .left .glyph.completed{ color:#16a34a; } /* green */
  .goal .left .glyph.missed{ color:#ef4444; }   /* red   */

  /* Delete button look */
  .icon-btn{ display:inline-flex; align-items:center; justify-content:center;
    width:38px; height:38px; border:1px solid #e5e7eb; border-radius:10px; background:#fff; cursor:pointer; }
  .icon-btn svg{ width:20px; height:20px; }
  .icon-btn.danger{ border-color: #fff; }
  .icon-btn:active{ transform: translateY(1px); }
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
