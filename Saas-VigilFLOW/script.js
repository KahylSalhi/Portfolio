let incidents = JSON.parse(localStorage.getItem("incidents")) || [];
let chart;
let machines = JSON.parse(localStorage.getItem("machines")) || [
  {
    nom: "NAS-01",
    ip: "192.168.1.10",
    type: "Serveur",
    statut: "online"
  },
  {
    nom: "PRINTER-ACCUEIL",
    ip: "192.168.1.50",
    type: "Imprimante",
    statut: "offline"
  },
  {
    nom: "WEB-SERVER",
    ip: "192.168.1.80",
    type: "Serveur web",
    statut: "warning"
  }
];

machines.forEach(machine => {

  if (!machine.dernierTest) {

    machine.dernierTest = new Date().toLocaleString();
  }
});

const table = document.getElementById("machinesTable");

function afficherMachines() {
  table.innerHTML = "";

  const recherche = document.getElementById("searchInput").value.toLowerCase();
  const filtreStatut = document.getElementById("statusFilter").value;

  machines
    .filter(machine => {
      const correspondRecherche =
        machine.nom.toLowerCase().includes(recherche) ||
        machine.ip.toLowerCase().includes(recherche) ||
        machine.type.toLowerCase().includes(recherche);

      const correspondStatut =
        filtreStatut === "all" || machine.statut === filtreStatut;

      return correspondRecherche && correspondStatut;
    })
    .forEach((machine) => {
      const vraiIndex = machines.indexOf(machine);

      table.innerHTML += `
        <tr>
          <td>${machine.nom}</td>
          <td>${machine.ip}</td>
          <td>${machine.type}</td>
          <td>
            <select onchange="changerStatut(${vraiIndex}, this.value)">
              <option value="online" ${machine.statut === "online" ? "selected" : ""}>Online</option>
              <option value="offline" ${machine.statut === "offline" ? "selected" : ""}>Offline</option>
              <option value="warning" ${machine.statut === "warning" ? "selected" : ""}>Warning</option>
            </select>
          </td>
          <td>
            <button class="delete-btn" onclick="supprimerMachine(${vraiIndex})">
              Supprimer
            </button>
          </td>
          <td>${machine.dernierTest || "Non testé"}</td>

          <td>
          <button class="test-btn"
          onclick="testerMachine(${vraiIndex})">
          Tester
          </button>
          </td>
        </tr>
      `;
    });

  mettreAJourStats();
  creerGraphique();
}

function ajouterMachine() {
  const nom = document.getElementById("nomMachine").value;
  const ip = document.getElementById("ipMachine").value;
  const type = document.getElementById("typeMachine").value;

  if (nom === "" || ip === "") {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  const nouvelleMachine = {
    nom: nom,
    ip: ip,
    type: type,
    statut: "online",
    dernierTest: new Date().toLocaleString()
  };

  machines.push(nouvelleMachine);

  localStorage.setItem("machines", JSON.stringify(machines));

  afficherMachines();

  document.getElementById("nomMachine").value = "";
  document.getElementById("ipMachine").value = "";
}

afficherMachines();

function supprimerMachine(index) {

  machines.splice(index, 1);

  localStorage.setItem("machines", JSON.stringify(machines));

  afficherMachines();
}

function mettreAJourStats() {
  const total = machines.length;
  const online = machines.filter(machine => machine.statut === "online").length;
  const offline = machines.filter(machine => machine.statut === "offline").length;
  const warning = machines.filter(machine => machine.statut === "warning").length;

  document.getElementById("totalMachines").textContent = total;
  document.getElementById("onlineMachines").textContent = online;
  document.getElementById("offlineMachines").textContent = offline;
  document.getElementById("warningMachines").textContent = warning;
}

mettreAJourStats();

function changerStatut(index, nouveauStatut) {

  machines[index].statut = nouveauStatut;

  if (nouveauStatut === "offline") {

  afficherNotification(
    `❌ ${machines[index].nom} est hors ligne`
  );

  ajouterIncident(
    `${machines[index].nom} est hors ligne`
  );
}

if (nouveauStatut === "warning") {

  afficherNotification(
    `⚠️ ${machines[index].nom} présente une anomalie`
  );

  ajouterIncident(
    `${machines[index].nom} est en warning`
  );
}

  localStorage.setItem(
    "machines",
    JSON.stringify(machines)
  );

  afficherMachines();
}

function afficherUtilisateur() {
  const userArea = document.getElementById("userArea");
  const user = JSON.parse(localStorage.getItem("user"));

  if (user && user.connected === true) {
   userArea.innerHTML = `
  <div class="user-box">

    <div class="user-avatar">
      ${user.email.charAt(0).toUpperCase()}
    </div>

    <div class="user-info">
      <span>${user.email}</span>
      <small>Administrateur</small>
    </div>

    <button onclick="deconnexion()" class="logout-btn">
      Déconnexion
    </button>

  </div>
`;
  }
}

function deconnexion() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

afficherUtilisateur();

function creerGraphique() {

  const online = machines.filter(
    machine => machine.statut === "online"
  ).length;

  const offline = machines.filter(
    machine => machine.statut === "offline"
  ).length;

  const warning = machines.filter(
    machine => machine.statut === "warning"
  ).length;

  const ctx = document.getElementById("statusChart");

  if (chart) {

  chart.data.datasets[0].data = [
    online,
    offline,
    warning
  ];

  chart.update();

  return;
}

  chart = new Chart(ctx, {

    type: "doughnut",

    data: {

      labels: [
        "Online",
        "Offline",
        "Warning"
      ],

      datasets: [{
        data: [
          online,
          offline,
          warning
        ],

        backgroundColor: [
          "#22c55e",
          "#ef4444",
          "#f59e0b"
        ],

        borderWidth: 0
      }]
    },

    options: {

      responsive: false,

      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}
creerGraphique();

function afficherNotification(message) {

  const notifications =
    document.getElementById("notifications");

  const notif = document.createElement("div");

  notif.classList.add("notification");

if (message.includes("⚠️")) {
  notif.classList.add("warning-notif");
}

if (message.includes("❌")) {
  notif.classList.add("danger-notif");
}

  notif.textContent = message;

  notifications.appendChild(notif);

  setTimeout(() => {
    notif.remove();
  }, 4000);
}

function ajouterIncident(message) {

  const incident = {
    message: message,
    date: new Date().toLocaleString()
  };

  incidents.unshift(incident);

  localStorage.setItem(
    "incidents",
    JSON.stringify(incidents)
  );

  afficherIncidents();
}

function afficherIncidents() {

  const container =
    document.getElementById("incidentsList");

  container.innerHTML = "";

  incidents.slice(0, 5).forEach(incident => {

    container.innerHTML += `
      <div class="incident-item">

        <strong>${incident.message}</strong>

        <p>${incident.date}</p>

      </div>
    `;
  });
}

function testerMachine(index) {
  const statuts = ["online", "warning", "offline"];
  const nouveauStatut = statuts[Math.floor(Math.random() * statuts.length)];

  machines[index].statut = nouveauStatut;
  machines[index].dernierTest = new Date().toLocaleString();

  if (nouveauStatut === "offline") {
    afficherNotification(`❌ ${machines[index].nom} est hors ligne`);
    ajouterIncident(`${machines[index].nom} est hors ligne`);
  }

  if (nouveauStatut === "warning") {
    afficherNotification(`⚠️ ${machines[index].nom} présente une anomalie`);
    ajouterIncident(`${machines[index].nom} est en warning`);
  }

  localStorage.setItem("machines", JSON.stringify(machines));
  afficherMachines();
}
