/**
 * Global Values
 */
let allGroups, currentTerm, todayDayName;
const lang = document.documentElement.lang || 'fa';
const itemLimit = 8;
const itemSpeed = 2;
const tickerSpeed = 0.1;

/**
 * Time & Date Section
 */
function formatJalaliDate() {
    const now = new Date();
    const numType = lang === 'fa' ? "fa-IR" : "en-US";
    const formatter = new Intl.DateTimeFormat(`${numType}-u-ca-persian`, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const parts = formatter.formatToParts(now);
    const map = {};
    parts.forEach(p => map[p.type] = p.value);

    return `${map.weekday}، ${map.day} ${map.month} ${map.year}`;
}

function formatTime() {
    const now = new Date();
    const numType = lang === 'fa' ? "fa-IR" : "en-US";
    return now.toLocaleTimeString(numType);
}

function updateClock() {
    document.getElementById("date").textContent = formatJalaliDate();
    document.getElementById("time").textContent = formatTime();
}

/**
 * Program Section
*/
function normalizePersian(str) {
    return str
        .replace(/ي/g, 'ی')  // Yeh
        .replace(/ك/g, 'ک')  // Kaf
        .replace(/ة/g, 'ه')  // Teh marbuta → Heh
        .replace(/ؤ/g, 'و')  // Sometimes replace Arabic waw with hamza
        .normalize();
}

function getStatus(start, end, now = new Date()) {
    if (start <= now && now <= end) {
        return translate[lang].inProgress;
    } else if (start > now) {
        const diffMin = Math.floor((start - now) / 60000);
        return `${diffMin} ${translate[lang].minute}`;
    }
    return null;
}

function parseDateTime(datetimeStr) {
    // Seperate day and time
    const [datePart, timePart] = datetimeStr.split("T").map(s => s.trim());

    // Seperate year, month and day
    const [y, m, d] = datePart.split("-").map(Number);

    // Seperate hour and minutes
    const [hour, minutes] = timePart.split(":").map(Number);

    // Reformat the time and return the final result
    const date = new Date(y, m - 1, d, hour, minutes);
    return date;
}

function parseTimeOnly(timeStr) {
    // Seperate hours and minutes
    const [hours, minutes] = timeStr.split(":").map(Number);

    // Reformat the time and return the final result
    // (Exp format: Sun May 31 2646 15:50:00 GMT+0330 (Iran Daylight Time))
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
}

function processPrograms(programs) {
    return programs.map(p => {
        const isWeekly = p.type === 'weekly';
        const start = isWeekly ? parseTimeOnly(p.start) : parseDateTime(p.start);
        const end = parseTimeOnly(p.end);
        const status = getStatus(start, end);
        return status ? { ...p, sortTime: start, status } : null;
    })
        .filter(Boolean)
        .sort((a, b) => a.group_id - b.group_id)
        .sort((a, b) => a.sortTime - b.sortTime);
}

function filterAndSortPrograms(events) {
    // Sort programs
    let programs = processPrograms(events);

    // Filter only today's programs
    const todayPrograms = programs.filter(item => {
        if (item.day.length === 0) {
            // Special events
            const now = new Date();
            const start = new Date(item.start);
            return start.toDateString() === now.toDateString();
        } else {
            // Daily programs
            return normalizePersian(item.day) === todayDayName;
        }
    });

    // Return final result
    return todayPrograms;
}

function initBoard(data, firstRun = false) {
    const flightsContainer = document.getElementById('flights');
    flightsContainer.innerHTML = '';
    const todayPrograms = filterAndSortPrograms(data.events);

    // Populate classes
    todayPrograms.forEach(p => {
        const row = document.createElement('tr');

        if (p.status === translate[lang].inProgress) {
            row.classList.add(`in-progress-${p.group_id}`);
        } else {
            row.classList.add(`remaining-${p.group_id}`);
        }

        const group = allGroups.find(g => g.id === p.group_id)?.name || translate[lang].noGroup;
        row.innerHTML = `
            <td class="p-3">${p.host}</td>
            <td class="p-3">${p.title}</td>
            <td class="p-3">${p.group_number}</td>
            <td class="p-3">${p.place}</td>
            <td class="p-3">${p.status}</td>
            <td class="p-3">${group}</td>
        `;
        flightsContainer.appendChild(row);
    });

    const n = flights.children.length;

    if (n < itemLimit) {
        flights.style.animation = "none";
        flights.style.removeProperty("--scroll-duration");
    } else {
        const duration = n * itemSpeed;
        flights.style.setProperty("--scroll-duration", `${duration}s`);
    }

    if (firstRun) {
        const tickerContainer = document.getElementById('ticker');

        // Populate ticker
        let sumLength = 0;
        tickerContainer.innerHTML = data.announcements
            .map(ann => {
                sumLength += ann.message.length;
                const group = allGroups.find(g => g.id === ann.group_id)?.name || translate[lang].noGroup;
                return `<span class="mx-8">${ann.message} (${group})</span>`
            }).join('<span class="text-yellow-300"> • </span>');

        let duration = sumLength * tickerSpeed;
        duration = Math.max(duration, 15);
        ticker.style.setProperty("--ticker-duration", `${duration}s`);
        if (lang === "fa") {
            ticker.style.setProperty("--ticker-start", "100%");
            ticker.style.setProperty("--ticker-end", "-100%");
        } else {
            ticker.style.setProperty("--ticker-start", "-100%");
            ticker.style.setProperty("--ticker-end", "100%");
        }
    }
}

/**
 * Starting Thread
 */
(async () => {
    const { groups } = await loadGroups();
    allGroups = groups;

    // Get active term
    currentTerm = await loadCurrentTerm();
    if (!currentTerm) {
        return;
    }

    // Get all groups data
    let data = await loadScheduleContent(1);

    const weekdays = [
        translate[lang].sunday,
        translate[lang].monday,
        translate[lang].tuesday,
        translate[lang].wednesday,
        translate[lang].thursday,
        translate[lang].friday,
        translate[lang].saturday
    ];
    todayDayName = weekdays[new Date().getDay()];

    initBoard(data, true);
    setInterval(() => initBoard(data), 60000);

    updateClock();
    setInterval(updateClock, 1000);
})();
