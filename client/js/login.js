/**
 * Global Values
 */
const lang = document.documentElement.lang || 'fa';

/**
 * Screen Size
 */
const warning = document.getElementById("screen-warning");
const container = document.getElementById("main-container");

function checkScreen() {
    if (window.innerWidth < 1000) {
        warning.style.display = "flex";
    } else {
        warning.style.display = "none";
    }
}

checkScreen();
window.addEventListener("resize", checkScreen);

/**
 * Login Section
 */
const loginError = document.getElementById("login-error");

function injectHTMLAssets(html) {
    const temp = document.createElement("div");
    temp.innerHTML = html;

    // Load scripts
    temp.querySelectorAll("script[src]").forEach(({ src }) => {
        const s = Object.assign(document.createElement("script"), {
            src, async: false
        });
        document.head.appendChild(s);
    });

    // Load styles
    temp.querySelectorAll("link[rel=stylesheet]").forEach(link => {
        document.head.appendChild(link.cloneNode(true));
    });
}

document.getElementById("login-section").addEventListener("submit", async e => {
    e.preventDefault();

    // Get input values
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;

    // Send request to the server
    try {
        const res = await fetch(`/api/login`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role, lang })
        });

        // Check response
        if (res.ok) {
            e.target.classList.add("hidden");
            const html = await res.text();
            document.body.innerHTML += html;
            injectHTMLAssets(html);
        } else if (res.status === 401) {
            loginError.textContent = translate[lang].wrongCredentials;
        } else {
            throw new Error(translate[lang].serverResponseError);
        }
    } catch (err) {
        // Log error
        console.error("خطا در اتصال به سرور: ", err);
        loginError.textContent = translate[lang].connectionError;
    }
});