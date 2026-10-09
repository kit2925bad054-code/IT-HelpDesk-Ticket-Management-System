const API = "http://localhost:8080/api";

/* =========================================================
   DEMO DATA
========================================================= */

let tickets = [
    {
        id: "T-1004",
        employeeName: "Meena",
        title: "VPN connection failure",
        description: "Cannot access internal network.",
        priority: "Critical",
        assignedTo: "Rahul",
        status: "In Progress"
    },
    {
        id: "T-1003",
        employeeName: "Arun",
        title: "Email sync issue",
        description: "Outlook is not syncing.",
        priority: "High",
        assignedTo: "Priya",
        status: "Assigned"
    },
    {
        id: "T-1002",
        employeeName: "Giri",
        title: "Laptop Wi-Fi issue",
        description: "Wi-Fi disconnects frequently.",
        priority: "High",
        assignedTo: "Rahul",
        status: "Open"
    },
    {
        id: "T-1001",
        employeeName: "Kavi",
        title: "Software installation",
        description: "Needs IDE installation.",
        priority: "Medium",
        assignedTo: "Arun",
        status: "Resolved"
    },
    {
        id: "T-1000",
        employeeName: "Sanjay",
        title: "Printer not responding",
        description: "Office printer is offline.",
        priority: "Low",
        assignedTo: "",
        status: "Open"
    }
];

const team = ["Rahul", "Priya", "Arun", "Divya"];

let selectedRole = null;


/* =========================================================
   HELPER
========================================================= */

function $(selector) {
    return document.querySelector(selector);
}

function priorityValue(priority) {
    const values = {
        Critical: 4,
        High: 3,
        Medium: 2,
        Low: 1
    };

    return values[priority] || 0;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/[&<>"']/g, function (character) {
            const map = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return map[character];
        });
}

function toast(message) {
    const element = $("#toast");

    if (!element) return;

    element.textContent = message;
    element.classList.add("show");

    setTimeout(function () {
        element.classList.remove("show");
    }, 2200);
}


/* =========================================================
   BACKEND / JDBC / MYSQL
========================================================= */

async function loadTicketsFromBackend() {
    try {
        const response = await fetch(`${API}/tickets`);

        if (!response.ok) {
            throw new Error("Failed to load tickets");
        }

        const data = await response.json();

        tickets = Array.isArray(data) ? data : [];

        console.log("Tickets loaded from Java backend:", tickets);

        renderAll();
        renderUserDashboard();

    } catch (error) {
        console.error("Backend ticket loading failed:", error);

        toast("Backend connection failed");

        /*
         * Keep demo data if backend is unavailable.
         * This prevents the UI from becoming blank.
         */
    }
}


/* =========================================================
   LOGIN
========================================================= */

function openLogin(role) {
    selectedRole = role;

    const formContainer = $("#loginFormContainer");

    if (formContainer) {
        formContainer.classList.remove("hidden");
    }

    if (role === "user") {

        if ($("#selectedRoleIcon")) {
            $("#selectedRoleIcon").textContent = "👤";
        }

        if ($("#selectedRoleTitle")) {
            $("#selectedRoleTitle").textContent = "User Login";
        }

        if ($("#selectedRoleDescription")) {
            $("#selectedRoleDescription").textContent =
                "Sign in to create and track your tickets";
        }

    } else {

        if ($("#selectedRoleIcon")) {
            $("#selectedRoleIcon").textContent = "🛠️";
        }

        if ($("#selectedRoleTitle")) {
            $("#selectedRoleTitle").textContent = "Admin Login";
        }

        if ($("#selectedRoleDescription")) {
            $("#selectedRoleDescription").textContent =
                "Sign in to manage the HelpDesk system";
        }
    }

    if ($("#loginUsername")) {
        $("#loginUsername").value = "";
    }

    if ($("#loginPassword")) {
        $("#loginPassword").value = "";
    }

    if ($("#loginError")) {
        $("#loginError").textContent = "";
    }

    if ($("#loginUsername")) {
        $("#loginUsername").focus();
    }
}

