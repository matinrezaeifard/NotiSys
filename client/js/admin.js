/**
 * Global Values
 */
let allGroups;
const lang = document.documentElement.lang || 'fa';

/**
 * Time & Date Section
 */
function updateTime() {
    const now = new Date();
    const weekdays = [
        translate[lang].sunday,
        translate[lang].monday,
        translate[lang].tuesday,
        translate[lang].wednsday,
        translate[lang].thursday,
        translate[lang].friday,
        translate[lang].saturday
    ];
    const day = weekdays[now.getDay()];
    const numType = lang === 'fa' ? "fa-IR" : "en-US";
    const dateStr = now.toLocaleDateString(numType);
    const timeStr = now.toLocaleTimeString(numType);
    document.getElementById("datetime").textContent = `${day}، ${dateStr} - ${timeStr}`;
}

/**
 * Group Section
 */
async function _initGroups() {
    const { groups } = await loadGroups();
    allGroups = groups;
    const select = document.querySelector("#user-group");
    select.innerHTML = allGroups.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
}

/**
 * Users Section
 */
function deleteUser(username) {
    showYesOrNoAlert(translate[lang].confirmDeleteUser).then(async (yes) => {
        if (!yes) return;

        // Send request to the sever
        try {
            const res = await fetch(`/api/users/del/${encodeURIComponent(username)}`, {
                method: 'DELETE'
            });

            // Check the response
            if (res.ok) {
                // Final result
                showInfoAlert(translate[lang].userDeleted)
                await _initUsers();
            } else if (res.status === 404) {
                showInfoAlert(translate[lang].userNotFound);
            } else {
                throw new Error(translate[lang].serverResponseError);
            }

        } catch (err) {
            // Log error
            console.error("خطا در اتصال به سرور: ", err);
            showInfoAlert(translate[lang].connectionFailed);
        }
    });
}

function updateUserPassword(username) {
    showYesOrNoAlert(translate[lang].confirmChangePassword).then(async (yes) => {
        if (!yes) return;

        // Get input values
        const input = document.getElementById(`pass-${username}`);
        const newPassword = input.value.trim();

        // Send request to the server
        try {
            const res = await fetch(`/api/users/update/${encodeURIComponent(username)}/password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ password: newPassword })
            });

            // Check the response
            if (res.ok) {
                showInfoAlert(translate[lang].passwordChanged);
            } else if (res.status === 404) {
                showInfoAlert(translate[lang].userNotFound);
            } else {
                throw new Error(translate[lang].serverResponseError);
            }

        } catch (err) {
            // Log error
            console.error("خطا در اتصال به سرور: ", err);
            showInfoAlert(translate[lang].connectionFailed);
        }
    });
}

document.getElementById("add-user-form").addEventListener("submit", async e => {
    e.preventDefault();

    // Get input values
    const username = e.target.querySelector("#expert-username").value.trim();
    const password = e.target.querySelector("#expert-password").value.trim();
    const group = e.target.querySelector("#user-group").value;

    // Send request to the server
    try {
        const res = await fetch(`/api/users/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, group })
        });

        // Check the response
        if (res.ok) {
            showInfoAlert(translate[lang].addUserSuccess);
            await _initUsers();
        } else if (res.status === 409) {
            showInfoAlert(translate[lang].userExists);
        } else {
            throw new Error(translate[lang].serverResponseError);
        }

        // Reset form
        e.target.reset();

    } catch (err) {
        // Log error
        console.error("خطا در اتصال به سرور: ", err);
        showInfoAlert(translate[lang].connectionFailed);
    }
});

async function loadUsers() {
    // Send request to server
    try {
        const res = await fetch(`/api/users`, {
            method: "GET"
        });

        // Check the response
        if (!res.ok) throw new Error(translate[lang].serverResponseError);

        // Final result
        return res.json();

    } catch (err) {
        // Log error
        console.error("خطا در اتصال به سرور: ", err);
        showInfoAlert(translate[lang].connectionFailed);
    }
}

