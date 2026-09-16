// ==========================================
// PROCUREMENT MANAGEMENT SYSTEM
// ROLE SELECTION
// ==========================================


// ==========================================
// GET LOGGED-IN USER
// ==========================================

const storedUser =
    sessionStorage.getItem("loggedInUser");

const storedRole =
    sessionStorage.getItem("userRole");

const storedEmail =
    sessionStorage.getItem("userEmail");


// ==========================================
// CHECK LOGIN
// ==========================================

if (!storedUser || !storedRole) {

    window.location.href =
        "login.html";
}


// ==========================================
// GET ELEMENTS
// ==========================================

const accountEmail =
    document.getElementById("accountEmail");

const accountAvatar =
    document.getElementById("accountAvatar");

const message =
    document.getElementById("message");

const logoutButton =
    document.getElementById("logoutButton");


const roleCards =
    document.querySelectorAll(".role-card");


// ==========================================
// DISPLAY ACCOUNT
// ==========================================

if (storedEmail) {

    accountEmail.textContent =
        storedEmail;


    accountAvatar.textContent =
        storedEmail
            .charAt(0)
            .toUpperCase();
}


// ==========================================
// NORMALIZE ROLE
// ==========================================

const userRole =
    storedRole
        .toString()
        .toUpperCase()
        .trim();


// ==========================================
// CONFIGURE ROLE CARDS
// ==========================================

roleCards.forEach(function (card) {

    const cardRole =
        card
            .getAttribute("data-role")
            .toUpperCase();


    const status =
        card.querySelector(
            ".role-status"
        );


    // ======================================
    // USER'S ACTUAL ROLE
    // ======================================

    if (cardRole === userRole) {

        card.classList.add("active");

        status.textContent =
            "Your workspace";


        card.addEventListener(
            "click",
            function () {

                openWorkspace(cardRole);

            }
        );

    }


    // ======================================
    // OTHER ROLES
    // ======================================

    else {

        card.classList.add("locked");

        status.textContent =
            "Not assigned";


        card.addEventListener(
            "click",
            function () {

                showRoleError();

            }
        );

    }

});


// ==========================================
// OPEN WORKSPACE
// ==========================================

function openWorkspace(role) {

    role =
        role.toUpperCase();


    if (role === "USER") {

        window.location.href =
            "user-dashboard.html";

        return;
    }


    if (role === "ADMIN") {

        window.location.href =
            "admin-dashboard.html";

        return;
    }


    if (role === "SUPPLIER") {

        window.location.href =
            "supplier-dashboard.html";

        return;
    }


    showMessage(
        "Your account has an invalid role. Please contact the administrator.",
        "error"
    );
}


// ==========================================
// ROLE ERROR
// ==========================================

function showRoleError() {

    showMessage(
        "This workspace is not assigned to your account.",
        "error"
    );

}


// ==========================================
// MESSAGE
// ==========================================

function showMessage(text, type) {

    message.textContent =
        text;

    message.className =
        "message " + type;


    setTimeout(
        function () {

            message.textContent =
                "";

            message.className =
                "message";

        },
        3500
    );
}


// ==========================================
// LOGOUT
// ==========================================

logoutButton.addEventListener(
    "click",
    function () {

        sessionStorage.removeItem(
            "loggedInUser"
        );

        sessionStorage.removeItem(
            "userEmail"
        );

        sessionStorage.removeItem(
            "userRole"
        );


        window.location.href =
            "login.html";

    }
);