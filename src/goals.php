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
<!-- Score Cards (modern) -->
<section class="score score--modern">
  <article class="card kpi green">
    <div class="kpi__icon" aria-hidden="true">
      <!-- Target icon -->
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="9"></circle>
        <circle cx="12" cy="12" r="5"></circle>
        <path d="M16 8l5-5M17 3h4v4"></path>
      </svg>
    </div>
    <div class="kpi__meta">
      <div class="kpi__label">Goals Reached</div>
      <div class="kpi__value num">0</div>
    </div>
  </article>

  <article class="card kpi red">
    <div class="kpi__icon" aria-hidden="true">
      <!-- X in circle -->
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M15 9l-6 6M9 9l6 6"></path>
      </svg>
    </div>
    <div class="kpi__meta">
      <div class="kpi__label">Goals Missed</div>
      <div class="kpi__value num">0</div>
    </div>
  </article>
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
  
  <!-- Goal Completed Overlay -->
<div id="goal-complete-overlay" class="gc-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="gc-title">
  <div class="gc-card">
    <div class="gc-illus">
      <span class="gc-emoji" aria-hidden="true">🏆</span>
      <div class="gc-check">✓</div>
    </div>
    <h2 id="gc-title" class="gc-title">Congratulations!</h2>
    <p class="gc-sub">You have achieved your goal.</p>
    <button id="gc-ok" class="gc-ok" type="button">OK</button>
  </div>
</div>
</body>
</html>