function logout() {

    if ($("#adminApp")) {
        $("#adminApp").classList.add("hidden");
    }

    if ($("#userApp")) {
        $("#userApp").classList.add("hidden");
    }

    if ($("#loginScreen")) {
        $("#loginScreen").classList.remove("hidden");
    }

    if ($("#loginFormContainer")) {
        $("#loginFormContainer").classList.add("hidden");
    }

    selectedRole = null;
}


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function renderStats() {

    if ($("#totalStat")) {
        $("#totalStat").textContent = tickets.length;
    }

    if ($("#highStat")) {
        $("#highStat").textContent = tickets.filter(function (ticket) {
            return (
                ticket.priority === "Critical" ||
                ticket.priority === "High"
            );
        }).length;
    }

    if ($("#progressStat")) {
        $("#progressStat").textContent = tickets.filter(function (ticket) {
            return ticket.status === "In Progress";
        }).length;
    }

    if ($("#resolvedStat")) {
        $("#resolvedStat").textContent = tickets.filter(function (ticket) {
            return ticket.status === "Resolved";
        }).length;
    }
}


function renderQueue() {

    const element = $("#queueList");

    if (!element) return;

    const list = tickets
        .filter(function (ticket) {
            return ticket.status !== "Resolved";
        })
        .sort(function (a, b) {
            return priorityValue(b.priority) - priorityValue(a.priority);
        });

    if (list.length === 0) {

        element.innerHTML = `
            <div class="ticket-row">
                <div class="ticket-meta">
                    No pending tickets.
                </div>
            </div>
        `;

        return;
    }

    element.innerHTML = list.slice(0, 5).map(function (ticket) {

        return `
            <div class="ticket-row">

                <div class="ticket-id">
                    ${ticket.id}
                </div>

                <div>

                    <div class="ticket-title">
                        ${escapeHtml(ticket.title)}
                    </div>

                    <div class="ticket-meta">
                        ${escapeHtml(ticket.employeeName)}
                        ·
                        ${escapeHtml(ticket.assignedTo || "Unassigned")}
                    </div>

                </div>

                <span class="priority ${ticket.priority}">
                    ${ticket.priority}
                </span>

            </div>
        `;

    }).join("");
}


function renderWorkload() {

    const element = $("#teamWorkload");

    if (!element) return;

    const counts = {};

    team.forEach(function (name) {

        counts[name] = tickets.filter(function (ticket) {

            return (
                ticket.assignedTo === name &&
                ticket.status !== "Resolved"
            );

        }).length;

    });

    const max = Math.max(
        1,
        ...Object.values(counts)
    );

    element.innerHTML = team.map(function (name) {

        const percentage =
            (counts[name] / max) * 100;

        return `
            <div class="workload">

                <div class="workload-top">
                    ${escapeHtml(name)}

                    <span>
                        ${counts[name]} active
                    </span>
                </div>

                <div class="bar">
                    <i style="width:${percentage}%"></i>
                </div>

            </div>
        `;

    }).join("");
}


