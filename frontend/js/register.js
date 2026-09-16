// ==========================================
// PROCUREMENT MANAGEMENT SYSTEM
// USER REGISTRATION
// ==========================================


// ------------------------------------------
// SHOW / HIDE PASSWORD
// ------------------------------------------

function togglePassword(inputId, button) {

    const input = document.getElementById(inputId);

    if (input.type === "password") {

        input.type = "text";
        button.textContent = "Hide";

    } else {

        input.type = "password";
        button.textContent = "Show";
    }
}


// ------------------------------------------
// SHOW MESSAGE
// ------------------------------------------

function showMessage(message, type) {

    const messageBox =
        document.getElementById("message");

    messageBox.textContent = message;

    messageBox.className =
        "message " + type;
}


// ------------------------------------------
// CLEAR MESSAGE
// ------------------------------------------

function clearMessage() {

    const messageBox =
        document.getElementById("message");

    messageBox.textContent = "";

    messageBox.className = "message";
}


// ------------------------------------------
// REGISTRATION
// ------------------------------------------

document
    .getElementById("registerForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        clearMessage();


        // ----------------------------------
        // GET FORM VALUES
        // ----------------------------------

        const firstName =
            document
                .getElementById("firstName")
                .value
                .trim();

        const lastName =
            document
                .getElementById("lastName")
                .value
                .trim();

        const email =
            document
                .getElementById("email")
                .value
                .trim();

        const phoneNumber =
            document
                .getElementById("phone")
                .value
                .trim();

        const password =
            document
                .getElementById("password")
                .value;

        const confirmPassword =
            document
                .getElementById("confirmPassword")
                .value;


        // ----------------------------------
        // VALIDATION
        // ----------------------------------

        if (!firstName || !lastName) {

            showMessage(
                "Please enter your full name.",
                "error"
            );

            return;
        }


        if (!email) {

            showMessage(
                "Please enter your email address.",
                "error"
            );

            return;
        }


        if (!phoneNumber) {

            showMessage(
                "Please enter your phone number.",
                "error"
            );

            return;
        }


        if (password.length < 6) {

            showMessage(
                "Password must contain at least 6 characters.",
                "error"
            );

            return;
        }


        if (password !== confirmPassword) {

            showMessage(
                "Passwords do not match.",
                "error"
            );

            return;
        }


        // ----------------------------------
        // COMBINE FIRST + LAST NAME
        // ----------------------------------

        const fullName =
            firstName + " " + lastName;


        // ----------------------------------
        // CREATE BACKEND REQUEST
        // ----------------------------------

        const userData = {

            name: fullName,

            email: email,

            password: password,

            phoneNumber: phoneNumber

        };


        // ----------------------------------
        // BUTTON
        // ----------------------------------

        const registerButton =
            document.getElementById(
                "registerButton"
            );

        registerButton.disabled = true;

        registerButton.textContent =
            "Creating Account...";


        try {

            // --------------------------------
            // CALL SPRING BOOT BACKEND
            // --------------------------------

            const response =
                await fetch(
                    "/api/auth/register",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(userData)
                    }
                );


            // --------------------------------
            // READ RESPONSE
            // --------------------------------

            const responseText =
                await response.text();


            // --------------------------------
            // SUCCESS
            // --------------------------------

            if (response.ok) {

                showMessage(
                    "Account created successfully! Redirecting to login...",
                    "success"
                );


                // Clear form

                document
                    .getElementById("registerForm")
                    .reset();


                // Redirect after 2 seconds

                setTimeout(function () {

                    window.location.href =
                        "login.html";

                }, 2000);

                return;
            }


            // --------------------------------
            // BACKEND ERROR
            // --------------------------------

            let errorMessage =
                "Registration failed.";


            if (responseText) {

                try {

                    const errorData =
                        JSON.parse(responseText);

                    if (errorData.message) {

                        errorMessage =
                            errorData.message;

                    } else {

                        errorMessage =
                            responseText;
                    }

                } catch (error) {

                    errorMessage =
                        responseText;
                }
            }


            showMessage(
                errorMessage,
                "error"
            );


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            showMessage(
                "Unable to connect to the server. Please make sure Spring Boot is running.",
                "error"
            );

        } finally {

            registerButton.disabled = false;

            registerButton.textContent =
                "Create Account";
        }

    });