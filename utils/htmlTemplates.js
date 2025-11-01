const translate = require('./lang');

function adminDashboard(lang = 'fa') {
    const t = translate[lang];
    return `
        <div class="container" id="main-container">
            <header>
                <img src="/assets/logo.png" alt="${t.logoAlt}" class="logo">
                <div>
                    <h1>${t.systemTitle}</h1>
                    <div id="admin-info">${t.adminPanel}</div>
                    <div id="datetime"></div>
                </div>
            </header>

            <section class="section">
                <h2>${t.expertAccounts}</h2>
                <form id="add-user-form">
                    <input type="text" placeholder="${t.username}" id="expert-username" required>
                    <input type="password" placeholder="${t.password}" id="expert-password" required>
                    <select id="user-group" required>
                        <option value="" disabled selected>انتخاب گروه</option>
                    </select>
                    <button type="submit">${t.addUser}</button>
                </form>
                <table id="users-table">
                    <thead>
                        <tr>
                            <th class="th-150">${t.username}</th>
                            <th class="th-150">${t.group}</th>
                            <th class="th-300">${t.password}</th>
                            <th class="th-75">${t.delete}</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </section>

            <section class="section">
                <h2>${t.manageTerm}</h2>
                <div id="current-term">
                    <p>${t.activeTerm}: ---</p>
                    <button id="end-term">${t.endTerm}</button>
                    <button id="new-term">${t.newTerm}</button>
                </div>
                <h3>${t.archive}</h3>
                <div id="term-list"></div>
            </section>
        </div>

        <!-- CSS AND JS -->
        <link rel="stylesheet" href="/css/admin.css">
        <script src="/js/admin.js"></script>
    `;
}

function expertDashboard(username, group, lang = 'fa') {
    const t = translate[lang];

    return `
        <div id="expert-panel">
            <header>
                <img src="/assets/logo.png" alt="${t.logoAlt}" class="logo">
                <div>
                    <h1>${t.systemTitle}</h1>
                    <div id="admin-info">${t.expertPanel}</div>
                    <div id="datetime"></div>
                </div>
            </header>

            <section id="expert-info">
                <h3>${t.expertInfo}</h3>
                <p>${t.username}: <span id="expert-username">${username}</span></p>
                <p>${t.group}: <span id="expert-group">${group}</span></p>
            </section>

            <section id="program-management">
                <h3>${t.currentTerm}: <span id="term-name"></span></h3>
                <button id="add-program-btn">${t.addProgram}</button>
                <button id="import-program-btn">${t.importProgram}</button>
                <div class="tabs">
                    <button class="tab-btn active" data-tab="weekly">${t.weeklyPrograms}</button>
                    <button class="tab-btn" data-tab="one-time">${t.specialEvents}</button>
                </div>

                <div class="tab-content" id="weekly">
                    <table id="weekly-list">
                        <thead>
                            <tr>
                                <th class="th-100">${t.title}</th>
                                <th class="th-50">${t.group}</th>
                                <th class="th-100">${t.host}</th>
                                <th class="th-100">${t.day}</th>
                                <th class="th-100">${t.startTime}</th>
                                <th class="th-100">${t.endTime}</th>
                                <th class="th-100">${t.place}</th>
                                <th class="th-50">${t.delete}</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>

                <div class="tab-content hidden" id="one-time">
                    <table id="one-time-list">
                        <thead>
                            <tr>
                                <th class="th-100">${t.title}</th>
                                <th class="th-50">${t.group}</th>
                                <th class="th-100">${t.host}</th>
                                <th class="th-100">${t.startTime}</th>
                                <th class="th-100">${t.endTime}</th>
                                <th class="th-100">${t.place}</th>
                                <th class="th-50">${t.delete}</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </section>

            <div id="program-dialog" class="dialog hidden">
                <form class="dialog-box" id="program-form">
                    <h3>${t.addProgram}</h3>
                    <select id="program-type" required>
                        <option value="weekly">${t.weeklyProgram}</option>
                        <option value="one-time">${t.oneTimeEvent}</option>
                    </select>

                    <div class="title-host">
                        <input type="text" id="program-title" placeholder="${t.title}" required>
                        <input type="text" id="program-group" placeholder="${t.group}" required>
                        <input type="text" id="program-host" placeholder="${t.host}" required>
                    </div>

                    <select id="program-day" required>
                        <option value="" disabled selected>${t.chooseDay}</option>
                        <option value="${t.saturday}">${t.saturday}</option>
                        <option value="${t.sunday}">${t.sunday}</option>
                        <option value="${t.monday}">${t.monday}</option>
                        <option value="${t.tuesday}">${t.tuesday}</option>
                        <option value="${t.wednesday}">${t.wednesday}</option>
                    </select>

                    <p>${t.timeRange}</p>
                    <div class="start-end">
                        <input id="program-start" placeholder="${t.startTime}" required>
                        <input type="time" id="program-end" placeholder="${t.endTime}" required>
                    </div>

                    <input type="text" id="program-place" placeholder="${t.place}" required>

                    <div class="dialog-actions">
                        <button id="program-submit" type="submit">${t.submit}</button>
                        <button type="button" onclick="closeProgramDialog()">${t.cancel}</button>
                    </div>
                </form>
            </div>

            <div id="import-dialog" class="dialog hidden">
                <form class="dialog-box" id="importForm">
                    <input type="file" id="excelFile" accept=".xlsx" required>
                    <div class="dialog-actions">
                        <button type="submit">${t.submit}</button>
                        <button type="button" onclick="closeImportDialog()">${t.cancel}</button>
                    </div>
                </form>
            </div>

            <section id="announcements">
                <h3>${t.announcements}</h3>
                <button id="add-announcement">${t.addAnnouncement}</button>
                <table id="announcement-list">
                    <thead>
                        <tr>
                            <th class="th-350">${t.announcementText}</th>
                            <th class="th-75">${t.delete}</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </section>

            <div id="announcement-dialog" class="dialog hidden">
                <form class="dialog-box" id="announcement-form">
                    <h3>${t.addAnnouncement}</h3>
                    <textarea rows="5" id="announcement-message" placeholder="${t.announcementText}" required></textarea>
                    <div class="dialog-actions">
                        <button type="submit">${t.submit}</button>
                        <button type="button" onclick="closeAnnouncementDialog()">${t.cancel}</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- CSS AND JS -->
        <link rel="stylesheet" href="/css/expert.css">
        <script src="/js/expert.js"></script>
    `;
}

module.exports = {
    adminDashboard,
    expertDashboard
};
