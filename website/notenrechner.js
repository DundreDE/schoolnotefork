let faecher = JSON.parse(localStorage.getItem('faecher')) || [];
let selectedFachIndex = null;

// Gewichtung der verschiedenen Arbeitsarten
const gewichtungen = {
    'Klassenarbeit': 3,
    'HÜ': 1,
    'epo': 2
};

const notenWerte = {
    '1+': 0.66, 
    '1': 1.0, 
    '1-': 1.33,
    '2+': 1.66, 
    '2': 2.0, 
    '2-': 2.33,
    '3+': 2.66, 
    '3': 3.0, 
    '3-': 3.33,
    '4+': 3.66, 
    '4': 4.0, 
    '4-': 4.33,
    '5+': 4.66, 
    '5': 5.0, 
    '5-': 5.33,
    '6+': 5.66, 
    '6': 6.0, 
    '6-': 6.33
};

 
// Fach hinzufügen
function addFach() {
    const fachName = document.getElementById('fachName').value.trim();
    if (fachName) {
        const newFach = { name: fachName, noten: [] };
        faecher.push(newFach);
        updateFachDropdownAndContainer();
        saveToLocalStorage();
        document.getElementById('fachName').value = '';
    } else {
        alert('Bitte geben Sie einen gültigen Fachnamen ein.');
    }
}

// Fach löschen
function deleteFach(index) {
    faecher.splice(index, 1);
    if (selectedFachIndex === index) selectedFachIndex = null;
    updateFachDropdownAndContainer();
    saveToLocalStorage();
}

// Note hinzufügen
function addNote() {
    const fachIndex = document.getElementById('fachSelect').value;
    const noteValue = document.getElementById('noteValue').value;
    const art = document.getElementById('artSelect').value;

    if (fachIndex !== '' && noteValue && art) {
        faecher[fachIndex].noten.push({ note: noteValue, art: art });
        updateFachDropdownAndContainer();
        saveToLocalStorage();
    } else {
        alert('Bitte wählen Sie ein Fach und geben Sie eine gültige Note und Art an.');
    }
}

// Note löschen
function deleteNote(fachIndex, noteIndex) {
    faecher[fachIndex].noten.splice(noteIndex, 1);
    updateFachDropdownAndContainer();
    saveToLocalStorage();
}

// Durchschnitt berechnen und die Gewichtung der Arbeitsarten berücksichtigen
function calculateAverage(noten) {
    if (!noten || noten.length === 0) return 'N/A';

    let total = 0;
    let totalGewichtung = 0;

    noten.forEach(note => {
        const noteWert = notenWerte[note.note];
        const gewichtung = gewichtungen[note.art] || 1; // Standard-Gewichtung ist 1, falls nicht definiert
        total += noteWert * gewichtung;
        totalGewichtung += gewichtung;
    });

    const average = total / totalGewichtung;

    // Bestimme die Note basierend auf dem Durchschnitt
    let noteDisplay = 'N/A';

    if (average < 1.0) {
        noteDisplay = '1+';
    } else if (average < 1.34) {
        noteDisplay = '1';
    } else if (average < 1.67) {
        noteDisplay = '1-';
    } else if (average < 2.0) {
        noteDisplay = '2+';
    } else if (average < 2.34) {
        noteDisplay = '2';
    } else if (average < 2.67) {
        noteDisplay = '2-';
    } else if (average < 3.0) {
        noteDisplay = '3+';
    } else if (average < 3.34) {
        noteDisplay = '3';
    } else if (average < 3.67) {
        noteDisplay = '3-';
    } else if (average < 4.0) {
        noteDisplay = '4+';
    } else if (average < 4.34) {
        noteDisplay = '4';
    } else if (average < 4.67) {
        noteDisplay = '4-';
    } else if (average < 5.0) {
        noteDisplay = '5+';
    } else if (average < 5.34) {
        noteDisplay = '5';
    } else if (average < 5.67) {
        noteDisplay = '5-';
    } else if (average < 6.0) {
        noteDisplay = '6+';
    } else if (average < 6.34) {
        noteDisplay = '6';
    } else {
        noteDisplay = '6-';
    }

    return `${noteDisplay} (${average.toFixed(2)})`;
}

