/**
 * Alerts Section
 */
// Info Alert
function showInfoAlert(message) {
    document.getElementById("info-message").textContent = message;
    document.getElementById("info-alert").classList.remove("alert-hidden");
}

function closeInfoAlert() {
    document.getElementById("info-alert").classList.add("alert-hidden");
}

// Timer Alert
function showTimerAlert(message, duration = 5000) {
    document.getElementById("timer-message").textContent = message;
    const el = document.getElementById("timer-alert");
    el.classList.remove("alert-hidden");

    setTimeout(() => {
        el.classList.add("alert-hidden");
    }, duration);
}

// Yes/No Alert (returns a Promise)
function showYesOrNoAlert(message) {
    return new Promise((resolve) => {
        document.getElementById("yesno-message").textContent = message;
        document.getElementById("yesno-alert").classList.remove("alert-hidden");

        window.resolveYesNo = (answer) => {
            document.getElementById("yesno-alert").classList.add("alert-hidden");
            resolve(answer);
        };
    });
}

// Input Alert 
function showInputAlert(message) {
    document.getElementById("input-message").textContent = message;
    document.getElementById("input-field").value = "";
    document.getElementById("input-alert").classList.remove("alert-hidden");

    window.resolveInput = (confirmed) => {
        const value = confirmed
            ? document.getElementById("input-field").value.trim()
            : null;

        document.getElementById("input-alert").classList.add("alert-hidden");
        window._inputResolve(value);
    };

    return new Promise((resolve) => {
        window._inputResolve = resolve;
    });
}

/**
 * Group Section
 */