function renderTable() {

    const element = $("#ticketsTable");

    if (!element) return;

    const searchElement = $("#globalSearch");
    const statusElement = $("#statusFilter");
    const priorityElement = $("#priorityFilter");

    const search = searchElement
        ? searchElement.value.toLowerCase()
        : "";

    const statusFilter = statusElement
        ? statusElement.value
        : "";

    const priorityFilter = priorityElement
        ? priorityElement.value
        : "";

    const filteredTickets = tickets.filter(function (ticket) {

        const searchMatch =
            !search ||
            [
                ticket.id,
                ticket.title,
                ticket.employeeName,
                ticket.assignedTo
            ]
                .join(" ")
                .toLowerCase()
                .includes(search);

        const statusMatch =
            !statusFilter ||
            ticket.status === statusFilter;

        const priorityMatch =
            !priorityFilter ||
            ticket.priority === priorityFilter;

        return (
            searchMatch &&
            statusMatch &&
            priorityMatch
        );
    });

    if (filteredTickets.length === 0) {

        element.innerHTML = `
            <tr>
                <td colspan="7">
                    No tickets found.
                </td>
            </tr>
        `;

        return;
    }

    element.innerHTML = filteredTickets.map(function (ticket) {

        return `
            <tr>

                <td class="td-title">
                    ${ticket.id}
                </td>

                <td class="td-title">
                    ${escapeHtml(ticket.title)}
                </td>

                <td>
                    ${escapeHtml(ticket.employeeName)}
                </td>

                <td>
                    <span class="priority ${ticket.priority}">
                        ${ticket.priority}
                    </span>
                </td>

               <td>
    <select id="assign-${ticket.id}" class="assign-select">
        <option value="">Unassigned</option>
        ${team.map(function (name) {
            return `
                <option value="${name}"
                    ${ticket.assignedTo === name ? "selected" : ""}>
                    ${name}
                </option>
            `;
        }).join("")}
    </select>

    <button
        class="mini-btn"
        onclick="assignTicket('${ticket.id}')">
        Assign
    </button>
</td>

                <td>
                    <span class="status">
                        ${ticket.status}
                    </span>
                </td>

                <td>
                    <button
                        class="mini-btn"
                        onclick="cycleStatus('${ticket.id}')">
                        Update
                    </button>
                </td>

            </tr>
        `;

    }).join("");
}


function renderTeam() {

    const element = $("#teamCards");

    if (!element) return;

    element.innerHTML = team.map(function (name) {

        const active = tickets.filter(function (ticket) {

            return (
                ticket.assignedTo === name &&
                ticket.status !== "Resolved"
            );

        }).length;

        const resolved = tickets.filter(function (ticket) {

            return (
                ticket.assignedTo === name &&
                ticket.status === "Resolved"
            );

        }).length;

        const initials = name
            .split(" ")
            .map(function (part) {
                return part[0];
            })
            .join("");

        return `
            <article class="team-card">

                <div class="team-head">

                    <div class="team-avatar">
                        ${initials}
                    </div>

                    <div>

                        <h3>
                            ${escapeHtml(name)}
                        </h3>

                        <p>
                            IT Support Engineer
                        </p>

                    </div>

                </div>

                <div class="team-count">
                    ${active}
                </div>

                <div class="team-label">
                    ACTIVE TICKETS · ${resolved} RESOLVED
                </div>

            </article>
        `;

    }).join("");
}


function renderAll() {

    renderStats();
    renderQueue();
    renderWorkload();
    renderTable();
    renderTeam();
}


/* =========================================================
   ADMIN STATUS UPDATE
========================================================= */

async function cycleStatus(id) {

    const ticket = tickets.find(function (item) {
        return item.id === id;
    });

    if (!ticket) return;

    const nextStatus = {
        Open: "Assigned",
        Assigned: "In Progress",
        "In Progress": "Resolved",
        Resolved: "Open"
    };

    const oldStatus = ticket.status;
    const newStatus = nextStatus[oldStatus];

    try {

        const response = await fetch(`${API}/tickets/status`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: ticket.id,
                status: newStatus
            })
        });

        if (!response.ok) {
            throw new Error("Status update failed");
        }

        const updatedTicket = await response.json();

        ticket.status = updatedTicket.status;

        toast(
            ticket.id +
            " moved to " +
            ticket.status
        );

        renderAll();
        renderUserDashboard();

    } catch (error) {

        console.error("Status update error:", error);

        ticket.status = oldStatus;

        toast("Failed to update ticket status");
    }
}

async function assignTicket(id) {

    const select = document.getElementById(`assign-${id}`);

    if (!select) return;

    const assignedTo = select.value;

    if (!assignedTo) {
        toast("Please select a team member");
        return;
    }

    try {

        const response = await fetch(`${API}/tickets/assign`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: id,
                assignedTo: assignedTo
            })
        });

        if (!response.ok) {
            throw new Error("Assignment failed");
        }

        const updatedTicket = await response.json();

