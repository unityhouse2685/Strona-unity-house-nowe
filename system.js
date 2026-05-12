// -----------------------------------------
// KONFIGURACJA SUPABASE
// -----------------------------------------

const SUPABASE_URL = "https://ycuogutnwdybdeobowla.supabase.co";
const SUPABASE_KEY = "twój_publiczny_anon_key"; // znajdziesz w Supabase → Project Settings → API → anon public
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);



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

            // Pobieramy użytkownika z tabeli "users"
            const { data, error } = await client
    .from("users")
    .select("*")
    .eq("login", email)
    .eq("password", password)
    .single();


            if (error || !data) {
                alert("Nieprawidłowy email lub hasło.");
                return;
            }

            // Zapisujemy dane użytkownika
            localStorage.setItem("uh_user_id", data.id);
            localStorage.setItem("uh_user_role", data.role);

            // Przekierowanie wg roli
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
