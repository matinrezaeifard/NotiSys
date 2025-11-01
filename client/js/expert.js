/**
 * Global Values
 */ 
let allGroups, currentTerm, currentUser = null;
const lang = document.documentElement.lang || 'fa';

const InitMode = {
    FULL_INIT: "FULL_INIT",
    HALF_INIT: "HALF_INIT"
};

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
 * Tab Management
 */
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        tabContents.forEach(c => c.classList.add("hidden"));
        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.remove("hidden");
    });
});

/**
 * Announcement Section
 */
const annDialog = document.getElementById("announcement-dialog");

document.getElementById("add-announcement").addEventListener("click", () => {
    annDialog.classList.remove("hidden");
    const form = annDialog.querySelector("form");
    form.noValidate = false;
});

function closeAnnouncementDialog() {
    annDialog.classList.add("hidden");
    const form = annDialog.querySelector("form");
    form.noValidate = true;
    form.reset();
}

async function deleteAnnouncement(id) {
    showYesOrNoAlert(translate[lang].confirmDeleteAnnouncement).then(async (yes) => {
        if (!yes) return;

        // Send request to server
        try {
            const res = await fetch(`/api/announcements/delete`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });

            // Check the response
            if (res.ok) {
                // Final result
                showInfoAlert(translate[lang].announcementDeleted);
                await _init(InitMode.HALF_INIT);
            } else if (res.status === 404) {
                showInfoAlert(translate[lang].announcementNotFound);
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

document.getElementById("announcement-form").addEventListener("submit", async e => {
    e.preventDefault();

    // Compute a random unique ID
    const id = crypto.randomUUID();

    // Get message value
    const message = document.getElementById("announcement-message").value.trim();

    // Initialize payload json
    const payload = {
        term_id: currentTerm.id,
        group_id: currentUser.group,
        message,
        id
    };

    // Send request to server
    try {
        const res = await fetch(`/api/announcements/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        // Check the response
        if (!res.ok) throw new Error(translate[lang].serverResponseError);

        // Final result
        showInfoAlert(translate[lang].announcementAdded);
        closeAnnouncementDialog();
        await _init(InitMode.HALF_INIT);

    } catch (err) {
        // Log error
        console.error("خطا در اتصال به سرور: ", err);
        showInfoAlert(translate[lang].connectionFailed);
    }
});

/**
 * Programs Section
 */
const programDialog = document.getElementById("program-dialog");
const importDialog = document.getElementById("import-dialog");
const programType = document.getElementById("program-type");

document.getElementById("add-program-btn").addEventListener("click", () => {
    programDialog.classList.remove("hidden");
    const form = programDialog.querySelector("form");
    form.noValidate = false;
});

document.getElementById("import-program-btn").addEventListener("click", () => {
    importDialog.classList.remove("hidden");
});

function closeProgramDialog() {
    programDialog.classList.add("hidden");
    const form = programDialog.querySelector("form");
    form.noValidate = true;
    form.reset();
    programType.dispatchEvent(new Event("change"));
}

function closeImportDialog() {
    importDialog.classList.add("hidden");
    const form = importDialog.querySelector("form");
    form.reset();
}

document.getElementById("importForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById("excelFile");
    if (!fileInput.files.length) {
        showInfoAlert(translate[lang].fileSelectAlert);
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append('term_id', currentTerm.id);
    formData.append('group_id', currentUser.group);

    try {
        const res = await fetch("/api/import", {
            method: "POST",
            body: formData,
        });

        // Check the response
        if (!res.ok) throw new Error(translate[lang].serverResponseError);

        // Final result
        showInfoAlert(translate[lang].fileImported);
        await _init(InitMode.HALF_INIT);
        closeImportDialog();

    } catch (err) {
        // Log error
        console.error("خطا در اتصال به سرور: ", err);
        showInfoAlert(translate[lang].connectionFailed);
    }
});

function updateInputType() {
    // Get elements
    const dayInput = document.getElementById("program-day");
    const startInput = document.getElementById("program-start");
    const endInput = document.getElementById("program-end");
    const type = programType.value;

    // Get current date and compute a minimum value for date
    const now = new Date();
    const minValue = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString().slice(0, 16); // to local ISO string for min attribute

    // Check type
    if (type === "weekly") {
        // Endable and show day input
        dayInput.value = "";
        dayInput.disabled = false;
        dayInput.classList.remove('hidden');

        // Change time input types
        startInput.type = "time";
        startInput.placeholder = translate[lang].startTime;
        endInput.placeholder = translate[lang].endTime;

        // Remove minimum attribute
        startInput.removeAttribute("min");
    } else if (type === "one-time") {
        // Disable and hide day input
        dayInput.value = "";
        dayInput.disabled = true;
        dayInput.classList.add('hidden');

        // Change time input types
        startInput.type = "datetime-local";
        startInput.placeholder = translate[lang].startDate;
        endInput.placeholder = translate[lang].endTime;

        // Set minimum attribute
        startInput.min = minValue;
    }

    // Remove previous value
    startInput.value = "";
    endInput.value = "";
}

function validateTimeRange() {
    // Get values
    const start = document.getElementById("program-start").value;
    const end = document.getElementById("program-end").value;
    const type = programType.value;

    // Assume a date for "time only" mode
    let startTime, endTime;
    if (type === "one-time") {
        startTime = start;
        endTime = `${start.split("T")[0]}T${end}`;
    } else {
        startTime = `2000-01-01T${start}`;
        endTime = `2000-01-01T${end}`;
    }

    // Final validation check
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    if (startDate >= endDate) {
        showInfoAlert(translate[lang].endAfterStart);
        return false;
    }

    return true;
}

async function deleteProgram(id) {
    showYesOrNoAlert(translate[lang].confirmDeleteProgram).then(async (yes) => {
        if (!yes) return;

        // Send request to server
        try {
            const res = await fetch(`/api/programs/delete`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });

            // Check the response
            if (res.ok) {
                // Final result
                showInfoAlert(translate[lang].programDeleted);
                await _init(InitMode.HALF_INIT);
            } else if (res.status === 404) {
                showInfoAlert(translate[lang].programNotFound);
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

document.getElementById("program-form").addEventListener("submit", async e => {
    e.preventDefault();

    // Check time range validation
    if (!validateTimeRange()) return;

    // Compute a random unique ID
    const id = crypto.randomUUID();

    // Get Program values
    const title = document.getElementById("program-title").value;
    const group_number = document.getElementById("program-group").value;
    const host = document.getElementById("program-host").value;
    const type = programType.value;
    const day = document.getElementById("program-day").value;
    const start = document.getElementById("program-start").value;
    const end = document.getElementById("program-end").value;
    const place = document.getElementById("program-place").value;

    // Initialize payload json
    const payload = {
        term_id: currentTerm.id,
        group_id: currentUser.group,
        id,
        title,
        group_number,
        host,
        type,
        day,
        start,
        end,
        place,
    };

    // Send request to server
    try {
        const res = await fetch(`/api/programs/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        // Check the response
        if (!res.ok) throw new Error(translate[lang].serverResponseError);

        // Final result
        showInfoAlert(translate[lang].programAdded);
        closeProgramDialog();
        await _init(InitMode.HALF_INIT);

    } catch (err) {
        // Log error
        console.error("خطا در اتصال به سرور: ", err);
        showInfoAlert(translate[lang].connectionFailed);
    }
});

/**
 * Load Secion
 */
function renderScheduleTables(data) {
    // Render program tables
    data.events.forEach(e => {
        const tableBody = document.querySelector(`#${e.type}-list tbody`);
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${e.title}</td>
            <td>${e.group_number}</td>
            <td>${e.host}</td>
            ${e.day ? `<td>${e.day}</td>` : ""}
            <td>${e.start}</td>
            <td>${e.end}</td>
            <td>${e.place}</td>
            <td><button onclick="deleteProgram('${e.id}')">حذف</button></td>
        `;
        tableBody.appendChild(tr);
    });

    // Render announcements table
    const annList = document.querySelector("#announcement-list tbody");
    data.announcements.forEach(a => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
                <td>${a.message}</td>
                <td><button onclick="deleteAnnouncement('${a.id}')">${translate[lang].delete}</button></td>
            `;
        annList.appendChild(tr);
    });
}

async function _init(mode) {
    // Check init mode
    if (mode === InitMode.FULL_INIT) {
        // Get current user
        currentUser = {
            username: document.getElementById("expert-username").textContent,
            group: document.getElementById("expert-group").textContent
        }

        const expertName = document.getElementById("expert-group");
        expertName.textContent = allGroups.find(g => g.id == currentUser.group)?.name || translate[lang].noGroup;

        // Load current term
        currentTerm = await loadCurrentTerm();
        const termName = document.getElementById("term-name");
        termName.textContent = currentTerm?.name || translate[lang].noActiveTerm;
    }

    // Reset all tables
    ["weekly", "one-time"].forEach(type => {
        const tableBody = document.querySelector(`#${type}-list tbody`);
        tableBody.innerHTML = "";
    });
    const annList = document.querySelector("#announcement-list tbody");
    annList.innerHTML = "";

    if (currentTerm) {
        // Load schedule content into tables
        const data = await loadScheduleContent(currentUser.group);
        renderScheduleTables(data);
    }
}

/**
 * Starting Thread
 */
(async () => {
    const { groups } = await loadGroups();
    allGroups = groups;

    await _init(InitMode.FULL_INIT);

    updateInputType();
    programType.addEventListener("change", updateInputType);

    updateTime();
    setInterval(updateTime, 1000);
})();