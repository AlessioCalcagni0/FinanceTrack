function goHome(){
    window.location.href="./src/homepage.php";
}

 function redirect(location){
    window.location.href= location;
 }

function openMenu(){
    document.getElementById("image1_303_309").classList.add("hide-menu");
    document.getElementById("hh").classList.add("hide-menu");
    document.getElementById("hhs").classList.add("hide-menu");
    document.getElementById("ww").classList.add("hide-menu");
    document.getElementsByClassName("back-arrow")[0].classList.add("show-menu");
    document.getElementById("menu-content").classList.toggle("show-menu");
}

window.onclick = function(event) {
  if (!event.target.matches('#menu') && !event.target.matches("menu-content")) {
    document.getElementById("image1_303_309").classList.remove("hide-menu");
    document.getElementById("hh").classList.remove("hide-menu");
    document.getElementById("hhs").classList.remove("hide-menu");
    document.getElementById("ww").classList.remove("hide-menu");
    document.getElementsByClassName("back-arrow")[0].classList.remove("show-menu");

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show-menu')) {
        openDropdown.classList.remove('show-menu');
      }
    }
  }
}

function closeMenu() {
    document.getElementById("image1_303_309").classList.remove("hide-menu");
    document.getElementById("hh").classList.remove("hide-menu");
    document.getElementById("hhs").classList.remove("hide-menu");
    document.getElementById("ww").classList.remove("hide-menu");
    document.getElementById("menu-content").classList.remove("show-menu");
    document.getElementsByClassName("back-arrow")[0].classList.remove("show-menu");
}

document.addEventListener('DOMContentLoaded', () => {
    loadAccounts();
});

// --- CARICAMENTO ACCOUNTS ---
async function loadAccounts() {
    try {
        const res = await fetch(`http://localhost:5500/src/source.php?path=sharedAccounts&user=${userID}`);
        const data = await res.json();

        console.log("Backend response:", data);

        if (!Array.isArray(data)) {
        console.error("Expected array, got:", data);
        return;
        }

        const frame = document.getElementById("frame-account");
        frame.innerHTML = "";

        data.forEach(acc => {
            if (!acc.name) return;

            const box = document.createElement("div");
            box.className = "account-box";

            const iconDiv = document.createElement("div");
            iconDiv.className = `icon`;
            if (acc.path) {
                iconDiv.style.backgroundImage = `url('/src/images/${acc.path}')`;
                iconDiv.style.backgroundSize = "cover";
                iconDiv.style.backgroundPosition = "center";
            }

            const info = document.createElement("div");
            info.className = "info";

            const nameIcon = document.createElement("div");
            nameIcon.className = "name-Icon";

            const nameDiv = document.createElement("div");
            nameDiv.className = "account-name";
            nameDiv.textContent = acc.name;


            const balanceDiv = document.createElement("div");
            // balanceDiv.className = "account-balance";
            balanceDiv.textContent = acc.balance + " €";

            const lastSyncDiv = document.createElement("div");
            lastSyncDiv.className = "account-lastsync";
            lastSyncDiv.textContent = 'Last sync: ' + acc.last_sync;

            const modifyBtn = document.createElement("button");
            modifyBtn.className = "account-modify-btn";
            modifyBtn.textContent = "Modify";
            modifyBtn.addEventListener("click", () => openModifyPopup(acc));

            nameIcon.appendChild(nameDiv);
            nameIcon.appendChild(iconDiv);
            info.appendChild(balanceDiv);
            info.appendChild(lastSyncDiv);

            box.appendChild(nameIcon);
            box.appendChild(info);
            box.appendChild(modifyBtn);
            frame.appendChild(box);
        });
    } catch (err) {
        console.error("Errore durante il caricamento accounts:", err);
    }
}

