function goToSW() {
  showPopup("", "return");
}


  function showPopup(message) {
    // Overlay
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "9999"
    });

    // Box popup
    const popup = document.createElement("div");
    Object.assign(popup.style, {
      backgroundColor: "#ffffffff",
      color: "black",
      padding: "20px",
      borderRadius: "10px",
      maxWidth: "400px",
      width: "90%",
      maxHeight: "70%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      overflowY: "auto",
      boxSizing: "border-box",
      textAlign: "center"
    });

    // Messaggio
    const msg = document.createElement("p");
    msg.textContent = message;
    Object.assign(msg.style, {
      marginBottom: "15px",
      textAlign: "center",
      fontSize: "16px"
    });
    popup.appendChild(msg);
    
    // Bottone OK
    const btn = document.createElement("button");
    btn.textContent = "OK";
    Object.assign(btn.style, {
      backgroundColor: "#07e90e",
      border: "none",
      padding: "8px 16px",
      marginTop: "15px",
      cursor: "pointer",
      borderRadius: "5px",
      alignSelf: "center"
    });
    btn.addEventListener("click", () => document.body.removeChild(overlay));

    popup.appendChild(btn);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    }



function showCancelPopup(value) {

    let overlay = document.getElementById("overlay-cancel");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "overlay-cancel";
      overlay.className = "overlay";
      overlay.style.zIndex = "90";
      document.body.appendChild(overlay);
    }

    const popup = document.getElementById("popup-cancel");
    if (!popup) return;

    if (!popup.dataset.initHidden) {
      popup.style.display = "none";
      popup.dataset.initHidden = "1";
    }

    const keepBtn = document.getElementById("keep");
    const loseBtn = document.getElementById("lose");

    const closeAll = () => {
      overlay.classList.remove("overlayactive");
      popup.style.display = "none";
    };

    const clearAllFieldsAndClose = () => {
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
      participantsSection.style.display="none";      participantsSection.classList.add("hiddenName");
      h3_edit.classList.add("hiddenName");
      h3_partecipants.style.display="none";
      h3_partecipants.classList.add("hiddenName");
      h4_edit.classList.remove("hiddenName");
      rolesSection.classList.add("hiddenContact");
      h3_role.classList.add("hiddenName");
      cancel.classList.add("hiddenContact");
      confirm.classList.add("hiddenContact");
      h4_contact.classList.remove("hiddenName");
      h4_contact.classList.add("hiddenName");
      rolesSectionC.classList.add("hiddenName");
      if(value) window.location.href="/sharedWallet.php";
      overlay.classList.remove("overlayactive");
      popup.style.display="none";
    };

    if (keepBtn) keepBtn.addEventListener("click", closeAll, { once: true });
    if (loseBtn) loseBtn.addEventListener("click", clearAllFieldsAndClose, { once: true });

    overlay.classList.add("overlayactive");
    popup.style.display = "block";
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
        h3_partecipants.style.display="flex";
        h3_partecipants.classList.remove("hiddenName");
        participantsSection.style.display="flex";
        participantsSection.classList.remove("hiddenName");
        rolesSectionC.classList.remove("hiddenName");
        h3_role.classList.remove("hiddenName");
        h4_edit.classList.add("hiddenName");
        h4_contact.classList.remove("hiddenName");

      const input = participantsSection.querySelectorAll("input[name='participants[]']");

      input.forEach(participant => {
        participant.addEventListener("input", () => {

          if (participant.value.trim().length > 0 && validateEmail(participant.value.trim())) {
            participant.classList.remove("error");
            rolesSection.classList.remove("hiddenContact");
            cancel.classList.remove("hiddenContact");
            confirm.classList.remove("hiddenContact");
            h4_contact.classList.add("hiddenName");


          } else {
            
            rolesSection.classList.add("hiddenContact");
            cancel.classList.add("hiddenContact");
            confirm.classList.add("hiddenContact");
            h4_contact.classList.remove("hiddenName");
          }
        });
        participant.addEventListener("focusout", ()=>{
          if (! validateEmail(participant.value.trim())) {
            participant.classList.add("error");
            const errors=("The participants' email field is incorrect please make sure to insert a correct email.")
            showPopup(errors);
          }
        })
      });

    } else {
      participantsSection.style.display="none";
      participantsSection.classList.add("hiddenName");
      walletEdit.classList.add("hiddenName");
      h3_edit.classList.add("hiddenName");
      h3_role.classList.add("hiddenName");
      h3_partecipants.style.display="none";
      h3_partecipants.classList.add("hiddenName");
      h4_edit.classList.remove("hiddenName");
      h4_contact.classList.add("hiddenName");
      rolesSectionC.classList.add("hiddenName");

    }
  });

  walletName.addEventListener("focusout",()=>{
    if(walletName.value.trim().length < 3){
      participantsSection.classList.add("hiddenName");
      walletName.classList.add("error");
      const errors="The wallet name must be at least 3 characters long.";
      showPopup(errors);
    }
    else{
        walletName.classList.remove("error");

    }
     
  });
  
  




});

