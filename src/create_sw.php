<?php
require_once "db_connection.php";
session_start();

// if (!isset($_SESSION['user_id'])) {
//     header("Location: login.php");
//     exit;
// }

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $wallet_name = $_POST['wallet_name'] ?? '';
    $icon = $_POST['icon'] ?? '';
    $color = $_POST['color'] ?? '';
    $role = $_POST['role'] ?? '';
    $permissions = $_POST['permissions'] ?? [];
    $participants = $_POST['participants'] ?? [];

    $user_id = $_SESSION['user_id'] ?? 1; // placeholder for demo

    $stmt = $pdo->prepare("
        INSERT INTO shared_wallets (user_id, wallet_name, icon, color,partecipant_num , partecipant_name_surname1,participant_role1, participant_permissions1) 
        VALUES (:user_id, :wallet_name, :icon, :color,1,'chiara', 'editor', 'write')
    ");
    $stmt->execute([
        ':user_id' => $user_id,
        ':wallet_name' => $wallet_name,
        ':icon' => $icon,
        ':color' => $color
    ]);

    echo "<p style='color:green'>Wallet created successfully!</p>";
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Create Shared Wallet</title>
<link rel="stylesheet" href="create_sw.css">
<script src="screate_sw.js"></script>

</head>
    <body>

        <div class="container">

            <button class="back-btn" onclick="goToSW()">
                <img src="./images/icons8-back-arrow-100.png" alt="">
                <div class="title"> Create a Shared Wallet </div>
            </button>
            <form method="POST" id="walletForm">

                <!-- Wallet Name -->
                <div class="section section-blue">
                    <label for="walletName">Insert a name:</label>
                    <input type="text" name="walletName" id="walletName" required>
                </div>
                
                
                <h3 class="hiddenName" id="edit">Edit the wallet</h3>
                <!-- Edit Wallet (hiddenName until walletName filled) -->
                <div class="section section-purple hiddenName" id="walletEdit">
                    <label >Choose an icon:</label>
                    <div class="icon-grid" >
                        <label class="icon-option">
                            <input type="radio" name="icon" value="icon1.png" required>
                            <img src="./images/sw2.png" alt="icon1">
                        </label>
                        <label class="icon-option">
                            <input type="radio" name="icon" value="icon2.png">
                            <img src="./images/sw1.png" alt="icon2">
                        </label>
                        <label class="icon-option">
                            <input type="radio" name="icon" value="icon3.png">
                            <img src="./images/sw3.png" alt="icon3">
                        </label>
                        <label class="icon-option">
                            <input type="radio" name="icon" value="icon3.png">
                            <img src="./images/sw4.png" alt="icon3">
                        </label>
                        <label class="icon-option">
                            <input type="radio" name="icon" value="icon3.png">
                            <img src="./images/sw5.png" alt="icon3">
                        </label>
                    </div>

                    <label>Select a color:</label>
                    <div class="color-grid" >
                        <label class="color-option">
                            <input type="radio" name="color" value="color1.png" required>
                            <img src="./images/white50.png" alt="icon1">
                        </label>
                        <label class="color-option">
                            <input type="radio" name="color" value="color2.png">
                            <img src="./images/purple50.png" alt="icon2">
                        </label>
                        <label class="color-option">
                            <input type="radio" name="color" value="color3.png">
                            <img src="./images/blue100.png" alt="icon3">
                        </label>
                        <label class="color-option">
                            <input type="radio" name="color" value="color4.png">
                            <img src="./images/green100.png" alt="icon3">
                        </label>
                        <label class="color-option">
                            <input type="radio" name="color" value="color5.png">
                            <img src="./images/yellow.png" alt="icon3">
                        </label>
                        <label class="color-option">
                            <input type="radio" name="color" value="color5.png">
                            <img src="./images/red.png" alt="icon3">
                        </label>
                        <label class="color-option">
                            <input type="radio" name="color" value="color6.png">
                            <img src="./images/black.png" alt="icon3">
                        </label>
                    </div>
                </div>

                
                <h3 class="hiddenName" id="selectPartecipants">Select participants</h3>
                <!-- Participants (hiddenName) -->
                <div class="section section-green hiddenName" id="participantsSection">
                    <img src="./images/icons8-profile-24.png" alt="">
                    <input type="text" name="participants[]" placeholder="Add participant email">
                    <button type="button" id="addParticipant">+ Add new participant</button>
                </div>

               
                <h3 class="hiddenContact"  id="selectRole">Select role and permissions</h3>
                <!-- Roles and Permissions (hiddenName) -->
                <div class="section section-yellow hiddenContact" id="rolesSection">
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

                <!-- Buttons -->
                <div class="actions">
                    <button type="reset" class="btn-cancel hiddenContact" id="cancel">Cancel</button>
                    <button type="submit" class="btn-confirm hiddenContact" id="confirm">Confirm</button>
                </div>
            </form>
        </div>
    </body>
</html>
