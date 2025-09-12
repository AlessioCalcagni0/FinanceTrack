let currentChart = null;
let currentLineChart = null;
let currentFilter = "both";
let currentAccountId = null; // NEW

// ================================
// API
// ================================
async function fetchAccounts(userId, token) {
  const url = `http://${API_HOST}:8000/api.php?path=api/accounts&user=${encodeURIComponent(userId)}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Errore nel caricamento degli account");
  return data; // [{id, name}]
}

async function fetchStats(period, accountId) {
  const url = new URL(`http://${API_HOST}:8000/api.php`);
  url.searchParams.set("path", "api/stats");
  url.searchParams.set("period", period);
  if (accountId) url.searchParams.set("accountId", accountId);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Errore nel caricamento delle statistiche");
  return await res.json();
}

// ================================
// LABEL HELPERS
// ================================
function mapLabels(period, value) {
  if (period === "week") {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[value];
  }
  if (period === "month") {
    const weekNum = Math.ceil(value / 7);
    return `Week ${weekNum}`;
  }
  if (period === "year") {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[value - 1];
  }
  return value;
}

function groupByWeeks(data) {
  const weeks = {
    "Week 1": { income: 0, outcome: 0 },
    "Week 2": { income: 0, outcome: 0 },
    "Week 3": { income: 0, outcome: 0 },
    "Week 4": { income: 0, outcome: 0 },
    "Week 5": { income: 0, outcome: 0 }
  };

  data.forEach(d => {
    const day = parseInt(d.period, 10) || 0;
    let weekLabel;
    if (day >= 1 && day <= 7) weekLabel = "Week 1";
    else if (day >= 8 && day <= 14) weekLabel = "Week 2";
    else if (day >= 15 && day <= 21) weekLabel = "Week 3";
    else if (day >= 22 && day <= 28) weekLabel = "Week 4";
    else if (day >= 29) weekLabel = "Week 5";
    else return;

    weeks[weekLabel].income += Number(d.income) || 0;
    weeks[weekLabel].outcome += Number(d.outcome) || 0;
  });

  return Object.entries(weeks)
    .filter(([_, vals]) => vals.income > 0 || vals.outcome > 0)
    .map(([label, vals]) => ({
      period: label,
      income: vals.income,
      outcome: vals.outcome
    }));
}

// ================================
// CHARTS
// ================================
function createBarChart(canvasId, data, label, period) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  if (currentChart) currentChart.destroy();

  currentChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map(d => (period === "month" ? d.period : mapLabels(period, d.period))),
      datasets: getDatasets(data, "bar")
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `${label} Statistics (Bar)`,
          color: "#222",
          font: { size: 16, weight: "bold" }
        },
        legend: {
          labels: {
            color: "#222",
            font: { size: 12, weight: "bold" }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#222", font: { size: 12, weight: "bold" } },
          grid: { color: "rgba(0,0,0,0.1)" }
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#222", font: { size: 12, weight: "bold" } },
          grid: { color: "rgba(0,0,0,0.1)" }
        }
      }
    }
  });
}

function createLineChart(canvasId, data, label, period) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  if (currentLineChart) currentLineChart.destroy();

  currentLineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.map(d => (period === "month" ? d.period : mapLabels(period, d.period))),
      datasets: getDatasets(data, "line")
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `${label} Statistics (Line)`,
          color: "#222",
          font: { size: 16, weight: "bold" }
        },
        legend: {
          labels: {
            color: "#222",
            font: { size: 12, weight: "bold" }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#222", font: { size: 12, weight: "bold" } },
          grid: { color: "rgba(0,0,0,0.1)" }
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#222", font: { size: 12, weight: "bold" } },
          grid: { color: "rgba(0,0,0,0.1)" }
        }
      }
    }
  });
}

function getDatasets(data, chartType = "bar") {
  const datasets = [];

  if (currentFilter === "income" || currentFilter === "both") {
    datasets.push({
      label: "Income",
      data: data.map(d => d.income),
      backgroundColor: chartType === "bar" ? "rgba(54, 162, 235, 0.5)" : undefined,
      borderColor: "rgba(54, 162, 235, 1)",
      fill: chartType === "line",
      tension: chartType === "line" ? 0.3 : 0
    });
  }
  if (currentFilter === "spent" || currentFilter === "both") {
    datasets.push({
      label: "Spent",
      data: data.map(d => d.outcome),
      backgroundColor: chartType === "bar" ? "rgba(255, 99, 132, 0.5)" : undefined,
      borderColor: "rgba(255, 99, 132, 1)",
      fill: chartType === "line",
      tension: chartType === "line" ? 0.3 : 0
    });
  }

  return datasets;
}

