# 🌤️ Meteolia - Dashboard Météorologique en Temps Réel

**Meteolia** est un tableau de bord moderne et responsive qui permet de surveiller la température et l'humidité en temps réel grâce à des capteurs connectés.  
Les données sont transmises via WebSocket et affichées sous forme de graphiques interactifs, de tableaux et de cartes dynamiques.

---

## 🚀 Démo en ligne

👉 [Voir le dashboard](https://arldev04.github.io/Meteolia_dashboard/) *(hébergé via GitHub Pages)*

---

## 📡 Fonctionnalités

- 🔄 **Mise à jour en temps réel** via WebSocket
- 📈 **Graphiques interactifs** (température, humidité, courbes combinées)
- 🗃️ **Historique des mesures**
- ⬇️ Export **Excel / PDF**
- 🟢🛑 Indicateur de **connexion au serveur**
- 📅 Affichage de l'**heure et de la date** de la dernière mesure
- 🌙 Design responsive et clair

---

## 🧰 Technologies utilisées

- **Frontend** : HTML, CSS, JavaScript, [Chart.js](https://www.chartjs.org/), WebSocket, jsPDF, XLSX
- **Backend** : Node.js, Express, Socket.IO
- **Base de données** : MongoDB Atlas
- **Déploiement** :
  - Frontend : GitHub Pages
  - Backend/API : Render

---


##  Sécurité & CORS
Le backend autorise les connexions cross-origin pour que GitHub Pages puisse interagir avec le serveur Render.

Les appels API sont encapsulés proprement côté frontend.