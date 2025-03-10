
let groups = JSON.parse(localStorage.getItem('groups')) || {};

const groupsContainer = document.getElementById("groups-container");
const createGroupButton = document.getElementById("create-group");
const groupModal = document.getElementById("group-modal");
const groupNameInput = document.getElementById("group-name");
const saveGroupButton = document.getElementById("save-group");
const closeModalButton = document.getElementById("close-modal");
const learnContainer = document.getElementById("learn-container");
const backButton = document.getElementById("back-button");


const updateGroupsView = () => {
  groupsContainer.innerHTML = ""; 

  Object.keys(groups).forEach((groupName) => {
    const groupDiv = document.createElement("div");
    groupDiv.className = "p-4 bg-white rounded-md shadow-md mb-4 flex justify-between items-center";

  
    const groupTitle = document.createElement("h2");
    groupTitle.textContent = groupName;
    groupTitle.className = "font-bold text-lg";
    groupDiv.appendChild(groupTitle);

    
    const buttonContainer = document.createElement("div");

    const editButton = document.createElement("button");
    editButton.textContent = "Bearbeiten";
    editButton.className = "bg-orange-500 text-white px-4 py-2 rounded-md mr-2";
    editButton.addEventListener("click", () => startEditing(groupName));
    buttonContainer.appendChild(editButton);

    const learnButton = document.createElement("button");
    learnButton.textContent = "Lernen";
    learnButton.className = "bg-orange-500 text-white px-4 py-2 rounded-md";
    learnButton.addEventListener("click", () => startLearning(groupName));
    buttonContainer.appendChild(learnButton);

    groupDiv.appendChild(buttonContainer);
    groupsContainer.appendChild(groupDiv);
  });
};


const saveGroupsToLocalStorage = () => {
  localStorage.setItem('groups', JSON.stringify(groups));
};


const closeModal = () => {
  groupModal.classList.add("hidden");
  groupNameInput.value = "";
};


saveGroupButton.addEventListener("click", () => {
  const groupName = groupNameInput.value.trim();
  if (!groupName) {
    alert("Bitte gib einen Namen für die Gruppe ein!");
    return;
  }

  if (groups[groupName]) {
    alert("Diese Gruppe existiert bereits!");
    return;
  }

  groups[groupName] = []; 
  saveGroupsToLocalStorage();
  closeModal();
  updateGroupsView();
});


createGroupButton.addEventListener("click", () => {
  groupModal.classList.remove("hidden");
});

closeModalButton.addEventListener("click", closeModal);


const startEditing = (groupName) => {
  const groupCards = groups[groupName];

  if (!groupCards) {
    alert("Fehler: Diese Gruppe existiert nicht.");
    return;
  }

 
  learnContainer.classList.remove("hidden");
  groupsContainer.classList.add("hidden");
  createGroupButton.classList.add("hidden");
  backButton.classList.remove("hidden");

  learnContainer.innerHTML = `
    <h2 class="text-xl font-bold mb-4">Bearbeiten: ${groupName}</h2>
    <ul id="card-list" class="mb-4">
      ${groupCards
        .map(
          (card, index) =>
            `<li class="p-2 border rounded-md mb-2 flex justify-between">
              <span>Vorderseite: ${card.front}</span>
              <span>Rückseite: ${card.back}</span>
              <button class="bg-red-500 text-white px-2 py-1 rounded-md" onclick="deleteCard('${groupName}', ${index})">Löschen</button>
            </li>`
        )
        .join("")}
    </ul>
    <input id="new-card-front" type="text" placeholder="Vorderseite der Karte" class="border p-2 rounded-md w-full mb-2" />
    <input id="new-card-back" type="text" placeholder="Rückseite der Karte" class="border p-2 rounded-md w-full mb-2" />
    <button id="add-card" class="bg-green-500 text-white px-4 py-2 rounded-md">Karte hinzufügen</button>
  `;


  document.getElementById("add-card").addEventListener("click", () => {
    const newCardFront = document.getElementById("new-card-front").value.trim();
    const newCardBack = document.getElementById("new-card-back").value.trim();
    if (!newCardFront || !newCardBack) {
      alert("Bitte gib einen Text für die Vorder- und Rückseite der Karte ein!");
      return;
    }
    groupCards.push({ front: newCardFront, back: newCardBack });
    saveGroupsToLocalStorage();
    document.getElementById("new-card-front").value = "";
    document.getElementById("new-card-back").value = "";
    startEditing(groupName); 
  });
};

