function goToSW() {
  showPopup("", "return");
}

// --- Popup function ---
function showPopup(messages, type) {
  let popup = document.getElementById("popup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "popup";
    document.body.appendChild(popup);
  }
  if (type == "reset") {
    popup.innerHTML = " <span class='close-btn' onclick='hidePopup()'> <img src='./images/icons8-exit-button-50.png'> </span>" +
      "<h3>Cancel form?</h3> <h4>All your data will be lost</h4> <button id='popupOk'>Keep editing</button><button  id='popupReset' >Lose changes</button>";
  }
  else if (type == "warning") {
    popup.innerHTML = " <span class='close-btn' onclick='hidePopup()'> <img src='./images/icons8-exit-button-50.png'> </span>" +
      "<h3>Warining!</h3> <h4>Incorrect field</h4> <ul>" + messages.map(m => `<li>${m}</li>`).join("") + "</ul> <button id='popupOk'>OK</button>";
  }
  if (type == "return") {
    popup.innerHTML = " <span class='close-btn' onclick='hidePopup()'> <img src='./images/icons8-exit-button-50.png'> </span>" +
      "<h3>Exit form?</h3> <h4>All your data will be lost</h4> <button id='popupOk'>Keep editing</button><button id='popupReset' >Lose changes</button>";
  }

  popup.style.display = "block";
  popup.classList.add("popup-error");

  const resetBtn = document.getElementById("popupReset");
  if (resetBtn) resetBtn.onclick = () => {
    document.getElementById("walletForm").reset();
    const h4_edit = document.getElementById("h4_edit");
    const h4_contact = document.getElementById("h4_contact");
    const walletEdit = document.getElementById("walletEdit");
    const participantsSection = document.getElementById("participantsSection");
    const h3_partecipants = document.getElementById("selectPartecipants");
    const h3_edit = document.getElementById("edit");
    const h3_role = document.getElementById("selectRole");
    const rolesSection = document.getElementById("rolesSection");
    const rolesSectionC = document.getElementById("rolesSectionC");
    const cancel = document.getElementById("cancel");
    const confirm = document.getElementById("confirm");

    walletEdit.classList.add("hiddenName");
    participantsSection.classList.add("hiddenName");
    h3_edit.classList.add("hiddenName");
    h3_partecipants.classList.add("hiddenName");
    h4_edit.classList.remove("hiddenName");
    rolesSection.classList.add("hiddenContact");
    h3_role.classList.add("hiddenContact");
    cancel.classList.add("hiddenContact");
    confirm.classList.add("hiddenContact");
    h4_contact.classList.remove("hiddenName");
    h4_contact.classList.add("hiddenName");
    rolesSectionC.classList.add("hiddenName");

    hidePopup();
    if (type == "return") window.location.href = "./sharedWallet.php";
  };
  document.getElementById("popupOk").onclick = () => hidePopup();
}

function hidePopup() {
  const popup = document.getElementById("popup");
  if (popup) {
    popup.style.display = "none";
  }
}





document.addEventListener("DOMContentLoaded", () => {
  const walletName = document.getElementById("walletName");
  const h4_edit = document.getElementById("h4_edit");
  const h4_contact = document.getElementById("h4_contact");

  const walletEdit = document.getElementById("walletEdit");
  const participantsSection = document.getElementById("participantsSection");
  const h3_partecipants = document.getElementById("selectPartecipants");
  const h3_edit = document.getElementById("edit");
  const h3_role = document.getElementById("selectRole");
  const rolesSection = document.getElementById("rolesSection");
  const rolesSectionC = document.getElementById("rolesSectionC");
  const cancel = document.getElementById("cancel");
  const confirm = document.getElementById("confirm");

  

  //Reveal sections once wallet name is filled
  walletName.addEventListener("input", () => {
    if (walletName.value.trim().length > 2) {
        walletName.classList.remove("error");
        h3_edit.classList.remove("hiddenName");
        walletEdit.classList.remove("hiddenName");
        h3_partecipants.classList.remove("hiddenName");
        
        participantsSection.classList.remove("hiddenName");
        rolesSectionC.classList.remove("hiddenName");

        h4_edit.classList.add("hiddenName");
        h4_contact.classList.remove("hiddenName");

      const input = participantsSection.querySelectorAll("input[name='participants[]']");

      input.forEach(participant => {
        participant.addEventListener("focusout", () => {

          if (participant.value.trim().length > 0 && validateEmail(participant.value.trim())) {
            participant.classList.remove("error");
            h3_role.classList.remove("hiddenContact");
            rolesSection.classList.remove("hiddenContact");
            cancel.classList.remove("hiddenContact");
            confirm.classList.remove("hiddenContact");
            h4_contact.classList.add("hiddenName");


          } else {
            participant.classList.add("error");
            const errors = [];
            errors.push("The participants' email field is incorrect please make sure to insert a correct email.")
            showPopup(errors, "warning");
            rolesSection.classList.add("hiddenContact");
            h3_role.classList.add("hiddenContact");
            cancel.classList.add("hiddenContact");
            confirm.classList.add("hiddenContact");
            h4_contact.classList.remove("hiddenName");
          }
        });
      });

    } else {

      walletName.classList.add("error");
      errors = [];
      errors.push("The wallet name must be at least 3 characters long.");
      showPopup(errors, "warning");
      walletEdit.classList.add("hiddenName");
      participantsSection.classList.add("hiddenName");
      h3_edit.classList.add("hiddenName");
      h3_partecipants.classList.add("hiddenName");
      h4_edit.classList.remove("hiddenName");
      h4_contact.classList.add("hiddenName");
      rolesSectionC.classList.add("hiddenName");

    }
  });
  
  




});