// Fächer alphabetisch sortieren
// Fächer alphabetisch sortieren
function sortFaecher(a, b) {
    // Überprüfen, ob beide Fächer einen gültigen Namen haben
    if (a.name && b.name) {
        return a.name.localeCompare(b.name);
    }
    // Wenn einer der Namen nicht gesetzt ist, setze ihn als leeren String
    return (a.name || '').localeCompare(b.name || '');
}


// Fächer-Dropdown und Container aktualisieren
function updateFachDropdownAndContainer() {
    renderFachDropdown();
    renderFaecherContainer();
}

// Dropdown für Fächer rendern
function renderFachDropdown() {
    const fachSelect = document.getElementById('fachSelect');
    fachSelect.innerHTML = '';

    faecher.sort(sortFaecher).forEach((fach, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = fach.name;
        fachSelect.appendChild(option);
    });

    if (selectedFachIndex !== null) {
        fachSelect.value = selectedFachIndex;
    }
}

// Fächer-Container rendern
function renderFaecherContainer() {
    const container = document.getElementById('faecherContainer');
    container.innerHTML = '';

    // Ausgewähltes Fach an den Anfang stellen
    let sortedFaecher = [...faecher];
    if (selectedFachIndex !== null && faecher[selectedFachIndex]) {
        const selectedFach = faecher[selectedFachIndex];
        sortedFaecher = sortedFaecher.filter(fach => fach !== selectedFach);
        sortedFaecher.unshift(selectedFach);
    }

    sortedFaecher.forEach((fach, fachIndex) => {
        const fachCard = document.createElement('div');
        fachCard.className = 'bg-white p-4 mb-4 shadow rounded';

        const header = document.createElement('div');
        header.className = 'flex justify-between items-center mb-4';

        const title = document.createElement('h3');
        title.className = 'text-xl font-semibold text-orange-600';
        title.textContent = fach.name;

        const deleteFachBtn = document.createElement('button');
        deleteFachBtn.className = 'bg-red-500 hover:bg-red-600 text-white p-2 rounded';
        deleteFachBtn.textContent = 'Fach löschen';
        deleteFachBtn.onclick = () => deleteFach(faecher.indexOf(fach));

        header.appendChild(title);
        header.appendChild(deleteFachBtn);
        fachCard.appendChild(header);

        if (fach.noten && fach.noten.length > 0) {
            const notenTable = document.createElement('table');
            notenTable.className = 'w-full mb-4';

            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th class="text-left p-2">Art</th>
                    <th class="text-left p-2">Note</th>
                    <th class="text-left p-2">Aktionen</th>
                </tr>
            `;

            const tbody = document.createElement('tbody');

            fach.noten.forEach((note, noteIndex) => {
                const row = document.createElement('tr');

                const artCell = document.createElement('td');
                artCell.className = 'p-2';
                artCell.textContent = note.art;

                const noteCell = document.createElement('td');
                noteCell.className = 'p-2';
                noteCell.textContent = `${note.note} (${notenWerte[note.note]})`;

                const actionsCell = document.createElement('td');
                actionsCell.className = 'p-2';

                const deleteNoteBtn = document.createElement('button');
                deleteNoteBtn.className = 'bg-red-500 hover:bg-red-600 text-white p-1 rounded';
                deleteNoteBtn.textContent = 'Löschen';
                deleteNoteBtn.onclick = () => deleteNote(faecher.indexOf(fach), noteIndex);

                actionsCell.appendChild(deleteNoteBtn);

                row.appendChild(artCell);
                row.appendChild(noteCell);
                row.appendChild(actionsCell);

                tbody.appendChild(row);
            });

            notenTable.appendChild(thead);
            notenTable.appendChild(tbody);
            fachCard.appendChild(notenTable);
        } else {
            const noNotes = document.createElement('p');
            noNotes.className = 'text-gray-600 mb-4';
            noNotes.textContent = 'Keine Noten vorhanden.';
            fachCard.appendChild(noNotes);
        }

        const average = document.createElement('p');
        average.className = 'text-xl font-semibold';
        average.textContent = `Durchschnitt: ${calculateAverage(fach.noten)}`;

        fachCard.appendChild(average);
        container.appendChild(fachCard);
    });
}

// Daten im localStorage speichern
function saveToLocalStorage() {
    localStorage.setItem('faecher', JSON.stringify(faecher));
}

// Initialisierung
document.addEventListener('DOMContentLoaded', updateFachDropdownAndContainer);
