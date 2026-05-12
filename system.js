// -----------------------------------------
// KONFIGURACJA SUPABASE
// -----------------------------------------

const SUPABASE_URL = "https://ycuogutnwdybdeobowla.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljdW9ndXRud2R5YmRlb2Jvd2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTE4NDAsImV4cCI6MjA5NDA2Nzg0MH0.ObkFIknc3Ce5KEmj435lI_8hi1T7E-lnxQuRSicZlPw";

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
