// Connexion WebSocket
const socket = io('https://node-servers.onrender.com', {
  transports: ['websocket', 'polling'],
  secure: true,
  reconnection: true
});
socket.on('connect', () => console.log('WebSocket connecté'));
socket.on('disconnect', () => console.log('WebSocket déconnecté'));
socket.on('new-data', data => {
  console.log('Données reçues via websocket :', data);
  updateUI(data);
});

// Sélecteurs HTML
const tempDisplay = document.getElementById('current-temp');
const humidityDisplay = document.getElementById('current-humidity');
const tableBody = document.querySelector('#data-table tbody');
const subtitle1 = document.getElementById('stat-subtitle1');
const subtitle2 = document.getElementById('stat-subtitle2')


// Variables globales pour Chart.js
let tempChart, humidityChart, combinedChart;

// Chargement initial + setInterval ***
async function fetchData() {
  try {
    const res = await fetch('https://node-servers.onrender.com/api/data');
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return;

    const reversed = [...data].reverse(); // ancien -> récent
    buildCharts(reversed);
    populateTable(data);
    const latest = data[0];
    const dateObj = new Date(latest.date);
    const formatted = `${dateObj.toLocaleDateString()} à ${dateObj.toLocaleTimeString()}`;
    tempDisplay.textContent = `${latest.temperature.toFixed(1)} °C`;
    humidityDisplay.textContent = `${latest.humidite.toFixed(1)} %`;
    subtitle1.textContent = formatted;
    subtitle2.textContent = formatted;

  } catch (e) {
    console.error('Erreur fetchData:', e);
  }
}
fetchData();
setInterval(fetchData, 60000);

// Fonction pour créer ou mettre à jour les chartes
function buildCharts(data) {
  const labels = data.map(x => new Date(x.date).toLocaleTimeString());
  const temps = data.map(x => x.temperature);
  const hums = data.map(x => x.humidite);

  if (!tempChart) {
    tempChart = new Chart(document.getElementById('tempChart'), {
      type: 'line',
      data: {
        labels,
        datasets: [{ 
          label: 'Température (°C)', 
          data: temps, 
          borderColor: 'red', 
          backgroundColor: 'rgba(255,0,0,0.1)', 
          tension: 0.3 
        }]
      },
      options: { responsive: true }
    });
  } else {
    tempChart.data.labels = labels;
    tempChart.data.datasets[0].data = temps;
    tempChart.update();
  }

  if (!humidityChart) {
    humidityChart = new Chart(document.getElementById('humidityChart'), {
      type: 'line',
      data: {
        labels,
        datasets: [{ 
          label: 'Humidité (%)', 
          data: hums, 
          borderColor: 'blue', 
          backgroundColor: 'rgba(0,0,255,0.1)', 
          tension: 0.3 
        }]
      },
      options: { responsive: true }
    });
  } else {
    humidityChart.data.labels = labels;
    humidityChart.data.datasets[0].data = hums;
    humidityChart.update();
  }

  if (!combinedChart) {
    combinedChart = new Chart(document.getElementById('combinedChart'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Température (°C)',
            data: temps,
            borderColor: '#dc2626',
            backgroundColor: 'rgba(220, 38, 38, 0.3)',
            yAxisID: 'yTemp',
            tension: 0.3,
            fill: false
          },
          {
            label: 'Humidité (%)',
            data: hums,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.3)',
            yAxisID: 'yHumidity',
            tension: 0.3,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false
        },
        stacked: false,
        scales: {
          yTemp: {
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: 'Température (°C)'
            },
            ticks: { color: '#dc2626' }
          },
          yHumidity: {
            type: 'linear',
            position: 'right',
            title: {
              display: true,
              text: 'Humidité (%)'
            },
            ticks: { color: '#2563eb' },
            grid: { drawOnChartArea: false }
          },
          x: {
            title: { display: true, text: 'Heure' }
          }
        }
      }
    });
  } else {
    combinedChart.data.labels = labels;
    combinedChart.data.datasets[0].data = temps;
    combinedChart.data.datasets[1].data = hums;
    combinedChart.update();
  }
}