async function loadGroups() {
    // Send request to server
    try {
        const res = await fetch(`/api/groups`, {
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

/**
 * Term Section
 */
async function loadCurrentTerm() {
    // Send request to server
    try {
        const res = await fetch(`/api/terms`);

        // Check the response
        if (!res.ok) throw new Error(translate[lang].serverResponseError);

        // Final result
        const { terms } = await res.json();
        return terms.find(d => d.is_active === 1);

    } catch (err) {
        // Log error
        console.error("خطا در اتصال به سرور: ", err);
        showInfoAlert(translate[lang].connectionFailed);
        return null;
    }
}

/**
 * Schedule Section
 */
async function loadScheduleContent(group) {
    // Send request to server
    try {
        const res = await fetch(`/api/load/schedule`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ term_id: currentTerm.id, group_id: group })
        });

        // Check the response
        if (!res.ok) throw new Error(translate[lang].serverResponseError);

        // Return schedule data
        return await res.json();

    } catch (err) {
        // Log error
        console.error("خطا در اتصال به سرور: ", err);
        showInfoAlert(translate[lang].connectionFailed);
    }
}

/**
 * Language Section
 */
const translate = {
    fa: {
        // --- Login & Global ---
        wrongCredentials: "نام کاربری یا رمز عبور نادرست است!",
        serverResponseError: "خطا در پاسخ دریافتی از سرور!",
        connectionError: "خطا در ارتباط با سرور!",
        connectionFailed: "اتصال به سرور برقرار نشد!",

        // --- Announcements ---
        confirmDeleteAnnouncement: "آیا از حذف اطلاعیه مطمئن هستید؟",
        announcementDeleted: "اطلاعیه باموفقیت حذف شد.",
        announcementNotFound: "اطلاعیه یافت نشد!",
        announcementAdded: "اطلاعیه با موفقیت ثبت شد.",

        // --- Programs ---
        confirmDeleteProgram: "آیا از حذف زمان‌بندی مطمئن هستید؟",
        programDeleted: "برنامه با موفقیت حذف شد.",
        programNotFound: "برنامه یافت نشد!",
        programAdded: "برنامه‌ی جدید با موفقیت اضافه شد.",
        endAfterStart: "زمان پایان حتما باید بعد از زمان شروع باشد!",
        startTime: "ساعت شروع",
        endTime: "ساعت پایان",
        startDate: "تاریخ و ساعت شروع",
        fileSelectAlert: "لطفا یک فایل انتخاب کنید",
        fileImported: "فایل باموفقیت وارد شد.",

        // --- Users ---
        confirmDeleteUser: 'آیا از حذف کاربر مطمئن هستید؟',
        userDeleted: "حساب کاربری باموفقیت حذف شد.",
        userNotFound: "کاربر موردنظر یافت نشد!",
        confirmChangePassword: 'آیا از تغییر رمز کاربر مطمئن هستید؟',
        passwordChanged: "رمز عبور با موفقیت تغییر کرد.",
        addUserSuccess: "کاربر باموفقیت اضافه شد.",
        userExists: "خطا: کاربری با این نام‌کاربری وجود دارد!",

        // --- Terms ---
        confirmDeleteTerm: 'آیا از حذف ترم مطمئن هستید؟',
        termDeleted: "ترم با موفقیت حذف شد.",
        cannotDeleteActiveTerm: "نمیتوان ترم فعال را حذف نمود",
        termNotFound: "ترم یافت نشد!",
        confirmEndTerm: "آیا از اتمام ترم مطمئن هستید؟",
        confirmActivateTerm: 'آیا از فعال‌سازی ترم مطمئن هستید؟',
        termActivated: "ترم با موفقیت فعال شد.",
        inputNewTerm: "نام ترم جدید را وارد کنید:",
        termCreated: "ترم جدید با موفقیت ایجاد شد.",
        noActiveTerm: "ترمی فعال نیست",
        errorGetTerm: "خطا در دریافت ترم جاری!",

        // --- Misc ---
        noGroup: "بدون گروه",
        groupProgram: "برنامه‌ی گروه GGG",
        passwordPlaceholder: "رمزعبور",
        change: "تغییر",
        delete: "حذف",
        activate: "فعال‌سازی",
        invalidDate: "تاریخ نامعتبر",
        inProgress: "درحال برگزاری",
        minute: "دقیقه‌ی دیگر",

        // --- Week ---
        saturday: "شنبه",
        sunday: "یکشنبه",
        monday: "دوشنبه",
        tuesday: "سه‌شنبه",
        wednesday: "چهارشنبه",
        thursday: "پنجشنبه",
        friday: "جمعه",
    },

    en: {
        // --- Login & Global ---
        wrongCredentials: "Incorrect username or password!",
        serverResponseError: "Error in the server response!",
        connectionError: "Connection error with the server!",
        connectionFailed: "Failed to connect to the server!",

        // --- Announcements ---
        confirmDeleteAnnouncement: "Are you sure you want to delete the announcement?",
        announcementDeleted: "Announcement deleted successfully.",
        announcementNotFound: "Announcement not found!",
        announcementAdded: "Announcement added successfully.",

        // --- Programs ---
        confirmDeleteProgram: "Are you sure you want to delete the schedule?",
        programDeleted: "Program deleted successfully.",
        programNotFound: "Program not found!",
        programAdded: "New program added successfully.",
        endAfterStart: "The end time must be after the start time!",
        startTime: "Start Time",
        endTime: "End Time",
        startDate: "Start Date & Time",
        fileSelectAlert: "Please select a file",
        fileImported: "File has been imported successfully.",

        // --- Users ---
        confirmDeleteUser: 'Are you sure you want to delete the user?',
        userDeleted: "User account deleted successfully.",
        userNotFound: "User not found!",
        confirmChangePassword: 'Are you sure you want to change the user password?',
        passwordChanged: "Password changed successfully.",
        addUserSuccess: "User added successfully.",
        userExists: "Error: A user with this username already exists!",

        // --- Terms ---
        confirmDeleteTerm: 'Are you sure you want to delete the term?',
        termDeleted: "Term deleted successfully.",
        cannotDeleteActiveTerm: "Cannot delete an active term.",
        termNotFound: "Term not found!",
        confirmEndTerm: "Are you sure you want to end the term?",
        confirmActivateTerm: 'Are you sure you want to activate the term?',
        termActivated: "The term activated successfully.",
        inputNewTerm: "Enter the new term name:",
        termCreated: "New term created successfully.",
        noActiveTerm: "No active term",
        errorGetTerm: "Error while getting current term",

        // --- Misc ---
        noGroup: "No group",
        groupProgram: "Group GGG's Program",
        passwordPlaceholder: "Password",
        change: "Change",
        delete: "Delete",
        activate: "Activate",
        invalidDate: "Invalid Date",
        inProgress: "In Progress",
        minute: "Min",

        // --- Week ---
        saturday: "Saturday",
        sunday: "Sunday",
        monday: "Monday",
        tuesday: "Tuesday",
        wednesday: "Wednesday",
        thursday: "Thursday",
        friday: "Friday",
    }
};

