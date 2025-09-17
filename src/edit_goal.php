<?php
session_start();
$user_id = $_SESSION['user_id'] ?? "1";
$goalId = isset($_GET['id']) ? intval($_GET['id']) : 0;
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Edit Goal – FinanceTrack</title>
  <script src="/pwa.js"></script>

  <link rel="manifest" href="/manifest.json">
  <link rel="stylesheet" href="edit_goal.css" />
  <script>
    window.USER_ID = "<?= htmlspecialchars($user_id, ENT_QUOTES) ?>";
    window.GOAL_ID = <?= json_encode($goalId) ?>;
  </script>
  <script src="edit_goal.js" defer></script>
</head>
<body>

  <header class="topbar">
    <button class="back" aria-label="Back" onclick="goBack()">←</button>
    <h1 style="color:#0B4E92;">Edit Goal</h1>
  </header>

  <main class="container">
    <form id="goalForm" onsubmit="return handleSubmit(event)">
      <label class="field">
        <span class="label">Goal Name<span class="req">*</span></span>
        <input type="text" id="goalName" name="goalName" placeholder="Current Goal Name" required />
      </label>

      <label class="field">
        <span class="label">Goal Type</span>
        <div class="select">
          <select id="goalType" name="goalType">
            <option value="" selected>Current Type</option>
            <option value="purchase">Purchase</option>
            <option value="travel">Travel</option>
            <option value="education">Education</option>
            <option value="saving">Saving</option>
            <option value="other">Other</option>
          </select>
          <span class="chev">▾</span>
        </div>
      </label>

      <label class="field">
        <span class="label">Target Savings Amount</span>
        <div class="input-affix">
          <input type="number" id="targetAmount" name="targetAmount" inputmode="decimal" step="0.01" placeholder="Current Target" />
          <span class="suffix">€</span>
        </div>
      </label>

      <label class="field">
        <span class="label">Deadline<span class="req">*</span></span>
        <div class="date-wrap">
          <span class="cal-ico" aria-hidden="true">📅</span>
          <input type="date" id="deadline" name="deadline" placeholder="Current Deadline" required />
        </div>
      </label>

      <label class="field">
        <span class="label">Saving Source</span>
        <div class="select">
          <select id="savingSource" name="savingSource">
            <option value="" selected>Current Source</option>
            <option>Main Wallet</option>
            <option>Credit Card</option>
            <option>Cash</option>
          </select>
          <span class="chev">▾</span>
        </div>
      </label>

      <div class="form-actions">
        <button class="danger" type="button" onclick="handleDeleteGoal()">Delete Goal</button>
        <button class="primary" type="submit">Save Goal</button>
      </div>
    </form>
  </main>

  <!-- Overlay “goal completed” (facoltativo) -->
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