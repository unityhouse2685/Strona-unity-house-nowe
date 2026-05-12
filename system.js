// -----------------------------------------
// KONFIGURACJA SUPABASE
// -----------------------------------------

const SUPABASE_URL = "https://ycuogutnwdybdeobowla.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljdW9ndXRud2R5YmRlb2Jvd2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTE4NDAsImV4cCI6MjA5NDA2Nzg0MH0.ObkFIknc3Ce5KEmj435lI_8hi1T7E-lnxQuRSicZlPw";
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// -----------------------------------------
// ŁADOWANIE WSPÓLNOT DO SELECTA
// -----------------------------------------

async function loadCommunitiesForRegister() {
    const { data, error } = await client
        .from("communities")
        .select("id, name");

    if (error) {
        console.error("Błąd ładowania wspólnot:", error);
        return;
    }

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
// LOGOWANIE
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

            const { data, error } = await client
                .from("users")
                .select("*")
                .eq("login", email)
                .eq("password", password)
                .eq("approved", true)
                .single();

            if (error || !data) {
                alert("Nieprawidłowy email, hasło lub konto nie zostało zatwierdzone.");
                return;
            }

            localStorage.setItem("uh_user_id", data.id);
            localStorage.setItem("uh_user_role", data.role);

            if (data.role === "admin") {
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
    localStorage.clear();
    window.location.href = "login.html";
}


// -----------------------------------------
// REJESTRACJA NOWEGO MIESZKAŃCA
// -----------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const login = document.getElementById("emailInput").value.trim();
            const password = document.getElementById("passwordInput").value.trim();
            const wspolnota = document.getElementById("communitySelect").value;

            if (!login || !password || !wspolnota) {
                alert("Uzupełnij wszystkie pola.");
                return;
            }

            const { error } = await client
                .from("users")
                .insert([
                    {
                        login: login,
                        password: password,
                        wspolnota: wspolnota,
                        role: "resident",
                        approved: false
                    }
                ]);

            if (error) {
                console.error("Błąd rejestracji:", error.message, error.details);
                alert("Nie udało się utworzyć konta. Sprawdź konsolę (F12 → Console).");
                return;
            }

            alert("Konto zostało utworzone. Administrator musi je zatwierdzić przed pierwszym logowaniem.");
            window.location.href = "login.html";
        });
    }
});