const ticket = tickets.find(function (item) {
    return item.id === id;
});

if (ticket) {
    ticket.assignedTo = assignedTo;
    ticket.status = updatedTicket.status || "Assigned";
}
        toast(
            id + " assigned to " + assignedTo
        );

        renderAll();
        renderUserDashboard();

    } catch (error) {

        console.error("Assignment error:", error);

        toast("Failed to assign ticket");
    }
}
/* =========================================================
   ADMIN NAVIGATION
========================================================= */

function switchView(view) {

    document
        .querySelectorAll("#adminApp .view")
        .forEach(function (element) {
            element.classList.add("hidden");
        });

    const target = $("#" + view + "View");

    if (target) {
        target.classList.remove("hidden");
    }

    document
        .querySelectorAll("#adminApp .nav-item")
        .forEach(function (element) {

            element.classList.toggle(
                "active",
                element.dataset.view === view
            );

        });

    if ($("#pageTitle")) {

        if (view === "dashboard") {

            $("#pageTitle").textContent =
                "Good afternoon, Admin";

        } else if (view === "tickets") {

            $("#pageTitle").textContent =
                "Ticket Management";

        } else {

            $("#pageTitle").textContent =
                "Support Team";
        }
    }
}


/* =========================================================
   USER DASHBOARD
========================================================= */

function getUserTickets() {

    return tickets.filter(function (ticket) {

        return (
            ticket.employeeName &&
            ticket.employeeName.toLowerCase() === "giri"
        );

    });
}


function renderUserDashboard() {

    const userTickets = getUserTickets();

    if ($("#userTotalStat")) {
        $("#userTotalStat").textContent =
            userTickets.length;
    }

    if ($("#userProgressStat")) {
        $("#userProgressStat").textContent =
            userTickets.filter(function (ticket) {
                return ticket.status === "In Progress";
            }).length;
    }

    if ($("#userOpenStat")) {
        $("#userOpenStat").textContent =
            userTickets.filter(function (ticket) {
                return ticket.status === "Open";
            }).length;
    }

    if ($("#userResolvedStat")) {
        $("#userResolvedStat").textContent =
            userTickets.filter(function (ticket) {
                return ticket.status === "Resolved";
            }).length;
    }

    const recentElement = $("#userRecentTickets");

    if (!recentElement) return;

    if (userTickets.length === 0) {

        recentElement.innerHTML = `
            <div class="ticket-row">

                <div class="ticket-meta">
                    You haven't created any tickets yet.
                </div>

            </div>
        `;

        return;
    }

    recentElement.innerHTML =
        userTickets.slice(0, 5).map(function (ticket) {

            return `
                <div class="ticket-row">

                    <div class="ticket-id">
                        ${ticket.id}
                    </div>

                    <div>

                        <div class="ticket-title">
                            ${escapeHtml(ticket.title)}
                        </div>

                        <div class="ticket-meta">
                            Assigned to:
                            ${escapeHtml(
                                ticket.assignedTo ||
                                "Unassigned"
                            )}
                        </div>

                    </div>

                    <span class="status">
                        ${ticket.status}
                    </span>

                </div>
            `;

        }).join("");
}


function renderUserTickets() {

    const element = $("#userTicketsTable");

    if (!element) return;

    const userTickets = getUserTickets();

    if (userTickets.length === 0) {

        element.innerHTML = `
            <tr>
                <td colspan="5">
                    You haven't created any tickets yet.
                </td>
            </tr>
        `;

        return;
    }

    element.innerHTML = userTickets.map(function (ticket) {

        return `
            <tr>

                <td class="td-title">
                    ${ticket.id}
                </td>

                <td class="td-title">
                    ${escapeHtml(ticket.title)}
                </td>

                <td>
                    <span class="priority ${ticket.priority}">
                        ${ticket.priority}
                    </span>
                </td>

                <td>
                    ${escapeHtml(
                        ticket.assignedTo ||
                        "Unassigned"
                    )}
                </td>

                <td>
                    <span class="status">
                        ${ticket.status}
                    </span>
                </td>

            </tr>
        `;

    }).join("");
}


