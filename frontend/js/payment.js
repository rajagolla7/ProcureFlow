const API_BASE_URL = "";

const params = new URLSearchParams(window.location.search);
const requestId = params.get("requestId");

const requestIdElement = document.getElementById("requestId");
const productNameElement = document.getElementById("productName");
const quantityElement = document.getElementById("quantity");
const totalAmountElement = document.getElementById("totalAmount");

const pageMessage = document.getElementById("pageMessage");
const methodSection = document.getElementById("methodSection");
const successSection = document.getElementById("successSection");

const upiPanel = document.getElementById("upiPanel");
const cardPanel = document.getElementById("cardPanel");
const qrPanel = document.getElementById("qrPanel");

const upiPayButton = document.getElementById("upiPayButton");
const cardPayButton = document.getElementById("cardPayButton");
const qrPayButton = document.getElementById("qrPayButton");

let currentRequest = null;
let currentMethod = "UPI";

function showMessage(message, type = "error") {
    pageMessage.textContent = message;
    pageMessage.className = "payment-message show " + type;
}

function clearMessage() {
    pageMessage.textContent = "";
    pageMessage.className = "payment-message";
}

function formatMoney(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "₹0.00";
    }

    return "₹" + number.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function showMethod(method) {
    currentMethod = method;

    document.querySelectorAll(".method-card").forEach(button => {
        button.classList.toggle(
            "selected",
            button.dataset.method === method
        );
    });

    upiPanel.classList.toggle("active", method === "UPI");
    cardPanel.classList.toggle("active", method === "CARD");
    qrPanel.classList.toggle("active", method === "UPI_QR");

    clearMessage();
}

async function loadRequest() {
    if (!requestId || !/^\d+$/.test(requestId)) {
        showMessage("Invalid request ID.");
        methodSection.style.display = "none";
        return;
    }

    try {
        const response = await fetch(
            API_BASE_URL + "/api/admin/requests"
        );

        const text = await response.text();

        let data;
        try {
            data = text ? JSON.parse(text) : [];
        } catch {
            data = [];
        }

        if (!response.ok) {
            throw new Error("Unable to load procurement requests.");
        }

        const requests = Array.isArray(data) ? data : [];

        currentRequest = requests.find(
            request =>
                Number(request.requestId) === Number(requestId)
        );

        if (!currentRequest) {
            throw new Error(
                "Request #" + requestId + " was not found."
            );
        }

        const status =
            String(currentRequest.status || "").toUpperCase();

        const paymentStatus =
            String(currentRequest.paymentStatus || "").toUpperCase();

        if (status !== "APPROVED") {
            throw new Error(
                "Only approved requests can be paid."
            );
        }

        if (paymentStatus === "PAID") {
            throw new Error(
                "This request has already been paid."
            );
        }

        requestIdElement.textContent =
            "#" + currentRequest.requestId;

        productNameElement.textContent =
            currentRequest.productName || "-";

        quantityElement.textContent =
            currentRequest.numberOfQuantities || "0";

        // IMPORTANT:
        // The amount comes from the backend request total.
        // Admin cannot change the amount on this page.
        totalAmountElement.textContent =
            formatMoney(currentRequest.totalPrice);

    } catch (error) {
        console.error("Payment page loading error:", error);
        showMessage(
            error.message || "Unable to load payment details."
        );
        methodSection.style.display = "none";
    }
}

function digitsOnly(value) {
    return String(value || "").replace(/\D/g, "");
}

function setButtonState(button, disabled, text) {
    button.disabled = disabled;
    button.textContent = text;
}

