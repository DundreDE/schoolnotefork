const BASE_URL = "https://api.schoolnote.eu";
const USER_ID = localStorage.getItem("user_id");

if (!USER_ID) {
  window.location.href = "auth.html";
}

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Serverfehler");
  }
  return await response.json();
}

async function loadStundenanzahl() {
  try {
    const data = await fetchJSON(`${BASE_URL}/stundenplan_config?user_id=${USER_ID}`);
    return parseInt(data.stundenanzahl, 10);
  } catch (error) {
    console.error(error);
    return 8;
  }
}

async function saveStundenanzahlValue(value) {
  try {
    const data = await fetchJSON(`${BASE_URL}/stundenplan_config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: USER_ID, stundenanzahl: value })
    });
    alert(data.message);
    return value;
  } catch (error) {
    console.error(error);
    alert("Fehler beim Speichern der Stundenanzahl.");
  }
}

async function loadStundenplanEntries() {
  try {
    return await fetchJSON(`${BASE_URL}/stundenplan?user_id=${USER_ID}`);
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function saveStundenplanEntry(entry) {
  try {
    const data = await fetchJSON(`${BASE_URL}/stundenplan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...entry, user_id: USER_ID })
    });
    console.log(data.message);
  } catch (error) {
    console.error(error);
    alert("Fehler beim Speichern des Eintrags.");
  }
}

async function deleteStundenplanEntry(tag, stunde) {
  try {
    const url = `${BASE_URL}/stundenplan?user_id=${USER_ID}&tag=${encodeURIComponent(tag)}&stunde=${stunde}`;
    const data = await fetchJSON(url, { method: "DELETE" });
    console.log(data.message);
  } catch (error) {
    console.error(error);
    alert("Fehler beim Löschen des Eintrags.");
  }
}

async function displayStundenplan() {
  const stundenplanContainer = document.getElementById("stundenplanContainer");
  if (!stundenplanContainer) return;

  const stundenanzahl = await loadStundenanzahl();
  const entries = await loadStundenplanEntries();
  const tage = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];

  const stundenplanByDay = {};
  tage.forEach(tag => {
    stundenplanByDay[tag] = Array(stundenanzahl).fill(null);
  });

  entries.forEach(entry => {
    if (stundenplanByDay[entry.tag] && entry.stunde >= 1 && entry.stunde <= stundenanzahl) {
      stundenplanByDay[entry.tag][entry.stunde - 1] = entry.name;
    }
  });

  stundenplanContainer.innerHTML = "";
  tage.forEach(tag => {
    const section = document.createElement("div");
    section.className = "bg-white p-4 rounded shadow flex-1 min-w-[200px] mb-4";
    let innerHTML = `
      <h3 class="text-xl font-semibold text-orange-600 mb-2">${tag}</h3>
      <div class="grid gap-2" style="grid-template-rows: repeat(${stundenanzahl}, minmax(0, 1fr));">
    `;
    stundenplanByDay[tag].forEach((fach, index) => {
      const cellId = `cell-${tag}-${index + 1}`;
      if (fach) {
        innerHTML += `
          <div id="${cellId}" class="p-3 border rounded bg-gray-100 cursor-pointer" ondblclick="editSubject('${tag}', ${index + 1}, '${encodeURIComponent(fach)}')">
            ${index + 1}. Stunde: <span class="subject">${fach}</span>
          </div>
        `;
      } else {
        innerHTML += `
          <div id="${cellId}" class="p-3 border rounded bg-gray-200">
            ${index + 1}. Stunde: Keine Aufgabe
          </div>
        `;
      }
    });
    innerHTML += "</div>";
    section.innerHTML = innerHTML;
    stundenplanContainer.appendChild(section);
  });
}

async function updateStundenanzahlDropdown() {
  const stundenAnzahlInput = document.getElementById("stundenAnzahl");
  const fachStundeDropdown = document.getElementById("fachStunde");
  if (!stundenAnzahlInput || !fachStundeDropdown) return;

  const stundenanzahl = await loadStundenanzahl();
  stundenAnzahlInput.value = stundenanzahl;
  fachStundeDropdown.innerHTML = "";
  for (let i = 1; i <= stundenanzahl; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `${i}. Stunde`;
    fachStundeDropdown.appendChild(option);
  }
}

