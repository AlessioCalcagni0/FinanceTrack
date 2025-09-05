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

            <button class="back-btn" onclick="showPopup('', 'return');">
                <img src="./images/icons8-back-arrow-100.png" alt="">
                <div class="title"> Create a Shared Wallet </div>
            </button>
            <form method="POST" id="walletForm">

                <!-- Wallet Name -->
                 <div style="display: flex; flex-direction:row">
                    <h3>Insert a name</h3>
                    <img src="./images/icons8-info-squared-96.png" class="info-btn" data-info="Enter your real name here">
                
                 </div>
                 
                <div class="section section-blue" style="margin-top: 7px;">
                    <input type="text" name="walletName" placeholder="e.g. Wallet Name" id="walletName"required>
                </div>
                
                
                <h3 class="hiddenName" id="edit">Edit the wallet</h3>
                <!-- Edit Wallet (hiddenName until walletName filled) -->
                <div class="section section-purple " >
                    <h4 class="showName" id="h4_edit">Choose a name for the shared wallet to proceed</h4>
                    <div class="hiddenName" id="walletEdit">
                        <label >Choose an icon:</label>
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

                        <label>Select a color:</label>
                        <div class="color-grid" >
                            <label class="color-option">
                                <input type="radio" name="color" value="white" required>
                                <img src="./images/white50.png" alt="icon1">
                            </label>
                            <label class="color-option">
                                <input type="radio" name="color" value="purple">
                                <img src="./images/purple50.png" alt="icon2">
                            </label>
                            <label class="color-option">
                                <input type="radio" name="color" value="blue">
                                <img src="./images/blue100.png" alt="icon3">
                            </label>
                            <label class="color-option">
                                <input type="radio" name="color" value="green">
                                <img src="./images/green100.png" alt="icon3">
                            </label>
                            <label class="color-option">
                                <input type="radio" name="color" value="yellow">
                                <img src="./images/yellow.png" alt="icon3">
                            </label>
                            <label class="color-option">
                                <input type="radio" name="color" value="red">
                                <img src="./images/red.png" alt="icon3">
                            </label>
                            <label class="color-option">
                                <input type="radio" name="color" value="black">
                                <img src="./images/black.png" alt="icon3">
                            </label>
                        </div>
                    </div>
                </div>

                
                <h3 class="hiddenName" id="selectPartecipants">Select participants</h3>
                <!-- Participants (hiddenName) -->
                <div class="section section-green hiddenName" id="participantsSection">
                    <div id="input-partecipant">
                        <input type="text" name="participants[]" placeholder="Add participant email">
                        </div>
                        <div class="button-container" id="button-container"> 
                        <button class="button" type="button" id="addParticipant">+ Add participant</button>
                        </div>
                    </div>


               
                <h3 class="hiddenContact"  id="selectRole">Select role and permissions</h3>
                <!-- Roles and Permissions (hiddenName) -->
                <div class="section section-yellow hiddenName" id="rolesSectionC" >
                    <h4 class="showName hiddenName" id="h4_contact">Select at least a participant to proceed</h4>
                    <div class="hiddenContact " id="rolesSection">
                        <label>Select Role:</label>
                        <select name="role">
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                        </select>

                        <label>Select Permissions:</label>
                        <div>
                            <label><input type="checkbox" name="permissions[]" value="add"> Add</label>
                            <label><input type="checkbox" name="permissions[]" value="edit"> Edit</label>
                            <label><input type="checkbox" name="permissions[]" value="delete"> Delete</label>
                        </div>
                    </div>
                </div>

                <!-- Buttons -->
                <div class="actions">
                    <button class="btn-cancel hiddenContact" id="cancel">Cancel</button>
                    <button type="submit" class="btn-confirm hiddenContact" id="confirm">Confirm</button>
                </div>
            </form>
        </div>
    </body>
</html>
