<?php
session_start();
require_once "db_connection.php";

$user_id = $_SESSION['user_id'] ?? "1";
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Create New Goal – FinanceTrack</title>
  <link rel="stylesheet" href="create_goal.css" />
  <script>
    window.USER_ID = "<?php echo htmlspecialchars($user_id, ENT_QUOTES); ?>";
  </script>
  <script src="create_goal.js" defer></script>
</head>
<body>

  <header class="topbar">
    <h1>Create New Goal</h1>
    <button class="close" aria-label="Close" onclick="goBack()">✕</button>
  </header>

  <main class="container">
    <form id="goalForm" onsubmit="return handleSubmit(event)">
      <label class="field">
        <span class="label">Goal Name<span class="req">*</span></span>
        <input type="text" id="goalName" name="goalName" placeholder="Motorbike" required />
      </label>

      <label class="field">
        <span class="label">Goal Type</span>
        <div class="select">
          <select id="goalType" name="goalType">
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
        <input type="number" id="targetAmount" name="targetAmount" inputmode="decimal" step="0.01" placeholder="20000" />
        <span class="suffix">€</span>
      </label>

      <label class="field">
        <span class="label">Deadline<span class="req">*</span></span>
        <div class="date-wrap">
          <span class="cal-ico" aria-hidden="true">📅</span>
          <input type="date" id="deadline" name="deadline" required />
        </div>
      </label>

      <label class="field">
        <span class="label">Saving Source</span>
        <div class="select">
          <select id="savingSource" name="savingSource">
            <option>Main Wallet</option>
            <option>Credit Card</option>
            <option>Cash</option>
          </select>
          <span class="chev">▾</span>
        </div>
      </label>

      <button class="primary" type="submit">Save Goal</button>
    </form>
  </main>

</body>
</html>
