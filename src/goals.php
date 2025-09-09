<?php
session_start();
$user_id = $_SESSION['user_id'] ?? "1";
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Goals – FinanceTrack</title>

  <!-- Keep Wallet styles if you want identical navbar/tabbar -->
  <link rel="stylesheet" href="../wallet_page.css" />
  <link rel="stylesheet" href="goals.css" />

  <script src="../wallet_page.js"></script>

  <!-- pass user id to JS -->
  <script>window.USER_ID = "<?= htmlspecialchars($user_id, ENT_QUOTES) ?>";</script>
  <script src="goals.js" defer></script>
</head>
<body>

  <?php
  // Reuse the wallet navbar but force the title to "Goals"
  $wallet_html = @file_get_contents(__DIR__ . '/../wallet_page.html');
  if ($wallet_html && preg_match('/(<div class="navbar">.*?<\\/div>)/s', $wallet_html, $m)) {
    $nav = preg_replace('/(<div id="title"[^>]*>)(.*?)(<\\/div>)/i', '$1Goals$3', $m[1]);
    echo $nav ?: $m[1];
  } else {
    echo '<div class="navbar"><div id="title" style="color:#000;font-weight:800;">Goals</div></div>';
  }
  ?>

  <main class="content">
    <!-- Score Cards -->
    <section class="score">
      <div class="card green">
        <div class="icon">🎯</div>
        <div class="title">Goals Reached</div>
        <div class="num">0</div>
      </div>
      <div class="center-pill">Current<br/>Score</div>
      <div class="card red">
        <div class="icon">❌</div>
        <div class="title">Goals Missed</div>
        <div class="num">0</div>
      </div>
    </section>

    <a class="history" href="./goals_history.php">View History</a>

    <h2 class="section-title">Goals list</h2>

    <!-- Filled by JS -->
    <section class="list"></section>

    <!-- Floating New Goal Button -->
    <a class="fab" href="./create_goal.php">New Goal</a>
  </main>

  <div class="tabbar-wrap">
    <?php
    if ($wallet_html && preg_match('/(<svg[^>]*id="tabBar"[^>]*>.*?<\\/svg>)/is', $wallet_html, $m2)) {
      echo $m2[1];
    }
    ?>
  </div>
</body>
</html>
