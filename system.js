console.log("SYSTEM.JS DZIAŁA");

// ------------------------------------------------------
// KONFIGURACJA SUPABASE
// ------------------------------------------------------
const SUPABASE_URL = "https://xwijsqbomwvye xrikxam.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3aWpzcWJvbXd2eWV4cmlreGFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTYzNDMsImV4cCI6MjA5NDIzMjM0M30.k4MhZ6vuW7z_SkPQITGGt938PW8eP9eBmTjmTIv0kWA";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ------------------------------------------------------
// REJESTRACJA
// ------------------------------------------------------
async function registerUser(name, address, email, password, communityId) {
    const { data, error } = await client.auth.signUp({
        email,
        password
    });

    if (error) {
        console.error("Błąd rejestracji:", error);
        return { error };
    }

    const userId = data.user.id;

    const { error: insertError } = await client
        .from("users")
        .insert({
            id: userId,
            login: email,
            name,
            address,
            community_id: communityId,
            approved: false
        });

    if (insertError) {
        console.error("Błąd INSERT users:", insertError);
        return { error: insertError };
    }

    return { success: true };
}

// ------------------------------------------------------
// LOGOWANIE
// ------------------------------------------------------
async function loginUser(email, password) {
    const { data, error } = await client.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error("Błąd logowania:", error);
        return { error };
    }

    const userId = data.user.id;
    localStorage.setItem("uh_user_id", userId);

    const { data: userData } = await client
        .from("users")
        .select("approved")
        .eq("id", userId)
        .single();

    if (!userData.approved) {
        return { notApproved: true };
    }

    return { success: true };
}

// ------------------------------------------------------
// WYLOGOWANIE
// ------------------------------------------------------
async function logout() {
    await client.auth.signOut();
    localStorage.removeItem("uh_user_id");
    window.location.href = "login.html";
}

// ------------------------------------------------------
// ŁADOWANIE WSPÓLNOT DO SELECTA
// ------------------------------------------------------
async function loadCommunitiesToSelect(selectId) {
    const { data, error } = await client
        .from("communities")
        .select("*")
        .order("name", { ascending: true });

    if (error) {
        console.error("Błąd ładowania wspólnot:", error);
        return;
    }

    const select = document.getElementById(selectId);
    select.innerHTML = `<option value="">Wybierz…</option>`;

    data.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.name;
        select.appendChild(opt);
    });
}

// ------------------------------------------------------
// OBSŁUGA FORMULARZA REJESTRACJI
// ------------------------------------------------------
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("nameInput").value.trim();
        const address = document.getElementById("addressInput").value.trim();
        const email = document.getElementById("emailInput").value.trim();
        const password = document.getElementById("passwordInput").value.trim();
        const communityId = document.getElementById("communitySelect").value;

        const result = await registerUser(name, address, email, password, communityId);

        if (result.error) {
            alert("Nie udało się utworzyć konta.");
            return;
        }

        alert("Konto utworzone! Poczekaj na akceptację administratora.");
        window.location.href = "login.html";
    });

    loadCommunitiesToSelect("communitySelect");
}

// ------------------------------------------------------
// OBSŁUGA FORMULARZA LOGOWANIA
// ------------------------------------------------------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        const result = await loginUser(email, password);

        if (result.error) {
            alert("Błędny login lub hasło.");
            return;
        }

        if (result.notApproved) {
            alert("Twoje konto czeka na akceptację administratora.");
            return;
        }

        window.location.href = "resident.html";
    });
}
