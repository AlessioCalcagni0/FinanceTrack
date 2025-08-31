

document.addEventListener("DOMContentLoaded", () => {
  const walletName = document.getElementById("walletName");
  const participant= document.getElementsByName("participants[]")[0];
  const walletEdit = document.getElementById("walletEdit");
  const participantsSection = document.getElementById("participantsSection");
  const h3_partecipants= document.getElementById("selectPartecipants");
  const h3_edit= document.getElementById("edit");
  const h3_role= document.getElementById("selectRole");
  const rolesSection = document.getElementById("rolesSection");
  const addParticipant = document.getElementById("addParticipant");
  const cancel= document.getElementById("cancel"); 
  const confirm = document.getElementById("confirm");

  // Reveal sections once wallet name is filled
  walletName.addEventListener("input", () => {
    if (walletName.value.trim().length > 0) {
        h3_edit.classList.remove("hiddenName");
        walletEdit.classList.remove("hiddenName");
        h3_partecipants.classList.remove("hiddenName");
        participantsSection.classList.remove("hiddenName");
        addParticipant.classList.remove("hiddenName");
    } else {
      walletEdit.classList.add("hiddenName");
      participantsSection.classList.add("hiddenName");
      h3_edit.classList.add("hiddenName");
      h3_partecipants.classList.add("hiddenName");
    }
  });

  // Add new participant input dynamically
  addParticipant.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "text";
    input.name = "participants[]";
    input.placeholder = "Add participant email";
    participantsSection.insertBefore(input, addParticipant);
  });

  participant.addEventListener("input", () => {
    if (participant.value.trim().length > 0) {
        h3_role.classList.remove("hiddenContact");
       rolesSection.classList.remove("hiddenContact");
       cancel.classList.remove("hiddenContact");
      confirm.classList.remove("hiddenContact");
       
    } else {
      rolesSection.classList.add("hiddenContact");
      h3_role.classList.add("hiddenContact");
      cancel.classList.add("hiddenContact");
      confirm.classList.add("hiddenContact");
    }
  });
});
