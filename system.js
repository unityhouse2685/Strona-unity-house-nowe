// -----------------------------------------
// KONFIGURACJA SUPABASE
// -----------------------------------------

const SUPABASE_URL = "https://xwijsqbomwvyexrikxam.supabase.co";
const SUPABASE_KEY = "sb_publishable_W8inYRNtzN02XfelqACWng_VAPA7n-D";
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// -----------------------------------------
// CACHE WSPÓLNOT
// -----------------------------------------

let wspolnotyCache = [];

// -----------------------------------------
// ŁADOWANIE WSPÓLNOT DO SELECTA
// -----------------------------------------

async function loadCommunitiesForRegister() {
    const { data, error } = await client
        .from("communities")
        .select("id, name");

    if (error) {
        console.error("Błąd pobierania wspólnot:", error);
        return;
    }

    wspolnotyCache = data;

    const select = document.getElementById("communitySelect");
    if (!select) return;

    data.forEach(c => {
        const option = document.createElement("option");
        option.value = c.id;
        option.textContent = c.name;
        select.appendChild(option);
    });
}

document.addEventListener("DOMContentLoaded", loadCommunitiesForRegister);

// -----------------------------------------
// LOGOWANIE — SUPABASE AUTH (NOWE)
// -----------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    if (!loginForm) return;

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        if (!email || !password) {
            alert("Wpisz email i hasło.");
            return;
        }

        const { data: authData, error: authError } = await client.auth.signInWithPassword({
            email,
            password
        });

        if (authError) {
            alert("Niepoprawny email lub hasło.");
            console.error(authError);
            return;
        }

        const userId = authData.user.id;

        const { data: profile, error: profileError } = await client
            .from("users")
            .select("*")
            .eq("id", userId)
            .single();

        if (profileError || !profile) {
            alert("Brak profilu użytkownika.");
            return;
        }

        localStorage.setItem("uh_user_id", profile.id);
        localStorage.setItem("uh_user_role", "resident");

        window.location.href = "resident.html";
    });
});

// -----------------------------------------
// WYMAGANIE ROLI
// -----------------------------------------

function requireRole(role) {
    const userRole = localStorage.getItem("uh_user_role");
    const userId = localStorage.getItem("uh_user_id");

    if (!userId || userRole !== role) {
        window.location.href = "login.html";
    }
}

// -----------------------------------------
// WYLOGOWANIE
// -----------------------------------------

function logout() {
    client.auth.signOut();
    localStorage.clear();
    window.location.href = "login.html";
}

// -----------------------------------------
// REJESTRACJA — SUPABASE AUTH (NOWA WERSJA)
// -----------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");

    if (!registerForm) return;

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const button = registerForm.querySelector("button");
        button.disabled = true;
        button.textContent = "Tworzenie konta…";

        const email = document.getElementById("emailInput").value.trim();
        const password = document.getElementById("passwordInput").value.trim();
        const wspolnota = document.getElementById("communitySelect").value;

        if (!email || !password || !wspolnota) {
            alert("Uzupełnij wszystkie pola.");
            button.disabled = false;
            button.textContent = "Utwórz konto";
            return;
        }

        try {
            // 1. Tworzymy konto w Auth
            const { data: authData, error: authError } = await client.auth.signUp({
                email,
                password
            });

            if (authError) {
                console.error("Błąd Auth:", authError);
                alert("Nie udało się utworzyć konta.");
                button.disabled = false;
                button.textContent = "Utwórz konto";
                return;
            }

            const authId = authData.user.id;

            // 2. Dopisujemy profil do tabeli users
            const { error: insertError } = await client
                .from("users")
                .insert({
                    id: authId,
                    email: email,
                    community_id: wspolnota
                });

            if (insertError) {
                console.error("Błąd dopisywania profilu:", insertError);
                alert("Konto utworzone, ale nie udało się zapisać profilu.");
                button.disabled = false;
                button.textContent = "Utwórz konto";
                return;
            }

            alert("Konto zostało utworzone!");
            window.location.href = "login.html";

        } catch (err) {
            console.error("Nieoczekiwany błąd:", err);
            alert("Wystąpił błąd. Spróbuj ponownie za chwilę.");
            button.disabled = false;
            button.textContent = "Utwórz konto";
        }
    });
});
