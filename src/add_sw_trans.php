
<?php
// carico dotenv (opzionale, se usi .env con phpdotenv)
require __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// recupero la variabile (può venire da .env o fallback)
$apiHost = $_ENV['DB_HOST'] ;
?>
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Transaction</title>
    <link rel="stylesheet" href="add_sw_trans.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <script> const API_HOST = "<?php echo $apiHost; ?>";</script>
    <script src="add_sw_trans.js"></script>
</head>
<body>
  
    <div class="navbar">
        <!--THREE BARS MENU-->
        <img src="images/BackArrow.png" id="back-arrow">

    </div>
    
    <div class="main">
        <div class="title">
            <h1 class="title">Add shared transaction</h1>
        </div>
        <label class="label">Enter the name of the transaction</label>
        <input class="name_input" placeholder="Type the name here" maxlength="12" >
        <label class="label">Enter the amount</label>
        <div class="input-wrapper">
            <input class="number_input" type="number" min="0" max="9999" placeholder="Enter the amount spent                                                                     €" required>
        </div>

        <!-- Chi fa la transazione -->
        <label class="label" style="margin-top: 19px;">Who made the transaction?</label>
        <div id="payerSection" class="participants-list">
           

        </div>



        <!-- Bottone per attivare la divisione personalizzata -->
         <label class="label" style="margin-top: 19px;">Divided by  <button id="tutorialBtn" class="help-btn" style="display: block;">?</button></label>

        <!-- Sezione nascosta di default -->
        <div id="customSplitSection" class="custom-split">
            <div id="splitSection" class="participants-list">
                   
            </div>
        </div>

        
        
        <div class="end_operation">
            <button class="cancel_button" id="cancel_button">Cancel</button>
            <button class="confirm_button" id="confirm_button">Confirm</button>
        </div>
    </div>

    
    <div class="popup" id="confirm-popup">
        <img src="images/Green_Tick.png">
        <p>Your cash transaction has been saved.</p>
        <button id="ok-button" onclick="closeConfirmPopup()">OK</button>
    </div>
    <div id="overlay" class="overlay"></div>

    <div class="popup" id="warning-popup">
        <img src="images/Warning.png">
        <p>Your cash transaction has been saved but you have reached the budget limits for the following categories: </p>
        <button id="ok-button" onclick="closeWarningPopup()">OK</button>
    </div>
    <div id="overlay" class="overlay"></div>
    <div id="error-banner" class="hidden"></div>

    
    <div class="popup-tutorial" id="popup-tutorial">
            <h1 class="title">How to add a cash transaction</h1>
            <button id="skipButton" class="skipButton">
                Skip <i class="fa-solid fa-forward"></i>
            </button>
            <img id="tutorial-image"  alt="Step 1">
            <div class="description" id="tutorial-description"></div>
                <div class="buttons">
                    <button class="back" id="backBtn" disabled>Back</button>
                    <button class="next" id="nextBtn">Next</button>
                </div>
            </div>
    </div>

    <div class="overlay" id="overlay-tutorial"></div>

    <div class="popup-cancel" id="popup-cancel">
        <h1>Are you sure to cancel the operation?</h1>
        <button class="confirm" id="keep" >Keep data</button>
        <button class="cancel"  id="lose" >Lose changes</button>
    </div> 

</body>

</html>