function renderAccountBlocks(accounts) {
  const list = document.getElementById("account-list");
  const status = document.getElementById("account-status");
  list.innerHTML = "";

  if (!accounts.length) {
    status.textContent = "Nessun account trovato";
    return;
  }

  status.textContent = `${accounts.length} account`;

  accounts.forEach(acc => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "account-item";
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", "false");
    item.dataset.id = acc.id;

    // Contenuto blocco
    item.innerHTML = `
      <span class="account-name">${acc.name}</span>
    `;

    // Click: seleziona singolo account
    item.addEventListener("click", async () => {
      selectAccount(acc.id);
      const activePeriod = document.querySelector(".chart-buttons button.active")?.id.replace("btn-", "") || "week";
      await showChart(activePeriod); // ridisegna grafici per l’account selezionato
    });

    // Accessibilità tastiera
    item.addEventListener("keydown", async (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        item.click();
      }
    });

    list.appendChild(item);
  });

  // preseleziona il primo se nulla è selezionato
  if (!currentAccountId) {
    selectAccount(String(accounts[0].id));
  } else {
    selectAccount(String(currentAccountId)); // ripristina selezione se già nota
  }
}

// Imposta lo stato “selezionato” visivamente e ARIA
function selectAccount(accountId) {
  currentAccountId = String(accountId);
  const items = document.querySelectorAll(".account-item");
  items.forEach(el => {
    const selected = (String(el.dataset.id) === currentAccountId);
    el.classList.toggle("selected", selected);
    el.setAttribute("aria-selected", selected ? "true" : "false");
  });
}

// ================================
async function showChart(period) {
  if (!currentAccountId) return;

  document.querySelectorAll(".chart-buttons button").forEach(btn => btn.classList.remove("active"));
  document.getElementById(`btn-${period}`).classList.add("active");

  let data;
  if (period === "month") {
    const rawMonthData = await fetchStats("month", currentAccountId);
    data = groupByWeeks(rawMonthData);
  } else {
    data = await fetchStats(period, currentAccountId);
  }

  createBarChart("main-chart", data, period.charAt(0).toUpperCase() + period.slice(1), period);
  createLineChart("line-chart", data, period.charAt(0).toUpperCase() + period.slice(1), period);
}

// ================================
// Boot
// ================================
document.addEventListener('DOMContentLoaded', async () => {

  const burger = document.getElementById("burger");
  const menu = document.getElementById("menu-content");
  const overlay = document.getElementById("overlay");
  const backArrow = document.getElementById("back-arrow");

  function openMenu() {
    menu.classList.add("open");
    overlay.style.display = "block";
  }

  function closeMenu() {
    menu.classList.remove("open");
    overlay.style.display = "none";
  }

  burger.addEventListener("click", openMenu);
  backArrow.addEventListener("click", closeMenu);
  overlay.addEventListener("click", closeMenu); // c
  // Buttons periodo
  document.getElementById("btn-week").addEventListener("click", () => showChart("week"));
  document.getElementById("btn-month").addEventListener("click", () => showChart("month"));
  document.getElementById("btn-year").addEventListener("click", () => showChart("year"));

  // Buttons filtro
  document.getElementById("btn-income").addEventListener("click", () => {
    currentFilter = "income";
    updateFilterButtons("btn-income");
    const activePeriod = document.querySelector(".chart-buttons button.active")?.id.replace("btn-", "") || "week";
    showChart(activePeriod);
  });

  document.getElementById("btn-spent").addEventListener("click", () => {
    currentFilter = "spent";
    updateFilterButtons("btn-spent");
    const activePeriod = document.querySelector(".chart-buttons button.active")?.id.replace("btn-", "") || "week";
    showChart(activePeriod);
  });

  document.getElementById("btn-both").addEventListener("click", () => {
    currentFilter = "both";
    updateFilterButtons("btn-both");
    const activePeriod = document.querySelector(".chart-buttons button.active")?.id.replace("btn-", "") || "week";
    showChart(activePeriod);
  });

  function updateFilterButtons(activeId) {
    document.querySelectorAll(".filter-buttons button").forEach(btn => btn.classList.remove("active"));
    document.getElementById(activeId).classList.add("active");
  }

  const status = document.getElementById("account-status");
  try {
    status.textContent = "Caricamento…";
    const accounts = await fetchAccounts(); // [{id, name}]
    renderAccountBlocks(accounts);
    status.textContent = `${accounts.length} account`;

    // all'avvio, mostra grafico di default (week) per l'account selezionato
    await showChart("week");
  } catch (e) {
    console.error(e);
    status.textContent = "Impossibile caricare gli account";
  }
  goTo();
});

// ================================
// Navigation helpers (unchanged)
// ================================
function goTo() {

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
};
function redirect(location) { window.location.href = location; }
