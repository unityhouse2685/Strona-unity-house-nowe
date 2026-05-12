// js/system.js
// -----------------------------------------
// KONFIGURACJA SUPABASE
// Wklej tu swoje dane z panelu Supabase:
// -----------------------------------------

const SUPABASE_URL = "https://ycuogutnwdybdeobowla.supabase.co";   // ← PODMIENIASZ
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljdW9ndXRud2R5YmRlb2Jvd2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTE4NDAsImV4cCI6MjA5NDA2Nzg0MH0.ObkFIknc3Ce5KEmj435lI_8hi1T7E-lnxQuRSicZlPw";                    // ← PODMIENIASZ

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// -----------------------------------------
// FUNKCJE WSPÓLNE DLA CAŁEGO SYSTEMU
// -----------------------------------------

// Wymaganie roli użytkownika (admin / resident)
function requireRole(role) {
    const userRole = localStorage.getItem("uh_user_role");
    const userId = localStorage.getItem("uh_user_id");

    if (!userId || userRole !== role) {
        window.location.href = "login.html";
    }
}

// Wylogowanie
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}