// Karte löschen
const deleteCard = (groupName, cardIndex) => {
  groups[groupName].splice(cardIndex, 1); 
  saveGroupsToLocalStorage();
  startEditing(groupName); 
};


const startLearning = (groupName) => {
  const groupCards = groups[groupName];

  if (!groupCards || groupCards.length === 0) {
    alert("Keine Karten in dieser Gruppe zum Lernen!");
    return;
  }

  let currentIndex = 0;
  let showFront = true;
  const notKnownCards = [];
  let correctCount = 0;

  learnContainer.classList.remove("hidden");
  groupsContainer.classList.add("hidden");
  createGroupButton.classList.add("hidden");
  backButton.classList.remove("hidden");


  learnContainer.innerHTML = `
    <div id="card-container" class="bg-white p-6 rounded-md shadow-lg w-96 mx-auto">
      <div id="card-content" class="text-xl font-bold mb-4"></div>
      <button id="flip-card" class="bg-orange-500 text-white px-4 py-2 rounded-md mb-4">Karte umdrehen</button>
      <div class="flex justify-between">
        <button id="not-known" class="bg-orange-500 text-white px-4 py-2 rounded-md">Nicht gekonnt</button>
        <button id="known" class="bg-orange-500 text-white px-4 py-2 rounded-md">Gekonnt</button>
      </div>
    </div>
  `;

  const showCard = () => {
    const card = groupCards[currentIndex];
    const cardContent = showFront ? card.front : card.back;
    document.getElementById("card-content").innerText = cardContent;
  };

  document.getElementById("flip-card").addEventListener("click", () => {
    showFront = !showFront;
    showCard();
  });

  document.getElementById("known").addEventListener("click", () => {
    correctCount++;
    currentIndex++;
    if (currentIndex >= groupCards.length) {
      if (notKnownCards.length > 0) {
        groupCards.push(...notKnownCards);
        notKnownCards.length = 0;
        currentIndex = 0;
      } else {
        const percentage = ((correctCount / groupCards.length) * 100).toFixed(2);
        learnContainer.innerHTML = `
          <div class="text-center">
            <h2 class="text-xl font-bold mb-4">Du hast ${percentage}% der Karten richtig gelernt!</h2>
            <button id="back-to-groups" class="bg-orange-500 text-white px-4 py-2 rounded-md">Zurück zur Startseite</button>
          </div>
        `;
        document.getElementById("back-to-groups").addEventListener("click", () => {
          learnContainer.classList.add("hidden");
          groupsContainer.classList.remove("hidden");
          createGroupButton.classList.remove("hidden");
          backButton.classList.add("hidden");
        });
        return;
      }
    }
    showFront = true;
    showCard();
  });

  document.getElementById("not-known").addEventListener("click", () => {
    notKnownCards.push(groupCards[currentIndex]);
    currentIndex++;
    if (currentIndex >= groupCards.length) {
      if (notKnownCards.length > 0) {
        groupCards.push(...notKnownCards);
        notKnownCards.length = 0;
        currentIndex = 0;
      } else {
        const percentage = ((correctCount / groupCards.length) * 100).toFixed(2);
        learnContainer.innerHTML = `
          <div class="text-center">
            <h2 class="text-xl font-bold mb-4">Du hast ${percentage}% der Karten richtig gelernt!</h2>
            <button id="back-to-groups" class="bg-orange-500 text-white px-4 py-2 rounded-md">Zurück zur Startseite</button>
          </div>
        `;
        document.getElementById("back-to-groups").addEventListener("click", () => {
          learnContainer.classList.add("hidden");
          groupsContainer.classList.remove("hidden");
          createGroupButton.classList.remove("hidden");
          backButton.classList.add("hidden");
        });
        return;
      }
    }
    showFront = true;
    showCard();
  });

  showCard();
};

backButton.addEventListener("click", () => {
  learnContainer.classList.add("hidden");
  groupsContainer.classList.remove("hidden");
  createGroupButton.classList.remove("hidden");
  backButton.classList.add("hidden");
});


updateGroupsView();