// Listener cancel
document.addEventListener("DOMContentLoaded", () => {
  const cancelBtn = document.getElementById("cancel");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault(); // evita reset immediato del form
      showPopup([], "reset");
    });
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("walletForm");
  const walletName = document.getElementById("walletName");
  const participantsSection = document.getElementById("participantsSection");
  const addParticipantBtn = document.getElementById("addParticipant");

  let x = 0;

  // --- Funzione di controllo input ---
  function checkInputs() {
    const inputs = participantsSection.querySelectorAll("input[name='participants[]']");
    let allFilled = true;

    inputs.forEach(input => {
      if (input.value.trim() === "") {
        allFilled = false;
      }
    });

    addParticipantBtn.disabled = !allFilled;
  }

  // --- Aggiungi listener agli input ---
  function attachInputListeners(input) {
    input.addEventListener("input", checkInputs);
  }

  // --- Rimozione partecipante ---
  function attachRemoveListener(bin) {
    bin.addEventListener("click", () => {
      const parentDiv = bin.parentElement;
      parentDiv.remove();
      x--;
      if (x < 3) {
        document.getElementById("button-container").style.display = "flex";
      }
      checkInputs();
    });
  }

  // --- Aggiunta dinamica partecipante ---
  addParticipantBtn.addEventListener("click", () => {
    if (x < 3) {
      const div = document.createElement("div");
      const input = document.createElement("input");
      const bin = document.createElement("img");

      div.className = "input-partecipant";

      input.type = "text";
      input.name = "participants[]";
      input.placeholder = "Add participant email";

      bin.className = "red_bin";
      bin.src = "../images/Red_bin.png";

      div.appendChild(input);
      div.appendChild(bin);

      participantsSection.insertBefore(div, document.getElementById("button-container"));

      attachInputListeners(input);
      attachRemoveListener(bin);

      x++;
      checkInputs();
    }

    if (x === 3) {
      document.getElementById("button-container").style.display = "none";
    }
  });

  // --- Inizializza ---
  document.querySelectorAll("input[name='participants[]']").forEach(input => {
    attachInputListeners(input);
  });

  checkInputs();



  // --- Validation on submit ---
  form.addEventListener("submit", (e) => {
    const errors = [];

    // Participants check
    // Participants check
    const participantInputs = form.querySelectorAll("input[name='participants[]']");

    if (participantInputs.length === 0) {
      errors.push("Please add at least one participant email.");
    } else {
      participantInputs.forEach((input) => {
        const value = input.value.trim();

        if (value === "") {
          errors.push("All participant fields must be filled.");
        } else if (!validateEmail(value)) {
          errors.push(`Invalid email format: ${value}`);
        }
      });
    }


    // Role check
    const role = form.querySelector("select[name='role']");
    if (!role.value) {
      errors.push("Please select a role.");
    }

    // Permissions check
    const permissions = form.querySelectorAll("input[name='permissions[]']:checked");
    if (permissions.length === 0) {
      errors.push("Please select at least one permission.");
    }

    if (errors.length > 0) {
      e.preventDefault();
      showPopup(errors, "warning");
    }
    else {
      hidePopup();

    }
  });


});

function validateEmail(email) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}



document.addEventListener("DOMContentLoaded", () => {
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  document.body.appendChild(tooltip);

  document.querySelectorAll(".info-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const msg = btn.dataset.info;
      tooltip.innerHTML = msg;

      // posizione accanto al bottone
      const rect = btn.getBoundingClientRect();
      tooltip.style.top = (window.scrollY + rect.top - 5) + "px";
      tooltip.style.left = (window.scrollX + rect.right + 10) + "px";
      tooltip.style.display = "block";
    });
  });

  // chiudi cliccando fuori
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("info-btn")) {
      tooltip.style.display = "none";
    }
  });
});