async function _initUsers() {
    // Load users
    const { users } = await loadUsers();

    // Reset the table
    const usersTableBody = document.querySelector("#users-table tbody");
    usersTableBody.innerHTML = "";

    // Render the users table
    users.forEach(user => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${user.username}</td>
            <td>${allGroups.find(g => g.id === user.group_id)?.name || translate[lang].noGroup}</td>
            <td>
                <input id="pass-${user.username}" type="password" placeholder="${translate[lang].passwordPlaceholder}" value=${user.password}>
                <button onclick="updateUserPassword('${user.username}')">${translate[lang].change}</button>
            </td>
            <td><button onclick="deleteUser('${user.username}')">${translate[lang].delete}</button></td>
        `;
        usersTableBody.appendChild(tr);
    });
}

/**
 * Term Section
 */
const endBtn = document.getElementById("end-term");

function deleteTerm(term, id) {
    showYesOrNoAlert(translate[lang].confirmDeleteTerm).then(async (yes) => {
        if (!yes) return;

        // Send request to server
        try {
            const res = await fetch(`/api/terms/delete`, {
                method: "DELETE",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            // Check response
            if (res.ok) {
                showInfoAlert(translate[lang].termDeleted);
                await _initTerms();
            } else if (res.status === 400) {
                showInfoAlert(translate[lang].cannotDeleteActiveTerm);
            } else if (res.status === 404) {
                showInfoAlert(translate[lang].termNotFound);
            } else {
                throw new Error(translate[lang].serverResponseError);
            }

        } catch (err) {
            // Log error
            console.error("خطا در اتصال به سرور: ", err);
            showInfoAlert(translate[lang].connectionFailed);
        }
    });
}

endBtn.addEventListener("click", () => {
    showYesOrNoAlert(translate[lang].confirmEndTerm).then(async (yes) => {
        if (!yes) return;

        // Send request to server
        try {
            const res = await fetch(`/api/terms/end`, {
                method: "GET"
            });

            // Check response
            if (!res.ok) throw new Error(translate[lang].serverResponseError);

            // Final result
            await _initTerms();

        } catch (err) {
            // Log error
            console.error("خطا در اتصال به سرور: ", err);
            showInfoAlert(translate[lang].connectionFailed);
        }
    });
});

function activateTerm(name, id) {
    showYesOrNoAlert(translate[lang].confirmActivateTerm).then(async (yes) => {
        if (!yes) return;

        // Send request to server
        try {
            const res = await fetch(`/api/terms/activate`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            // Check response
            if (res.ok) {
                showInfoAlert(translate[lang].termActivated);
                await _initTerms();
            } else {
                throw new Error(translate[lang].serverResponseError);
            }

        } catch (err) {
            // Log error
            console.error("خطا در اتصال به سرور: ", err);
            showInfoAlert(translate[lang].connectionFailed);
        }
    });
}

document.getElementById("new-term").addEventListener("click", () => {
    // Show input alert
    showInputAlert(translate[lang].inputNewTerm).then(async (name) => {
        if (!name) return;

        // Send request to server
        try {
            const res = await fetch(`/api/terms/new`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });

            // Check the response
            if (res.status === 201) {
                showInfoAlert(translate[lang].termCreated);
                await _initTerms();
            } else {
                throw new Error(translate[lang].serverResponseError);
            }

        } catch (err) {
            // Log error
            console.error("خطا در اتصال به سرور: ", err);
            showInfoAlert(translate[lang].connectionFailed);
        }
    });
});

async function loadTerms() {
    // Send request to server
    try {
        const res = await fetch(`/api/terms`);

        // Check the response
        if (!res.ok) throw new Error(translate[lang].serverResponseError);

        // Final result
        return res.json();

    } catch (err) {
        // Log error
        console.error("خطا در اتصال به سرور: ", err);
        showInfoAlert(translate[lang].connectionFailed);
    }
}

async function _initTerms() {
    // Load users
    const { terms } = await loadTerms();

    // Set the term html elements
    const termActiveText = document.querySelector("#current-term p");
    termActiveText.textContent = terms.find(t => t.is_active === 1)?.name || translate[lang].noActiveTerm;
    endBtn.disabled = termActiveText.textContent === translate[lang].noActiveTerm;

    // Reset the list
    const archivedList = document.getElementById("term-list");
    archivedList.innerHTML = "";

    // Render the terms list
    terms.forEach(term => {
        const row = document.createElement("div");
        row.className = "term-row";
        row.innerHTML = `
            <p>${term.name}</p>
            <button ${term.is_active === 1 ? "disabled" : ""}>${translate[lang].activate}</button>
            <button onclick="deleteTerm('${term.name}', '${term.id}')">${translate[lang].delete}</button>
        `;
        row.querySelector("button").addEventListener("click", () => activateTerm(term.name, term.id));
        archivedList.appendChild(row);
    });
}

/**
 * Starting Thread
 */
(async () => {
    await _initGroups();
    await _initUsers();
    await _initTerms();
    updateTime();
    setInterval(updateTime, 1000);
})();