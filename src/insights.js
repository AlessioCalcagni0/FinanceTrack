let currentChart = null;
let currentLineChart = null;
let currentFilter = "both";

async function fetchStats(period) {
  const res = await fetch(`http://${API_HOST}:8000/api.php?path=api/stats&period=${period}`);
  return await res.json();
}

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
          color: "#222",       // titolo più scuro
          font: {
            size: 16,
            weight: "bold"
          }
        },
        legend: {
          labels: {
            color: "#222",   // legenda più scura
            font: {
              size: 12,
              weight: "bold"
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: "#222",   // etichette asse X
            font: {
              size: 12,
              weight: "bold"
            }
          },
          grid: {
            color: "rgba(0,0,0,0.1)" // linee più definite
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "#222",   // etichette asse Y
            font: {
              size: 12,
              weight: "bold"
            }
          },
          grid: {
            color: "rgba(0,0,0,0.1)"
          }
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
          color: "#222",       // titolo più scuro
          font: {
            size: 16,
            weight: "bold"
          }
        },
        legend: {
          labels: {
            color: "#222",   // legenda più scura
            font: {
              size: 12,
              weight: "bold"
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: "#222",   // etichette asse X
            font: {
              size: 12,
              weight: "bold"
            }
          },
          grid: {
            color: "rgba(0,0,0,0.1)" // linee più definite
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "#222",   // etichette asse Y
            font: {
              size: 12,
              weight: "bold"
            }
          },
          grid: {
            color: "rgba(0,0,0,0.1)"
          }
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
      fill: chartType === "line" ? true : false,
      tension: chartType === "line" ? 0.3 : 0
    });
  }
  if (currentFilter === "spent" || currentFilter === "both") {
    datasets.push({
      label: "Spent",
      data: data.map(d => d.outcome),
      backgroundColor: chartType === "bar" ? "rgba(255, 99, 132, 0.5)" : undefined,
      borderColor: "rgba(255, 99, 132, 1)",
      fill: chartType === "line" ? true : false,
      tension: chartType === "line" ? 0.3 : 0
    });
  }

  return datasets;
}



async function showChart(period) {
  // update active button
  document.querySelectorAll(".chart-buttons button").forEach(btn => btn.classList.remove("active"));
  document.getElementById(`btn-${period}`).classList.add("active");

  let data;
  if (period === "month") {
    const rawMonthData = await fetchStats("month");
    data = groupByWeeks(rawMonthData);
  } else {
    data = await fetchStats(period);
  }

  createBarChart("main-chart", data, period.charAt(0).toUpperCase() + period.slice(1), period);
  createLineChart("line-chart", data, period.charAt(0).toUpperCase() + period.slice(1), period);
}

document.addEventListener('DOMContentLoaded', () => {

  // event listeners for buttons
  document.getElementById("btn-week").addEventListener("click", () => showChart("week"));
  document.getElementById("btn-month").addEventListener("click", () => showChart("month"));
  document.getElementById("btn-year").addEventListener("click", () => showChart("year"));

  document.getElementById("btn-income").addEventListener("click", () => {
    currentFilter = "income";
    updateFilterButtons("btn-income");
    const activePeriod = document.querySelector(".chart-buttons button.active").id.replace("btn-", "");
    showChart(activePeriod);
  });

  document.getElementById("btn-spent").addEventListener("click", () => {
    currentFilter = "spent";
    updateFilterButtons("btn-spent");
    const activePeriod = document.querySelector(".chart-buttons button.active").id.replace("btn-", "");
    showChart(activePeriod);
  });

  document.getElementById("btn-both").addEventListener("click", () => {
    currentFilter = "both";
    updateFilterButtons("btn-both");
    const activePeriod = document.querySelector(".chart-buttons button.active").id.replace("btn-", "");
    showChart(activePeriod);
  });

  function updateFilterButtons(activeId) {
    document.querySelectorAll(".filter-buttons button").forEach(btn => btn.classList.remove("active"));
    document.getElementById(activeId).classList.add("active");
  }

  // default chart
  showChart("week");

});


function goHome() {
  window.location.href = "./homepage.php";
}

function redirect(location) {
  window.location.href = location;
}

