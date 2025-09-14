<?php
// carico dotenv (opzionale, se usi .env con phpdotenv)
require __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// recupero la variabile (può venire da .env o fallback
$apiHost = $_ENV['DB_HOST'] ;
?>


<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Create Shared Wallet</title>
<link rel="stylesheet" href="create_sw.css">
<script src="create_sw.js"></script>

</head>
    <body>

        <div class="container">

            <button class="back-btn" onclick="showCancelPopup('true');">
                <img src="./images/icons8-back-arrow-100.png" alt="">
                <div class="title"> Create a Shared Wallet </div>
            </button>
            <form method="POST" id="walletForm">

                <!-- Wallet Name -->
                 <div style="display: flex; flex-direction:row">
                    <h3>Insert a name</h3> 
                    <button id="tutorialBtn" class="help-btn" style="display: block;">?</button>                
                 </div>
                 
                <div class="section section-blue" style="margin-top: 7px;">
                    <input type="text" name="walletName" placeholder="e.g. Wallet Name" id="walletName"required> 
                </div>
                
                
                <h3 class="hiddenName" id="edit">Edit the wallet</h3>
                <!-- Edit Wallet (hiddenName until walletName filled) -->
                <div class="section section-purple " >
                    <h4  style="text-align:center; color:white;" class="showName" id="h4_edit">Choose a name for the shared wallet to proceed</h4>
                    <div class="hiddenName" id="walletEdit">
                        <label >Choose an icon (optional)</label>
                        <div class="icon-grid" >
                            <label class="icon-option">
                                <input type="radio" name="icon" value="sw1.png" required>
                                <img src="./images/sw2.png" alt="icon1">
                            </label>
                            <label class="icon-option">
                                <input type="radio" name="icon" value="sw2.png">
                                <img src="./images/sw1.png" alt="icon2">
                            </label>
                            <label class="icon-option">
                                <input type="radio" name="icon" value="sw3.png">
                                <img src="./images/sw3.png" alt="icon3">
                            </label>
                            <label class="icon-option">
                                <input type="radio" name="icon" value="sw4.png">
                                <img src="./images/sw4.png" alt="icon3">
                            </label>
                            <label class="icon-option">
                                <input type="radio" name="icon" value="sw5.png">
                                <img src="./images/sw5.png" alt="icon3">
                            </label>
                        </div>
                        
                    </div>
                </div>

                <div class="hiddenName"  id="selectPartecipants" style=" flex-direction:row">
                    <h3 >Select participants</h3>
                    <button id="tutorialBtn" class="help-btn" style="display: block;">?</button>                
                </div>
                
                <!-- Participants (hiddenName) -->
                <div class="section section-green hiddenName" id="participantsSection">
                    <div id="input-partecipant">
                        <label for="">Participant 1
                        <input type="text" name="participants[]" placeholder="Add participant email"> </label>
                        </div>
                        <div class="button-container" id="button-container"> 
                        <button class="button" type="button" id="addParticipant">+ Add participant</button>
                        </div>
                    </div>


               
                <h3 class="hiddenName"  id="selectRole">Select role </h3>
                <!-- Roles and Permissions (hiddenName) -->
                <div class="section section-yellow hiddenName" id="rolesSectionC" >
                    <h4 class="showName hiddenName" style="text-align:center;color:white" id="h4_contact">Select at least a participant to proceed</h4>
                    <div class="hiddenContact " id="rolesSection">
                        <label>Partecipant 1</label>
                        <select name="role" class="role">
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                        </select>

                        
                    </div>
                </div>

                <!-- Buttons -->
                <div class="actions">
                    <button class="btn-cancel hiddenContact" id="cancel">Cancel</button>
                    <button type="submit" class="btn-confirm hiddenContact" id="confirm">Confirm</button>
                </div>
            </form>

    <div id="overlay-cancel" class="overlay " style="z-index: 90;"></div> 
    <div class="popup-cancel" id="popup-cancel">
        <h1>Are you sure to cancel the operation?</h1>
        <button class="confirm" id="keep" >Keep data</button>
        <button class="cancel"  id="lose" >Lose changes</button>
    </div> 
        </div>
    </body>
</html>