// Remplir le tableau historique
function populateTable(data) {
  tableBody.innerHTML = '';
  data.reverse().forEach(x => {
    const row = document.createElement('tr');
    const d = new Date(x.date);
    row.innerHTML = `
      <td>${d.toLocaleDateString()}</td>
      <td>${d.toLocaleTimeString()}</td>
      <td class="temp-value">${x.temperature.toFixed(1)} °C</td>
      <td class="humidity-value">${x.humidite.toFixed(1)} %</td>
    `;
    tableBody.prepend(row);
  });
}

// Mise à jour en temps réel via WebSocket
function updateUI(x) {
  const d = new Date(x.date);
  const formatted = `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;

  tempDisplay.textContent = `${x.temperature.toFixed(1)} °C`;
  humidityDisplay.textContent = `${x.humidite.toFixed(1)} %`;
  subtitle1.textContent = formatted;
  subtitle2.textContent = formatted;

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${d.toLocaleDateString()}</td>
    <td>${d.toLocaleTimeString()}</td>
    <td class="temp-value">${x.temperature.toFixed(1)} °C</td>
    <td class="humidity-value">${x.humidite.toFixed(1)} %</td>
  `;
  tableBody.prepend(row);

  const label = d.toLocaleTimeString();

  // Mise à jour tempChart
  if (tempChart) {
    tempChart.data.labels.push(label);
    tempChart.data.datasets[0].data.push(x.temperature);
    if (tempChart.data.labels.length > 20) {
      tempChart.data.labels.shift();
      tempChart.data.datasets[0].data.shift();
    }
    tempChart.update();
  }

  // Mise à jour humidityChart
  if (humidityChart) {
    humidityChart.data.labels.push(label);
    humidityChart.data.datasets[0].data.push(x.humidite);
    if (humidityChart.data.labels.length > 20) {
      humidityChart.data.labels.shift();
      humidityChart.data.datasets[0].data.shift();
    }
    humidityChart.update();
  }

  // Mise à jour combinedChart
  if (combinedChart) {
    combinedChart.data.labels.push(label);
    combinedChart.data.datasets[0].data.push(x.temperature);
    combinedChart.data.datasets[1].data.push(x.humidite);
    if (combinedChart.data.labels.length > 20) {
      combinedChart.data.labels.shift();
      combinedChart.data.datasets[0].data.shift();
      combinedChart.data.datasets[1].data.shift();
    }
    combinedChart.update();
  }
}

// exproter excel
function exportToExcel() {
  const table = document.getElementById('data-table');
  const wb = XLSX.utils.table_to_book(table, {sheet: "Données"});
  XLSX.writeFile(wb, 'donnees_meteo.xlsx');
}

function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text('Historique des données météo', 14, 15);
  doc.autoTable({
    html: '#data-table',
    startY: 20,
    styles: { fontSize: 8 }
  });

  // Méthode plus compatible mobile
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'meteo.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}




//Active navbar
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');

navToggle.addEventListener('click', () => {
  navList.classList.toggle('active');
});

// Cacher la nav quand on clique sur un lien
document.querySelectorAll('.nav-list a').forEach(link => {
  link.addEventListener('click', () => {
    navList.classList.remove('active');
  });
});

document.addEventListener('click', function (e) {
  if (!navList.contains(e.target) && !navToggle.contains(e.target)) {
    navList.classList.remove('active');
  }
});


//Afficher l'heure courante
function updateDateTime() {
  const now = new Date();
  const options = { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
    hour: '2-digit', minute: '2-digit', second: '2-digit' 
  };
  const formatted = now.toLocaleDateString('fr-FR', options);
  document.getElementById('current-datetime').textContent = formatted;
}

// Mise à jour toutes les secondes
setInterval(updateDateTime, 1000);
updateDateTime(); // appel initial direct pour pas attendre 1s

//Indicateur de connexion
const indicator = document.getElementById('connection-indicator');
const statusText = document.getElementById('connection-status-text');

function setConnected() {
  indicator.style.backgroundColor = 'green';
  statusText.textContent = 'Connecté';
}

function setDisconnected() {
  indicator.style.backgroundColor = 'red';
  statusText.textContent = 'Déconnecté';
}

// Lors de la connexion socket
socket.on('connect', () => {
  console.log('WebSocket connecté');
  setConnected();
});

// Lors de la déconnexion socket
socket.on('disconnect', () => {
  console.log('WebSocket déconnecté');
  setDisconnected();
});