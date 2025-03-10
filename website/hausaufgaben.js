let faecher = [],
        hausaufgaben = [],
        klassen = [],
        selectedFachId = null,
        bearbeitenModus = false,       // Für Fächer
        bearbeitenKlassen = false,     // Für Klassen
        sortByCreationDate = false,
        currentTaskId = null,          // Für Kommentar-Modus
        missingHistory = [];           // Aggregierte Missing History

    // Aus localStorage auslesen
    const userId = localStorage.getItem('user_id');
    const personType = localStorage.getItem('person_type');
    const isTeacher = personType && personType.toLowerCase() === "lehrer";
    console.log("Aktueller person_type:", personType);
    if (!userId) window.location.href = "auth.html";

    // Initiale Ladefunktion
    window.onload = function() {
      if (!userId) {
        alert("Bitte einloggen, um fortzufahren!");
        window.location.href = 'auth.html';
      } else {
        loadFaecher();
        loadHausaufgaben();
        if (isTeacher) {
          document.getElementById("toggleViewButton").textContent = "Wechsel zu Klassenverwaltung";
          loadKlassen();
          loadMissingHistory(); // Aggregierte Missing History nur für Lehrer laden
        } else {
          document.getElementById("toggleViewButton").classList.add("hidden");
        }
      }
    };

    // Umschalten zwischen individuellen Hausaufgaben und Klassenverwaltung
    function toggleView() {
      const homeworkSection = document.getElementById("homeworkSection");
      const klassenSection = document.getElementById("klassenSection");
      const toggleButton = document.getElementById("toggleViewButton");
      if (homeworkSection.classList.contains("hidden")) {
        homeworkSection.classList.remove("hidden");
        klassenSection.classList.add("hidden");
        toggleButton.textContent = "Wechsel zu Klassenverwaltung";
      } else {
        homeworkSection.classList.add("hidden");
        klassenSection.classList.remove("hidden");
        toggleButton.textContent = "Wechsel zu Hausaufgaben";
      }
    }

    // --- Fächer-Funktionen ---
    async function loadFaecher() {
      const url = `https://api.schoolnote.eu/faecher?user_id=${userId}`;
      const response = await fetch(url);
      if (!response.ok) {
        let errorMsg = response.statusText;
        try { const errorData = await response.json(); if (errorData.message) errorMsg = errorData.message; } catch(e){}
        throw new Error(errorMsg);
      }
      faecher = await response.json();
      updateFachSelect();
      if(bearbeitenModus) updateFaecherListe();
      if (!selectedFachId && faecher.length > 0) selectedFachId = faecher[0].id;
    }

    async function addFach() {
      const fachName = document.getElementById('fachName').value.trim();
      if (fachName) {
        const response = await fetch('https://api.schoolnote.eu/faecher', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: fachName, user_id: userId })
        });
        if (response.ok) { document.getElementById('fachName').value = ''; loadFaecher(); }
      }
    }

    async function deleteFach(fachId) {
      if (confirm("Möchtest du dieses Fach wirklich löschen? Dadurch werden auch alle zugehörigen Hausaufgaben entfernt.")) {
        await fetch(`https://api.schoolnote.eu/faecher/${fachId}`, { method: 'DELETE' });
        loadFaecher();
      }
    }

    function updateFachSelect() {
      const fachSelect = document.getElementById('fachSelect');
      if (!fachSelect) return;
      fachSelect.innerHTML = '';
      faecher.forEach(fach => {
        const option = document.createElement('option');
        option.value = fach.id;
        option.textContent = fach.name;
        if (fach.id === selectedFachId) option.selected = true;
        fachSelect.appendChild(option);
      });
    }

    function selectFach() {
      const fachSelect = document.getElementById('fachSelect');
      if (fachSelect) selectedFachId = parseInt(fachSelect.value);
    }

    // --- Hausaufgaben-Funktionen ---
    async function loadHausaufgaben() {
      try {
        const url = `https://api.schoolnote.eu/hausaufgaben?user_id=${userId}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Fehler beim Laden der Hausaufgaben");
        hausaufgaben = await response.json();
        renderHausaufgaben();
      } catch (error) {
        console.error("Fehler beim Laden der Hausaufgaben:", error);
      }
    }

    async function addHausaufgabe() {
      const description = document.getElementById('aufgabeText').value.trim();
      const dateInput = document.getElementById('datum').value;
      if (!dateInput) { 
        alert("Bitte ein Datum auswählen!"); 
        return; 
      }
      const selectedFach = faecher.find(f => f.id === selectedFachId);
      if (!selectedFach) { 
        alert("Bitte wähle ein gültiges Fach aus."); 
        return; 
      }
      // Neuer Fall: Erfassung des Typs (Hausaufgabe oder Test)
      const taskType = document.getElementById('taskTypeSelect').value;
      const title = selectedFach.name;
      const payload = {
        title,
        description,
        deadline: dateInput,
        fach_id: selectedFachId,
        user_id: userId,
        task_type: taskType
      };
      
      await fetch('https://api.schoolnote.eu/hausaufgaben', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      document.getElementById('aufgabeText').value = '';
      document.getElementById('datum').value = '';
      // Optional: Setze die Auswahl zurück (standardmäßig Hausaufgabe)
      document.getElementById('taskTypeSelect').value = 'hausaufgabe';
      loadHausaufgaben();
    }

    async function updateHausaufgabeStatus(taskId, status) {
      await fetch(`https://api.schoolnote.eu/hausaufgaben/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      loadHausaufgaben();
    }

    async function deleteHausaufgabe(taskId) {
      await fetch(`https://api.schoolnote.eu/hausaufgaben/${taskId}`, { method: 'DELETE' });
      loadHausaufgaben();
    }

    function toggleSort() {
      sortByCreationDate = !sortByCreationDate;
      document.getElementById('toggleSortButton').textContent = sortByCreationDate ? 'Sortierung: Erstellungsdatum' : 'Sortierung: Deadline';
      renderHausaufgaben();
    }

function renderHausaufgaben() {
  const container = document.getElementById('hausaufgabenContainer');
  container.innerHTML = '';

  // Sort tasks based on the selected sort mode.
  let sortedTasks = [...hausaufgaben];
  if (sortByCreationDate) {
    sortedTasks.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  } else {
    sortedTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }
  
  // Filter tasks using den neuen Task-Type Filter
  const currentFilter = filterOptions[taskTypeFilterIndex];
  if (currentFilter !== "alle") {
    sortedTasks = sortedTasks.filter(task => task.task_type === currentFilter);
  }

  sortedTasks.forEach(task => {
    const taskDiv = document.createElement('div');
    taskDiv.className = `relative bg-white p-4 rounded shadow-lg my-2 ${task.status === 'erledigt' ? 'bg-green-100' : ''}`;
    taskDiv.innerHTML = `
      <h3 class="text-xl font-semibold">${task.title}</h3>
      <p class="text-gray-700">${task.description || 'Keine Beschreibung'}</p>
      <p class="text-gray-500">${new Date(task.deadline).toLocaleDateString()}</p>
      <p class="text-gray-600">Status: ${task.status}</p>
      <p class="text-gray-600">Typ: ${task.task_type === "test" ? "Test" : "Hausaufgabe"}</p>
    `;
    // Falls ein Kommentar vorhanden ist, anzeigen:
    if (task.comment && task.comment.trim() !== "") {
      const commentP = document.createElement("p");
      commentP.className = "text-gray-600";
      commentP.textContent = "Kommentar: " + task.comment;
      taskDiv.appendChild(commentP);
    }
    // (Buttons je nach Task-Typ – unverändert)
    const btnContainer = document.createElement('div');
    btnContainer.className = "absolute top-2 right-2 flex flex-col gap-2";
    if (task.is_class_task) {
      btnContainer.innerHTML = `
        <button onclick="submitAndRecord(${task.id}, '${task.title.replace(/'/g, "\\'")}')" class="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded w-8 h-8 flex items-center justify-center" title="Abgegeben">
          <!-- SVG Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <button onclick="deleteKlassenHausaufgabe(${task.id})" class="bg-red-500 hover:bg-red-600 text-white p-1 rounded w-8 h-8 flex items-center justify-center" title="Löschen">
          <!-- SVG Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <button onclick="showCommentModal(${task.id})" class="bg-purple-500 hover:bg-purple-600 text-white p-1 rounded w-8 h-8 flex items-center justify-center" title="Kommentar">
          <!-- SVG Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.96 8.96 0 01-4.654-1.181L2 17l1.181-3.346A7.973 7.973 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clip-rule="evenodd" />
          </svg>
        </button>
      `;
    } else {
      btnContainer.innerHTML = `
        <button onclick="updateHausaufgabeStatus(${task.id}, 'erledigt')" class="bg-green-500 hover:bg-green-600 text-white p-1 rounded w-8 h-8 flex items-center justify-center" title="Erledigt">
          <!-- SVG Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <button onclick="deleteHausaufgabe(${task.id})" class="bg-red-500 hover:bg-red-600 text-white p-1 rounded w-8 h-8 flex items-center justify-center" title="Löschen">
          <!-- SVG Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <button onclick="showCommentModal(${task.id})" class="bg-purple-500 hover:bg-purple-600 text-white p-1 rounded w-8 h-8 flex items-center justify-center" title="Kommentar">
          <!-- SVG Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.96 8.96 0 01-4.654-1.181L2 17l1.181-3.346A7.973 7.973 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clip-rule="evenodd" />
          </svg>
        </button>
      `;
    }
    taskDiv.appendChild(btnContainer);
    container.appendChild(taskDiv);
  });
}

    // --- Kommentar-Modal ---
    function showCommentModal(taskId) {
      currentTaskId = taskId;
      document.getElementById("commentInput").value = "";
      document.getElementById("commentModal").classList.remove("hidden");
    }
    document.getElementById("cancelButton").addEventListener("click", () => {
      document.getElementById("commentModal").classList.add("hidden");
    });
    document.getElementById("saveButton").addEventListener("click", async () => {
      const comment = document.getElementById("commentInput").value.trim();
      if(comment === "") { alert("Bitte gib einen Kommentar ein."); return; }
      await fetch(`https://api.schoolnote.eu/hausaufgaben/${currentTaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment })
      });
      document.getElementById("commentModal").classList.add("hidden");
      loadHausaufgaben();
      if(document.getElementById("klassenHausaufgabenContainer").innerHTML !== "") loadKlassenHausaufgaben();
    });

    // --- Lehrer-Funktionen: Klassenverwaltung & Missing History ---
    async function loadKlassen() {
      const url = `https://api.schoolnote.eu/klassen?teacher_id=${userId}`;
      const response = await fetch(url);
      klassen = await response.json();
      updateKlassenListe();
      updateKlassenSelect();
      updateKlassenSelectForStudents();
    }

    async function addKlasse() {
      const klasseName = document.getElementById('klasseName').value.trim();
      if (!klasseName) { alert("Bitte gib einen Klassennamen ein."); return; }
      await fetch('https://api.schoolnote.eu/klassen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: klasseName, teacher_id: userId })
      });
      document.getElementById('klasseName').value = '';
      loadKlassen();
    }

    async function deleteKlasse(klasseId) {
      if (confirm("Möchtest du diese Klasse wirklich löschen? Dadurch werden auch alle zugehörigen Hausaufgaben entfernt.")) {
        await fetch(`https://api.schoolnote.eu/klassen/${klasseId}`, { method: 'DELETE' });
        loadKlassen();
      }
    }

    function updateKlassenListe() {
      const klassenListeDiv = document.getElementById('klassenListe');
      klassenListeDiv.innerHTML = '';
      klassen.forEach(klasse => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-2 border-b';
        div.innerHTML = `<span class="text-lg font-semibold">${klasse.name}</span>`;
        div.onclick = () => { /* Optional: Weitere Details anzeigen */ };
        klassenListeDiv.appendChild(div);
      });
    }

    function updateKlassenSelect() {
      const klasseSelect = document.getElementById('klasseSelect');
      if (!klasseSelect) return;
      klasseSelect.innerHTML = '';
      klassen.forEach(klasse => {
        const option = document.createElement('option');
        option.value = klasse.id;
        option.textContent = klasse.name;
        klasseSelect.appendChild(option);
      });
      if(klasseSelect.value) loadKlassenHausaufgaben();
      klasseSelect.addEventListener('change', loadKlassenHausaufgaben);
    }

    function updateKlassenSelectForStudents() {
      const klasseSelectStudents = document.getElementById('klasseSelectStudents');
      if (!klasseSelectStudents) return;
      klasseSelectStudents.innerHTML = '';
      klassen.forEach(klasse => {
        const option = document.createElement('option');
        option.value = klasse.id;
        option.textContent = klasse.name;
        klasseSelectStudents.appendChild(option);
      });
    }

    function toggleBearbeitenKlassen() {
      bearbeitenKlassen = !bearbeitenKlassen;
      const container = document.getElementById("klassenListeContainer");
      container.classList.toggle("hidden", !bearbeitenKlassen);
      const button = document.getElementById("bearbeitenKlassenButton");
      button.textContent = bearbeitenKlassen ? "Fertig" : "Klassen bearbeiten";
      updateKlassenListe();
    }

    async function addHausaufgabeKlasse() {
      const klasseSelect = document.getElementById('klasseSelect');
      const fachInput = document.getElementById('fachInputKlasse');
      const aufgabeText = document.getElementById('aufgabeTextKlasse').value.trim();
      const datum = document.getElementById('datumKlasse').value;
      if (!klasseSelect || !fachInput || !aufgabeText || !datum) { alert("Bitte alle Felder ausfüllen."); return; }
      const klasse_id = klasseSelect.value;
      const fachName = fachInput.value.trim();
      if (!fachName) { alert("Bitte einen Fachnamen eingeben."); return; }
      const fach_id = await ensureFachExists(fachName);
      if (!fach_id) { alert("Fach konnte nicht erstellt werden."); return; }
      const response = await fetch(`https://api.schoolnote.eu/klassen/${klasse_id}/hausaufgaben`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: userId,
          title: fachName,
          deadline: datum,
          fach_id: fach_id,
          description: aufgabeText
        })
      });
      if (response.ok) {
        document.getElementById('aufgabeTextKlasse').value = '';
        document.getElementById('datumKlasse').value = '';
        document.getElementById('fachInputKlasse').value = '';
        alert("Hausaufgabe für die Klasse hinzugefügt.");
        loadKlassenHausaufgaben();
      } else {
        alert("Fehler beim Hinzufügen der Klassenhausaufgabe.");
      }
    }

    async function ensureFachExists(fachName) {
      const existingFach = faecher.find(f => f.name.toLowerCase() === fachName.toLowerCase());
      if (existingFach) return existingFach.id;
      const response = await fetch('https://api.schoolnote.eu/faecher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fachName, user_id: userId })
      });
      if (response.ok) {
        await loadFaecher();
        const newFach = faecher.find(f => f.name.toLowerCase() === fachName.toLowerCase());
        return newFach ? newFach.id : null;
      }
      return null;
    }

    async function loadKlassenHausaufgaben() {
      const klasseSelect = document.getElementById('klasseSelect');
      const klasse_id = klasseSelect.value;
      if (!klasse_id) return;
      const url = `https://api.schoolnote.eu/klassen/${klasse_id}/hausaufgaben`;
      try {
        const response = await fetch(url);
        const tasks = await response.json();
        renderKlassenHausaufgaben(tasks);
      } catch (error) {
        console.error("Fehler beim Laden der Klassenaufgaben:", error);
      }
    }

    function renderKlassenHausaufgaben(tasks) {
      const container = document.getElementById('klassenHausaufgabenContainer');
      if (!container) return;
      container.innerHTML = '';
      tasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = "bg-white p-4 rounded shadow-lg my-2";
        taskDiv.innerHTML = `
          <h3 class="text-xl font-semibold">${task.title}</h3>
          <p class="text-gray-700">${task.description || 'Keine Beschreibung'}</p>
          <p class="text-gray-500">${new Date(task.deadline).toLocaleDateString()}</p>
          <p class="text-gray-600">Status: ${task.status}</p>
        `;
        if (task.comment) {
          const commentP = document.createElement('p');
          commentP.textContent = "Kommentar: " + task.comment;
          taskDiv.appendChild(commentP);
        }
        const btnContainer = document.createElement('div');
        btnContainer.className = "flex flex-wrap gap-2 mt-2";
        btnContainer.innerHTML = `
          <button onclick="submitAndRecord(${task.id}, '${task.title.replace(/'/g, "\\'")}')" class="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded w-8 h-8 flex items-center justify-center" title="Abgegeben">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button onclick="deleteKlassenHausaufgabe(${task.id})" class="bg-red-500 hover:bg-red-600 text-white p-1 rounded w-8 h-8 flex items-center justify-center" title="Löschen">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <button onclick="showCommentModal(${task.id})" class="bg-purple-500 hover:bg-purple-600 text-white p-1 rounded w-8 h-8 flex items-center justify-center" title="Kommentar">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
            </svg>
          </button>
        `;
        taskDiv.appendChild(btnContainer);
        container.appendChild(taskDiv);
      });
    }

    async function updateKlassenHausaufgabeStatus(taskId, status) {
      const response = await fetch(`https://api.schoolnote.eu/klassen/hausaufgaben/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if(response.ok) loadKlassenHausaufgaben();
    }

    async function deleteKlassenHausaufgabe(taskId) {
      const response = await fetch(`https://api.schoolnote.eu/klassen/hausaufgaben/${taskId}`, { method: 'DELETE' });
      if(response.ok) loadKlassenHausaufgaben();
    }

    // Bei "Abgegeben" – Status setzen, fehlende Schüler abrufen und Missing History speichern
    async function submitAndRecord(taskId, title) {
      try {
        const response = await fetch(`https://api.schoolnote.eu/klassen/hausaufgaben/${taskId}`, {
          method: 'PATCH',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ status: 'abgegeben' })
        });
        if(response.ok) {
          await loadKlassenHausaufgaben();
          const missingResponse = await fetch(`https://api.schoolnote.eu/klassen/hausaufgaben/${taskId}/missing`);
          if(missingResponse.ok) {
            const missingData = await missingResponse.json();
            await fetch('https://api.schoolnote.eu/missing_history', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                teacher_id: userId,
                task_id: taskId,
                title: title,
                missing: missingData.missing
              })
            });
            loadMissingHistory();
            // Optional: Ein aggregiertes Modal anzeigen (hier nur als Beispiel)
            showMissingModalAggregated({
              student_id: "Aggregiert",
              email: "",
              count: missingData.missing.length,
              details: missingData.missing.map(item => ({ title: title, timestamp: new Date().toLocaleString() }))
            });
          } else {
            console.error("Fehler beim Abrufen der Vergessensliste");
          }
        } else {
          console.error("Fehler beim Setzen des Status 'abgegeben'");
        }
      } catch(error) {
        console.error(error);
      }
    }

    function showMissingModalAggregated(record) {
      const modal = document.getElementById("missingModal");
      const modalTitle = document.getElementById("missingModalTitle");
      const modalContent = document.getElementById("missingModalContent");
      modalTitle.textContent = `Details für Student: ${record.student_id} (${record.email})`;
      if(record.details && record.details.length > 0){
        modalContent.innerHTML = "<ul>" + record.details.map(item => `<li>${item.title} am ${item.timestamp}</li>`).join("") + "</ul>";
      } else {
        modalContent.innerHTML = `<p>Anzahl Fehlversuche: ${record.count}</p>`;
      }
      modal.classList.remove("hidden");
    }

    function hideMissingModal() {
      document.getElementById("missingModal").classList.add("hidden");
    }

    async function loadMissingHistory() {
      try {
        const response = await fetch(`https://api.schoolnote.eu/missing_history/aggregate?teacher_id=${userId}`);
        if(response.ok) {
          missingHistory = await response.json();
          updateMissingHistoryUI();
        } else {
          console.error("Fehler beim Laden der Missing History");
        }
      } catch(error) {
        console.error(error);
      }
    }

    function updateMissingHistoryUI() {
      const container = document.getElementById("missingHistoryContainer");
      container.innerHTML = "";
      if(missingHistory.length === 0) {
        container.innerHTML = "<p>Keine Vergessensliste vorhanden.</p>";
      } else {
        missingHistory.forEach(record => {
          const div = document.createElement("div");
          div.className = "border p-2 mb-2 cursor-pointer";
          div.innerHTML = `<p><strong>Student:</strong> ${record.student_id} (${record.email})</p>
                           <p><strong>Anzahl Fehlversuche:</strong> ${record.count}</p>`;
          div.setAttribute("data-record", encodeURIComponent(JSON.stringify(record)));
          div.addEventListener("click", function() {
            const rec = JSON.parse(decodeURIComponent(this.getAttribute("data-record")));
            showMissingModalAggregated(rec);
          });
          container.appendChild(div);
        });
      }
      const section = document.getElementById("missingHistorySection");
      if(missingHistory.length > 0) section.classList.remove("hidden");
      else section.classList.add("hidden");
    }

    async function exportMissingHistory() {
      if (missingHistory.length === 0) {
        alert("Keine Daten zum Exportieren vorhanden.");
        return;
      }
      let csvContent = "data:text/csv;charset=utf-8,Student,Email,Anzahl Fehlversuche\n";
      missingHistory.forEach(record => {
        csvContent += '"' + record.student_id + '","' + record.email + '","' + record.count + '"\n';
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "vergessensliste.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    async function resetMissingHistory() {
      if(confirm("Bist du sicher, dass du die Vergessensliste zurücksetzen möchtest?")) {
        try {
          const response = await fetch(`https://api.schoolnote.eu/missing_history?teacher_id=${userId}`, { method: 'DELETE' });
          if(response.ok) {
            missingHistory = [];
            updateMissingHistoryUI();
          } else {
            alert("Fehler beim Zurücksetzen der Vergessensliste.");
          }
        } catch(error) {
          console.error(error);
          alert("Fehler beim Zurücksetzen der Vergessensliste.");
        }
      }
    }

    // Toggle editing mode for Fächer (subjects)
    function toggleBearbeiten() {
      bearbeitenModus = !bearbeitenModus;
      const fachEditSection = document.getElementById("fachEditSection");
      fachEditSection.classList.toggle("hidden", !bearbeitenModus);
      const bearbeitenButton = document.getElementById("bearbeitenButton");
      bearbeitenButton.textContent = bearbeitenModus ? "Fertig" : "Bearbeiten";
      if (bearbeitenModus) updateFaecherListe();
    }

    // Update the list of Fächer with a delete button for each
    function updateFaecherListe() {
      const liste = document.getElementById("faecherListe");
      liste.innerHTML = "";
      faecher.forEach(fach => {
        const div = document.createElement("div");
        div.className = "flex justify-between items-center p-2 border-b";
        div.innerHTML = `<span class="text-lg">${fach.name}</span>
                         <button onclick="deleteFach(${fach.id})" class="bg-red-500 hover:bg-red-600 text-white p-1 rounded">
                            Löschen
                         </button>`;
        liste.appendChild(div);
      });
    }

    // When Fächer are loaded, update both select and edit mode list
    async function loadFaecher() {
      const url = `https://api.schoolnote.eu/faecher?user_id=${userId}`;
      const response = await fetch(url);
      if (!response.ok) {
        let errorMsg = response.statusText;
        try { 
          const errorData = await response.json(); 
          if (errorData.message) errorMsg = errorData.message; 
        } catch(e){}
        throw new Error(errorMsg);
      }
      faecher = await response.json();
      updateFachSelect();
      if(bearbeitenModus) updateFaecherListe();
      if (!selectedFachId && faecher.length > 0) selectedFachId = faecher[0].id;
    }

    let taskTypeFilterIndex = 0;
    const filterOptions = ["alle", "hausaufgabe", "test"];
    const filterLabels = ["Alle Aufgaben", "Hausaufgaben", "Tests"];

    function toggleTaskTypeFilter() {
      taskTypeFilterIndex = (taskTypeFilterIndex + 1) % filterOptions.length;
      const btn = document.getElementById("toggleTaskTypeFilterButton");
      btn.textContent = "Filter: " + filterLabels[taskTypeFilterIndex];
      renderHausaufgaben();
    }