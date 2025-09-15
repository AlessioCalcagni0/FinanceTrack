function goTo(){

    const home = document.getElementById("home");
    const wallet = document.getElementById("wallet-icon");
    const goal = document.getElementById("goal-icon");
    const insights = document.getElementById("insights-icon");

    home.addEventListener('click', () => {
        window.location.href = "../homepage.php"
        }
    );
    wallet.addEventListener('click', () => {
        window.location.href = "../wallet_page.php"
        }
    );
    goal.addEventListener('click', () => {
        window.location.href = "../goals.php"
        }
    );
    insights.addEventListener('click', () => {
        window.location.href = "../insights.php"
        }
    );
}

function redirect(location) {
  window.location.href = location;
}

function openMenu() {

    document.getElementById("menu-content").classList.toggle("show-menu");
    const overlay = document.getElementById("overlay-menu");
    overlay.style.opacity="1";

}
function closeMenu() {
  
    document.getElementById("menu-content").classList.remove("show-menu");
    document.getElementsByClassName("back-arrow")[0].classList.remove("show-menu");
    const overlay = document.getElementById("overlay-menu");
    overlay.style.opacity="0";
}

window.onclick = function (event) {
    if (!event.target.matches('#menu') && !event.target.matches("menu-content")) {
        document.getElementsByClassName("back-arrow")[0].classList.remove("show-menu");
        const overlay = document.getElementById("overlay-menu");
        overlay.style.opacity="0";
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


async function fetchImage(userid) {
    try {
        const res = await fetch(`http://${API_HOST}:8000/api.php?path=image&user_id=${encodeURIComponent(userid)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const out = await res.json().catch(() => ({}));
        if (!res.ok || out.error) throw new Error(out.error || `HTTP ${res.status}`);

        return out.url; // return only the image URL
    } catch (e) {
        console.error(e);
        if (typeof showPopup === 'function') showPopup('Errore caricamento immagine: ' + e.message, 'error');
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async function () {
     goTo();
    const profileBtn = document.getElementById("profile");

    const imageUrl = await fetchImage(1);
    if (imageUrl) {
        profileBtn.src = imageUrl;  // <-- set src, no background needed
    }

    profileBtn.addEventListener("click", () => {
        redirect("../account.php");
    });

});
