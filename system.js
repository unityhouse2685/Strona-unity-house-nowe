// -----------------------------------------
// KONFIGURACJA SUPABASE
// -----------------------------------------

const SUPABASE_URL = "https://ycuogutnwdybdeobowla.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljdW9ndXRud2R5YmRlb2Jvd2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTE4NDAsImV4cCI6MjA5NDA2Nzg0MH0.ObkFIknc3Ce5KEmj435lI_8hi1T7E-lnxQuRSicZlPw";
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
// LOGOWANIE — SUPABASE AUTH
// -----------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
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

            const authId = authData.user.id;

            const { data: userData, error: userError } = await client
                .from("users")
                .select("*")
                .eq("auth_id", authId)
                .eq("approved", true)
                .single();

            if (userError || !userData) {
                alert("Konto nie zostało zatwierdzone przez administratora.");
                return;
            }

            localStorage.setItem("uh_user_id", userData.id);
            localStorage.setItem("uh_user_role", userData.role);

            if (userData.role === "admin") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "resident.html";
            }
        });
    }
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
// REJESTRACJA — SUPABASE AUTH
// -----------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("emailInput").value.trim();
            const password = document.getElementById("passwordInput").value.trim();
            const wspolnota = document.getElementById("communitySelect").value;

            if (!email || !password || !wspolnota) {
                alert("Uzupełnij wszystkie pola.");
                return;
            }

            const { data: authData, error: authError } = await client.auth.signUp({
                email,
                password
            });

            if (authError) {
                console.error("Błąd Auth:", authError);
                alert("Nie udało się utworzyć konta.");
                return;
            }

            const authId = authData.user.id;

            const { error: insertError } = await client
                .from("users")
                .insert([
                    {
                        auth_id: authId,
                        login: email,
                        password: password,
                        community_id: wspolnota,
                        role: "resident",
                        approved: false
                    }
                ]);

            if (insertError) {
                console.error("Błąd rejestracji:", insertError);
                alert("Nie udało się utworzyć konta.");
                return;
            }

            alert("Konto zostało utworzone. Administrator musi je zatwierdzić.");
            window.location.href = "login.html";
        });
    }
});