async function saveStundenanzahl() {
  const stundenAnzahlInput = document.getElementById("stundenAnzahl");
  if (!stundenAnzahlInput) return;
  const value = parseInt(stundenAnzahlInput.value, 10);
  await saveStundenanzahlValue(value);
  await updateStundenanzahlDropdown();
  await displayStundenplan();
}

async function saveFach() {
  const fachNameInput = document.getElementById("fachName");
  const fachStundeDropdown = document.getElementById("fachStunde");
  const fachTagSelect = document.getElementById("fachTag");
  if (!fachNameInput || !fachStundeDropdown || !fachTagSelect) return;

  const fachName = fachNameInput.value.trim();
  const fachStunde = parseInt(fachStundeDropdown.value, 10);
  const fachTag = fachTagSelect.value;
  if (!fachName || fachStunde < 1) return;

  // Überprüfe, ob Doppelstunde ausgewählt wurde
  const isDoppelstunde = document.getElementById("doppelstunde")?.checked;
  const stundenAnzahl = parseInt(document.getElementById("stundenAnzahl").value, 10);

  if (isDoppelstunde) {
    if (fachStunde >= stundenAnzahl) {
      alert("Doppelstunde kann nicht für die letzte Stunde gewählt werden.");
      return;
    }
    // Speichere den Eintrag für die gewählte Stunde und die folgende Stunde
    await saveStundenplanEntry({ tag: fachTag, stunde: fachStunde, name: fachName });
    await saveStundenplanEntry({ tag: fachTag, stunde: fachStunde + 1, name: fachName });
  } else {
    await saveStundenplanEntry({ tag: fachTag, stunde: fachStunde, name: fachName });
  }
  fachNameInput.value = "";
  // Setze die Doppelstunde-Checkbox zurück
  if (document.getElementById("doppelstunde")) {
    document.getElementById("doppelstunde").checked = false;
  }
  await displayStundenplan();
  await loadFaecherListe();
}

function editSubject(tag, stunde, encodedName) {
  const currentName = decodeURIComponent(encodedName);
  const cellId = `cell-${tag}-${stunde}`;
  const cell = document.getElementById(cellId);
  if (cell) {
    cell.innerHTML = `
      ${stunde}. Stunde: 
      <input type="text" id="input-${cellId}" class="p-1 border rounded w-full" value="${currentName}" />
      <button onclick="saveEditedSubject('${tag}', ${stunde})" class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded ml-2">
        Speichern
      </button>
    `;
    const input = document.getElementById(`input-${cellId}`);
    input.focus();
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        saveEditedSubject(tag, stunde);
      }
    });
  }
}

async function saveEditedSubject(tag, stunde) {
  const cellId = `cell-${tag}-${stunde}`;
  const input = document.querySelector(`#${cellId} input`);
  if (!input) return;
  const newName = input.value.trim();
  if (!newName) {
    await deleteStundenplanEntry(tag, stunde);
  } else {
    await saveStundenplanEntry({ tag, stunde, name: newName });
  }
  await displayStundenplan();
  await loadFaecherListe();
}

async function loadFaecherListe() {
  const faecherListe = document.getElementById("faecherListe");
  if (!faecherListe) return;
  try {
    const entries = await loadStundenplanEntries();
    faecherListe.innerHTML = "";
    entries.forEach(entry => {
      const div = document.createElement("div");
      div.className = "bg-white p-4 rounded shadow flex justify-between items-center";
      div.innerHTML = `
        <span>${entry.tag} - ${entry.stunde}. Stunde: ${entry.name}</span>
        <button onclick="deleteStundenplanEntry('${entry.tag}', ${entry.stunde})" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
          Entfernen
        </button>
      `;
      faecherListe.appendChild(div);
    });
  } catch (error) {
    console.error(error);
  }
}

async function loadNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) {
    console.error("Navbar-Element nicht gefunden!");
    return;
  }
  navbar.innerHTML = `
    <!-- Hier den HTML-Code der Navigationsleiste einfügen -->
    <nav> ...deine Navigation... </nav>
  `;
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadNavbar();
  await updateStundenanzahlDropdown();
  await displayStundenplan();
  await loadFaecherListe();
  // Navigation für Mobile
});