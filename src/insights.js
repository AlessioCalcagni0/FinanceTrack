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
  console.log("userID is:", userID);

  const select=document.getElementById("filtro2");
  async function fetchAccounts(user = userID) {
  try {
    const res = await fetch(`http://localhost:5500/src/source.php?path=api/accounts&user=${user}`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const dati = await res.json();

    // ✅ use dati here
    dati.forEach(account => {
      const option = document.createElement("option");
      option.value = account.name;
      option.textContent = account.name;
      select.appendChild(option);
    });

  } catch (error) {
    console.error("Failed to fetch accounts:", error);
    alert("Unable to connect to the server. Please try again later.");
  }
}
  fetchAccounts(userID);

  const ctx = document.getElementById('myChart').getContext('2d');
    let chart;

async function caricaDati(periodo = "anno", account="all",type="outcome") {
      const res = await fetch(`http://localhost:5500/src/source.php?path=api/accounts&periodo=${periodo}&account=${account}&type=${type}`);
      const dati = await res.json();

      const labels = dati.map(d => d.categoria);
      const values = dati.map(d => d.totale);

      if (chart) chart.destroy();

      chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF']
          }]
        }
      });
    }

    document.getElementById("filtro2").value
  // Cambio filtro
    document.getElementById('filtro1').addEventListener('change', (e) => {
      caricaDati(e.target.value,document.getElementById("filtro2").value, document.getElementById("filtro3").value);
    });

  // Cambio filtro
    document.getElementById('filtro2').addEventListener('change', (e) => {
      caricaDati(document.getElementById("filtro1").value,e.target.value, document.getElementById("filtro3").value);
    });

  // Cambio filtro
    document.getElementById('filtro3').addEventListener('change', (e) => {
      caricaDati(document.getElementById("filtro1").value, document.getElementById("filtro2").value,e.target.value);
    });
});