async function submitPayment(payload, button) {
    if (!currentRequest) {
        showMessage("Payment request is not loaded.");
        return;
    }

    clearMessage();

    setButtonState(button, true, "Processing Payment...");

    try {
        const response = await fetch(
            API_BASE_URL +
            `/api/admin/requests/${encodeURIComponent(requestId)}/pay`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        const text = await response.text();

        let data = null;

        if (text) {
            try {
                data = JSON.parse(text);
            } catch {
                data = text;
            }
        }

        if (!response.ok) {
            throw new Error(
                typeof data === "string"
                    ? data
                    : "Payment could not be completed."
            );
        }

        // Show a confirmation page instead of immediately navigating away.
        methodSection.style.display = "none";
        successSection.classList.add("active");

        document.getElementById("successRequest").textContent =
            "#" + currentRequest.requestId;

        document.getElementById("successAmount").textContent =
            formatMoney(currentRequest.totalPrice);

        document.getElementById("successMethod").textContent =
            currentMethod === "UPI"
                ? "UPI"
                : currentMethod === "CARD"
                    ? "Credit / Debit Card"
                    : "UPI QR";

        document.getElementById("transactionReference").textContent =
            data && data.transactionReference
                ? data.transactionReference
                : "PF-DEMO";

        clearMessage();

    } catch (error) {
        console.error("Dummy payment error:", error);

        showMessage(
            error.message || "Payment failed.",
            "error"
        );

        setButtonState(
            button,
            false,
            currentMethod === "UPI"
                ? "Proceed to Pay"
                : currentMethod === "CARD"
                    ? "Proceed to Pay"
                    : "Confirm QR Payment"
        );
    }
}

document.querySelectorAll(".method-card").forEach(button => {
    button.addEventListener("click", () => {
        showMethod(button.dataset.method);
    });
});

upiPayButton.addEventListener("click", () => {
    const upiId =
        document.getElementById("upiId").value.trim();

    const upiPin =
        document.getElementById("upiPin").value.trim();

    if (!upiId) {
        showMessage("Please enter the supplier UPI ID.");
        return;
    }

    if (!/^\S+@\S+$/.test(upiId)) {
        showMessage("Enter a valid demo UPI ID, for example supplier@upi.");
        return;
    }

    if (!/^\d{4}$|^\d{6}$/.test(upiPin)) {
        showMessage("Enter a demo UPI PIN of 4 or 6 digits.");
        return;
    }

    if (!window.confirm(
        `Pay ${totalAmountElement.textContent} to the supplier using UPI?`
    )) {
        return;
    }

    submitPayment(
        {
            paymentMethod: "UPI",
            accountHolderName: "Admin Demo",
            upiId: upiId,
            upiPin: upiPin
        },
        upiPayButton
    );
});

cardPayButton.addEventListener("click", () => {
    const holder =
        document.getElementById("cardHolder").value.trim();

    const cardNumber =
        digitsOnly(
            document.getElementById("cardNumber").value
        );

    const expiry =
        document.getElementById("cardExpiry").value.trim();

    const cvv =
        digitsOnly(
            document.getElementById("cardCvv").value
        );

    if (!holder) {
        showMessage("Please enter the card holder name.");
        return;
    }

    if (!/^\d{16}$/.test(cardNumber)) {
        showMessage("Enter a 16 digit demo card number.");
        return;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        showMessage("Enter expiry in MM/YY format.");
        return;
    }

    if (!/^\d{3}$/.test(cvv)) {
        showMessage("Enter a 3 digit demo CVV.");
        return;
    }

    if (!window.confirm(
        `Pay ${totalAmountElement.textContent} to the supplier using the demo card?`
    )) {
        return;
    }

    submitPayment(
        {
            paymentMethod: "CARD",
            accountHolderName: holder,
            cardLast4: cardNumber.slice(-4)
        },
        cardPayButton
    );
});

qrPayButton.addEventListener("click", () => {
    const scanned =
        document.getElementById("qrScanned").checked;

    const adminName =
        document.getElementById("qrAdminName").value.trim();

    if (!scanned) {
        showMessage("Please confirm that you scanned the demo QR.");
        return;
    }

    if (!adminName) {
        showMessage("Please enter the admin name.");
        return;
    }

    if (!window.confirm(
        `Confirm demo QR payment of ${totalAmountElement.textContent} to the supplier?`
    )) {
        return;
    }

    submitPayment(
        {
            paymentMethod: "UPI_QR",
            accountHolderName: adminName,
            qrScanned: true
        },
        qrPayButton
    );
});

document.getElementById("backButton").addEventListener(
    "click",
    () => {
        window.location.href = "admin-dashboard.html";
    }
);

document.getElementById("dashboardButton").addEventListener(
    "click",
    () => {
        window.location.href = "admin-dashboard.html";
    }
);

loadRequest();
