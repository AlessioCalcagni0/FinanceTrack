<?php
session_start();

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
    <button class="back" aria-label="Back" onclick="goBack()">←</button>
    <h1>Create New Goal</h1>
    <button id="tutorialBtn" class="help-btn">?</button>
  </header>

  <main class="container">
    <form id="goalForm" onsubmit="return handleSubmit(event)">
      <label class="field">
        <span class="label">Goal Name<span class="req">*</span></span>
        <input type="text" id="goalName" name="goalName" placeholder="New Goal Name" required />
      </label>

      <label class="field">
        <span class="label">Goal Type</span>
        <div class="select">
          <select id="goalType" name="goalType">
            <option value="" selected>Select a Type</option>
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
          <input type="number" id="targetAmount" name="targetAmount" inputmode="decimal" step="0.01" placeholder="20000" />
          <span class="suffix">€</span>
        </div>
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
            <option value="" selected>Select a Source</option>
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

  <!-- Tutorial -->
<div class="popup-tutorial" id="popup-tutorial" role="dialog" aria-modal="true" aria-labelledby="tutorial-description">
  <h1 class="title">How to add a cash transaction</h1>
  <button id="skipButton" class="skipButton" type="button">Skip</button>
  <img id="tutorial-image" alt="Step 1">
  <div class="description" id="tutorial-description"></div>
  <div class="buttons">
    <button class="back" id="backBtn" type="button" disabled>Back</button>
    <button class="next" id="nextBtn" type="button">Next</button>
  </div>
</div>

<div class="overlay" id="overlay-tutorial"></div>

</body>
</html>