// Listener cancel
document.addEventListener("DOMContentLoaded", () => {
  const cancelBtn = document.getElementById("cancel");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      showCancelPopup();
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
      if ( !validateEmail(input.value)) {
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
  function attachRemoveListener(bin, label, select) {
    bin.addEventListener("click", () => {
      const parentDiv = bin.parentElement;
      parentDiv.remove();
      document.getElementById(label).remove();
      document.getElementById(select).remove();
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
      const label = document.createElement("label");
      const input = document.createElement("input");
      const bin = document.createElement("img");
      let y= x+2;
      div.className = "input-partecipant";
      label.style.marginTop="5px";
      label.innerHTML= "Partecipant "+ y +" ";
      input.type = "text";
      input.name = "participants[]";
      input.placeholder = "Add participant email";

      bin.className = "red_bin";
      bin.src = "../images/Red_bin.png";

      label.appendChild(input);
      div.appendChild(label);
      div.appendChild(bin);

      participantsSection.insertBefore(div, document.getElementById("button-container"));

      
      
      const container=document.getElementById("rolesSection")
      const label1=document.createElement("label");
      const select= document.createElement("select");
      const option1 = document.createElement("option");
      const option2 = document.createElement("option");

      label1.innerHTML= "Partecipant "+ y ;
      label1.id="label"+y;
      select.className="role";
      select.id="select"+y;
      option1.value="editor";
      option1.innerHTML="Editor";
      option2.value="viewer";
      option2.innerHTML="Viewer";

      select.appendChild(option1);
      select.appendChild(option2);
      

      container.appendChild(label1);
     container.appendChild(select);


      x++;
      checkInputs();

      attachInputListeners(input);
      attachRemoveListener(bin, label1.id, select.id);

    }

    if (x === 2) {
      document.getElementById("button-container").style.display = "none";
    }
  });

  // --- Inizializza ---
  document.querySelectorAll("input[name='participants[]']").forEach(input => {
    attachInputListeners(input);
  });

  checkInputs();

  

  // --- Validation on submit ---
  form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const errors = [];

  // --- Participants check ---
  const participantInputs = form.querySelectorAll("input[name='participants[]']");
  participantInputs.forEach((input, idx) => {
  const value = input.value.trim();
  if (value === "") {
    errors.push(`Participant ${idx+1} is empty.`);
  } else if (!validateEmail(value)) {
    errors.push(`Invalid email format: ${value}`);
  }
 
});


  // --- Role check ---
  // --- Role check ---
const roleSelects = form.querySelectorAll("select.role");
if (roleSelects.length !== participantInputs.length) {
  errors.push("Each participant must have a role.");
}


  // --- Icon check (optional) ---
  const selectedIcon = document.querySelector("input[name='icon']:checked");
  const iconValue = selectedIcon ? selectedIcon.value : null;
  const roles = [...roleSelects].map(s => s.value);

  if (errors.length > 0) {
    showPopup(errors.join("\n"));
    return;
  }

  // --- Prepara dati ---
  const walletName = document.getElementById("walletName").value.trim();
  const participants = [...participantInputs].map(i => i.value.trim());

  const accountData = {
    user_id: 1,
    name: walletName,
    p_name1: participants[0] || "",
    p_role1: roles[0] || "",
    p_name2: participants[1] || "null",
    p_role2: roles[1] || "null",
    p_name3: participants[2] || "null",
    p_role3: roles[2] || "null",
    number: participants.length+1,
    icon: "/images/" +iconValue // 👈 qui l’icona scelta
  };

  // --- Invio ---
  try {
    const res = await fetch(`http://${API_HOST}:8000/api.php?path=create_sw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(accountData)
    });
    const result = await res.json();


    if (res.ok) {
      showPopup("Wallet created successfully!");
      form.reset();
      window.location.href="/sharedWallet.php";
    } else {
      showPopup("Error during wallet creation: " + (result.error || res.status));
    }
  } catch (err) {
    console.error("Errore fetch create_sw:", err);
    showPopup("Error in server connection!");
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