/* =========================================================
   USER NAVIGATION
========================================================= */

function switchUserView(view) {

    document
        .querySelectorAll("#userApp .view")
        .forEach(function (element) {
            element.classList.add("hidden");
        });

    const target = $("#" + view + "View");

    if (target) {
        target.classList.remove("hidden");
    }

    document
        .querySelectorAll("#userApp .nav-item")
        .forEach(function (element) {

            element.classList.toggle(
                "active",
                element.dataset.userView === view
            );

        });

    const titles = {
        userDashboard: "Welcome back, Giri",
        myTickets: "My Tickets",
        userProfile: "My Profile"
    };

    if ($("#userPageTitle")) {
        $("#userPageTitle").textContent =
            titles[view] || "HelpDesk";
    }

    if (view === "myTickets") {
        renderUserTickets();
    }
}


/* =========================================================
   CREATE TICKET MODAL
========================================================= */

function openTicketModal() {

    const modal = $("#modal");

    if (modal) {
        modal.classList.remove("hidden");
    }
}


function closeTicketModal() {

    const modal = $("#modal");

    if (modal) {
        modal.classList.add("hidden");
    }
}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* USER / ADMIN LOGIN BUTTONS */

    const userLoginButton = $("#userLoginBtn");

    if (userLoginButton) {
        userLoginButton.addEventListener("click", function () {
            openLogin("user");
        });
    }

    const adminLoginButton = $("#adminLoginBtn");

    if (adminLoginButton) {
        adminLoginButton.addEventListener("click", function () {
            openLogin("admin");
        });
    }


    /* BACK TO ROLE SELECTION */

    const backButton = $("#backToRoles");

    if (backButton) {

        backButton.addEventListener("click", function () {

            selectedRole = null;

            if ($("#loginFormContainer")) {
                $("#loginFormContainer")
                    .classList.add("hidden");
            }

        });
    }


    /* LOGIN FORM */

    const loginForm = $("#loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const username =
                $("#loginUsername").value.trim();

            const password =
                $("#loginPassword").value;

            let valid = false;

            if (
                selectedRole === "user" &&
                username === "giri" &&
                password === "1234"
            ) {
                valid = true;
            }

            if (
                selectedRole === "admin" &&
                username === "admin" &&
                password === "admin123"
            ) {
                valid = true;
            }

            if (!valid) {

                if ($("#loginError")) {
                    $("#loginError").textContent =
                        "Invalid username or password.";
                }

                return;
            }

            if ($("#loginError")) {
                $("#loginError").textContent = "";
            }

            if ($("#loginScreen")) {
                $("#loginScreen").classList.add("hidden");
            }

            if (selectedRole === "admin") {

                if ($("#adminApp")) {
                    $("#adminApp").classList.remove("hidden");
                }

                renderAll();

                /*
                 * Load actual MySQL data
                 */
                loadTicketsFromBackend();

            } else {

                if ($("#userApp")) {
                    $("#userApp").classList.remove("hidden");
                }

                renderUserDashboard();

                /*
                 * Load actual MySQL data
                 */
                loadTicketsFromBackend();
            }

        });
    }


    /* LOGOUT BUTTONS */

    document
        .querySelectorAll("[data-logout]")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                logout
            );

        });

    const adminLogout = $("#adminLogout");

    if (adminLogout) {
        adminLogout.addEventListener(
            "click",
            logout
        );
    }

    const userLogout = $("#userLogout");

    if (userLogout) {
        userLogout.addEventListener(
            "click",
            logout
        );
    }


    /* ADMIN NAVIGATION */

    document
        .querySelectorAll("#adminApp .nav-item")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    switchView(
                        button.dataset.view
                    );

                }
            );

        });


    document
        .querySelectorAll("#adminApp [data-view-target]")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    switchView(
                        button.dataset.viewTarget
                    );

                }
            );

        });


    /* USER NAVIGATION */

    document
        .querySelectorAll("#userApp .nav-item")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    switchUserView(
                        button.dataset.userView
                    );

                }
            );

        });


    document
        .querySelectorAll(
            "#userApp [data-user-view-target]"
        )
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    switchUserView(
                        button.dataset.userViewTarget
                    );

                }
            );

        });


    /* FILTERS */

    const statusFilter = $("#statusFilter");

    if (statusFilter) {
        statusFilter.addEventListener(
            "change",
            renderTable
        );
    }

    const priorityFilter = $("#priorityFilter");

    if (priorityFilter) {
        priorityFilter.addEventListener(
            "change",
            renderTable
        );
    }

    const search = $("#globalSearch");

    if (search) {
        search.addEventListener(
            "input",
            renderTable
        );
    }


    /* NEW TICKET BUTTONS */

    const newTicketButton = $("#newTicketBtn");

    if (newTicketButton) {
        newTicketButton.addEventListener(
            "click",
            openTicketModal
        );
    }

    const userNewTicketButton =
        $("#userNewTicketBtn");

    if (userNewTicketButton) {
        userNewTicketButton.addEventListener(
            "click",
            openTicketModal
        );
    }

    const userHeroTicketButton =
        $("#userHeroTicketBtn");

    if (userHeroTicketButton) {
        userHeroTicketButton.addEventListener(
            "click",
            openTicketModal
        );
    }


    /* CLOSE MODAL */

    const closeModal = $("#closeModal");

    if (closeModal) {
        closeModal.addEventListener(
            "click",
            closeTicketModal
        );
    }

    const modal = $("#modal");

    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (event.target === modal) {
                    closeTicketModal();
                }

            }
        );

    }


    /* ASSIGNEE DROPDOWN */

    const assigneeSelect =
        $("#assigneeSelect");

    if (assigneeSelect) {

        team.forEach(function (name) {

            const option =
                document.createElement("option");

            option.value = name;
            option.textContent = name;

            assigneeSelect.appendChild(option);

        });

    }


    /* =====================================================
       CREATE TICKET FORM
    ===================================================== */

    const ticketForm = $("#ticketForm");

    if (ticketForm) {

        ticketForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                const formData =
                    new FormData(ticketForm);

                const employeeName =
                    formData.get("employeeName") ||
                    "Giri";

                const assignedTo =
                    formData.get("assignedTo") ||
                    "";

                const ticket = {

                    id:
                        "T-" +
                        Date.now(),

                    employeeName:
                        employeeName,

                    title:
                        formData.get("title") ||
                        "New IT issue",

                    description:
                        formData.get("description") ||
                        "",

                    priority:
                        formData.get("priority") ||
                        "Medium",

                    assignedTo:
                        assignedTo,

                    status:
                        assignedTo
                            ? "Assigned"
                            : "Open"
                };


                /* =========================================
                   SEND TICKET TO JAVA BACKEND
                ========================================= */

                try {

                    const response = await fetch(
                        `${API}/tickets/create`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify(ticket)
                        }
                    );


                    if (!response.ok) {

                        const errorText =
                            await response.text();

                        throw new Error(
                            errorText ||
                            "Ticket creation failed"
                        );
                    }


                    const savedTicket =
                        await response.json();


                    /*
                     * IMPORTANT:
                     * Add the ticket only after
                     * Java/JDBC/MySQL accepts it.
                     */

                    tickets.unshift(savedTicket);


                    ticketForm.reset();

                    closeTicketModal();


                    toast(
                        savedTicket.id +
                        " saved to MySQL successfully"
                    );


                    renderAll();
                    renderUserDashboard();


                    console.log(
                        "Ticket saved through backend:",
                        savedTicket
                    );


                } catch (error) {

                    console.error(
                        "Ticket creation error:",
                        error
                    );

                    toast(
                        "Failed to save ticket to MySQL"
                    );

                }

            }
        );
    }


    /* =====================================================
       INITIAL DEMO RENDER
    ===================================================== */

    renderAll();
    renderUserDashboard();

});