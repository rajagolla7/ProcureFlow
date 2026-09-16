// ==========================================
// PROCUREMENT MANAGEMENT SYSTEM
// LOGIN
// ==========================================


// ==========================================
// SHOW / HIDE PASSWORD
// ==========================================

const togglePassword =
    document.getElementById("togglePassword");

const passwordInput =
    document.getElementById("password");


togglePassword.addEventListener(
    "click",
    function () {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            togglePassword.textContent =
                "Hide";

        } else {

            passwordInput.type = "password";

            togglePassword.textContent =
                "Show";
        }

    }
);


// ==========================================
// MESSAGE
// ==========================================

function showMessage(message, type) {

    const messageBox =
        document.getElementById("message");

    messageBox.textContent =
        message;

    messageBox.className =
        "message " + type;
}


function clearMessage() {

    const messageBox =
        document.getElementById("message");

    messageBox.textContent = "";

    messageBox.className =
        "message";
}


// ==========================================
// LOGIN
// ==========================================

document
    .getElementById("loginForm")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            clearMessage();


            // ==================================
            // GET VALUES
            // ==================================

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;


            // ==================================
            // VALIDATION
            // ==================================

            if (!email) {

                showMessage(
                    "Please enter your email address.",
                    "error"
                );

                return;
            }


            if (!password) {

                showMessage(
                    "Please enter your password.",
                    "error"
                );

                return;
            }


            // ==================================
            // LOGIN BUTTON
            // ==================================

            const loginButton =
                document.getElementById(
                    "loginButton"
                );


            loginButton.disabled = true;


            loginButton.querySelector(
                "span:first-child"
            ).textContent =
                "Signing In...";


            try {


                // ==================================
                // CALL SPRING BOOT
                // ==================================

                const response =
                    await fetch(
                        "/api/auth/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    email: email,
                                    password: password
                                })
                        }
                    );


                // ==================================
                // READ RESPONSE
                // ==================================

                const responseText =
                    await response.text();


                // ==================================
                // SUCCESS
                // ==================================

                if (response.ok) {

                    let user;

                    try {

                        user =
                            JSON.parse(
                                responseText
                            );

                    } catch (error) {

                        showMessage(
                            "Invalid server response.",
                            "error"
                        );

                        return;
                    }


                    // ==================================
                    // STORE LOGGED-IN USER
                    // ==================================

                    sessionStorage.setItem(
                        "loggedInUser",
                        JSON.stringify(user)
                    );


                    sessionStorage.setItem(
                        "userEmail",
                        user.email
                    );


                    sessionStorage.setItem(
                        "userRole",
                        user.role
                    );


                    // ==================================
                    // SUCCESS MESSAGE
                    // ==================================

                    showMessage(
                        "Login successful! Redirecting...",
                        "success"
                    );


                    // ==================================
                    // NEXT PAGE
                    // ==================================

                    setTimeout(
                        function () {

                            window.location.href =
                                "role-selection.html";

                        },
                        1000
                    );


                    return;
                }


                // ==================================
                // LOGIN FAILED
                // ==================================

                let errorMessage =
                    "Invalid email or password.";


                if (responseText) {

                    errorMessage =
                        responseText;
                }


                showMessage(
                    errorMessage,
                    "error"
                );


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                showMessage(
                    "Unable to connect to the server. Please make sure Spring Boot is running.",
                    "error"
                );


            } finally {

                loginButton.disabled = false;

                loginButton.querySelector(
                    "span:first-child"
                ).textContent =
                    "Sign In";
            }

        }
    );