
<?php
// carico dotenv (opzionale, se usi .env con phpdotenv)
require __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// recupero la variabile (può venire da .env o fallback)
$apiHost = $_ENV['DB_HOST'] ;
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
  <script> const API_HOST = "<?php echo $apiHost; ?>";</script>


  <!-- pass user id to JS -->
  <script>window.USER_ID = "1";</script>
  <script src="goals.js" defer></script>
</head>
<body>

   <div class="navbar">
        <!--THREE BARS MENU-->
        <div class="dropdown">
            <img id="menu" onclick="openMenu()" src="/images/icons8-menu-30.png" alt="menu missing">
            <img onclick="closeMenu()" class="back-arrow" src="/images/icons8-back-arrow-50.png" >

            <div id="menu-content" class="dropdown-content">
                <h2 style="margin-top: 50%;" onclick="redirect('/homepage.php')">Home</h2>
                <h2>Wallets</h2>
                <a href="/wallet_page.php">All Wallets</a>
                <a href="/sharedWallet.php">Shared Wallets</a>
                <a href="/cash_page.php">Cash Wallet</a>
                <!-- la sezione "Add Transaction" è stata temporaneamente sostituita con un riferimento agli account di tipo "cash". -->
                <h2>Insights</h2>
                <a href="/insights.php">Dashboard</a>
                <a href="/categories.php">Spending by Category</a>
                <h2>Goals</h2>
                <a onclick="closeMenu()">Overview</a>
                <a href="/create_goal.php">New Goal</a>
                <h2>Settings</h2>
            </div>
        </div>
        

        <div  id="title">Goals</div>
        
        <div style="display:flex; width:20%; justify-content:space-evenly">
            <!--NOTIFY BELL-->
            <svg id="bell" onclick="redirect('notification.html')" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <rect width="20" height="20" fill="url(#pattern0_30_198)"/>
                <defs>
                <pattern id="pattern0_30_198" patternContentUnits="objectBoundingBox" width="1" height="1">
                <use xlink:href="#image0_30_198" transform="translate(-0.00699301) scale(0.00699301)"/>
                </pattern>
                <image id="image0_30_198" width="145" height="143" preserveAspectRatio="none" xlink:href="data:image/png;base64,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"/>
                </defs>
            </svg>    
             <!--PROFILE ICON-->
            <img id="profile" src="" alt="profile missing">
        </div>

    </div>
    <div id="topbar"></div>


  <div id="overlay" class="overlay"></div>
        <div id="overlay-menu" class="overlay"></div>

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
    <div id="list" class="list">
      
    </div>

    <!-- Floating New Goal Button -->
    <a class="fab" href="./create_goal.php">New Goal</a>
  </main>

  
  
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


<div id="bottombar"></div>
    
    <div id="tabBar">
        <div class="bar-item" id="home">
            <img src="images/home.png" alt="Home">
            <span>Home</span>
        </div>
        <div class="bar-item" id="wallet-icon">
            <img src="images/wallets.png" alt="Wallets">
            <span>Wallets</span>
        </div>
        <div class="bar-item" id="goal-icon">
            <img src="images/goals.png" alt="Goals">
            <span>Goals</span>
        </div>
        <div class="bar-item" id="insights-icon">
            <img src="images/insights.png" alt="Insights">
            <span>Insights</span>
        </div>
        </div>


</body>
</html>