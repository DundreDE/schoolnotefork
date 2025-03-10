
document.addEventListener('DOMContentLoaded', () => {
    // Prüfe, ob ein Nutzer eingeloggt ist (user_id im localStorage vorhanden)
    if (localStorage.getItem('user_id')) {
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.classList.remove('hidden');
        }
    }

    // Prüfe und füge Eventlistener hinzu, falls die Elemente existieren
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    } else {
        console.warn('logoutButton nicht gefunden.');
    }

    const toggleFormLink = document.getElementById('toggleFormLink');
    if (toggleFormLink) {
        toggleFormLink.addEventListener('click', toggleForm);
    } else {
        console.warn('toggleFormLink nicht gefunden.');
    }

    const authButton = document.getElementById('authButton');
    if (authButton) {
        authButton.addEventListener('click', handleAuth);
    } else {
        console.warn('authButton nicht gefunden.');
    }
});

let isLogin = true;

function toggleForm(e) {
    if (e) e.preventDefault(); // Standardverhalten des Links verhindern

    const formTitle = document.getElementById("formTitle");
    const authButton = document.getElementById("authButton");
    const toggleFormText = document.getElementById("toggleFormText");

    if (isLogin) {
        formTitle.textContent = "Registrierung";
        authButton.textContent = "Registrieren";
        toggleFormText.innerHTML = 'Bereits ein Konto? <a href="#" id="toggleFormLink" class="text-orange-600 hover:underline">Einloggen</a>';
    } else {
        formTitle.textContent = "Login";
        authButton.textContent = "Login";
        toggleFormText.innerHTML = 'Noch kein Konto? <a href="#" id="toggleFormLink" class="text-orange-600 hover:underline">Registrieren</a>';
    }

    isLogin = !isLogin;

    // Da der Link neu erzeugt wurde, muss der Eventlistener neu angehängt werden
    const newToggleFormLink = document.getElementById('toggleFormLink');
    if (newToggleFormLink) {
        newToggleFormLink.addEventListener('click', toggleForm);
    } else {
        console.warn('Neuer toggleFormLink nicht gefunden.');
    }
}

async function handleAuth() {
    const emailEl = document.getElementById('email');
    const passwordEl = document.getElementById('password');
    const messageEl = document.getElementById('message');

    if (!emailEl || !passwordEl || !messageEl) {
        console.error('Ein erforderliches Eingabeelement fehlt.');
        return;
    }

    const email = emailEl.value;
    const password = passwordEl.value;
    const endpoint = isLogin ? 'login' : 'register';

    try {
        const response = await fetch(`https://api.schoolnote.eu/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();
        if (response.ok) {
            // Speichere user_id und person_type in localStorage
            localStorage.setItem('user_id', result.user_id);
            localStorage.setItem('person_type', result.person_type);
            // Logout-Button anzeigen
            const logoutButton = document.getElementById('logoutButton');
            if (logoutButton) {
                logoutButton.classList.remove('hidden');
            }
            window.location.href = `index.html?user_id=${result.user_id}`;
        } else {
            messageEl.textContent = result.message || "Fehler bei der Anfrage";
            messageEl.style.color = 'red';
        }
    } catch (error) {
        messageEl.textContent = "Fehler beim Verbinden mit dem Server.";
        messageEl.style.color = 'red';
    }
}

function logout() {
    localStorage.removeItem('user_id');
    localStorage.removeItem('person_type');
    window.location.href = 'auth.html';
}
