const API_BASE_URL = "";

const storedUser = sessionStorage.getItem("loggedInUser");
const storedRole = sessionStorage.getItem("userRole");

if (!storedUser || !storedRole) {
    window.location.href = "login.html";
}

let currentUser = null;

try {
    currentUser = JSON.parse(storedUser);
} catch (error) {
    console.error("Unable to read logged-in user:", error);
    sessionStorage.clear();
    window.location.href = "login.html";
}

const actualRole = currentUser && currentUser.role
    ? String(currentUser.role).toUpperCase().trim()
    : String(storedRole || "").toUpperCase().trim();

if (actualRole !== "ADMIN") {
    window.location.href = "role-selection.html";
}

const pageTitle = document.getElementById("pageTitle");
const sidebar = document.getElementById("sidebar");
const menuButton = document.getElementById("menuButton");
const logoutButton = document.getElementById("logoutButton");
const messageBox = document.getElementById("message");
const userName = document.getElementById("userName");
const userAvatar = document.getElementById("userAvatar");
const profileAvatar = document.getElementById("profileAvatar");
const profileName = document.getElementById("profileName");
const profileFullName = document.getElementById("profileFullName");
const profileEmail = document.getElementById("profileEmail");
const profilePhone = document.getElementById("profilePhone");
const profileDesignation = document.getElementById("profileDesignation");
const profileDepartment = document.getElementById("profileDepartment");

const totalRequests = document.getElementById("totalRequests");
const pendingRequests = document.getElementById("pendingRequests");
const approvedRequests = document.getElementById("approvedRequests");
const paidOrders = document.getElementById("paidOrders");
const recentPendingRequests = document.getElementById("recentPendingRequests");
const requestsTableBody = document.getElementById("requestsTableBody");
const productsTableBody = document.getElementById("productsTableBody");
const paymentsTableBody = document.getElementById("paymentsTableBody");
const downloadReportButton = document.getElementById("downloadReportButton");

const sectionTitles = {
    dashboard: "Dashboard",
    requests: "Requests",
    products: "Products",
    payments: "Payments",
    tracking: "Tracking",
    report: "Procurement Report",
    profile: "Profile",
    ratings: "Ratings"
};

let allRequests = [];

function safe(value, fallback = "-") {
    return value === null || value === undefined || value === "" ? fallback : value;
}

function escapeHtml(value) {
    return String(safe(value, ""))
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatMoney(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "₹0.00";
    return "₹" + number.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function normalizeStatus(value) {
    return String(safe(value, "PENDING")).toUpperCase();
}

function statusBadge(status) {
    const normalized = normalizeStatus(status);
    const css = normalized === "APPROVED"
        ? "status-approved"
        : normalized === "REJECTED"
            ? "status-rejected"
            : "status-pending";
    return `<span class="status-badge ${css}">${escapeHtml(normalized)}</span>`;
}

function paymentBadge(status) {
    const normalized = normalizeStatus(status);
    const css = normalized === "PAID" ? "payment-paid" : "payment-pending";
    return `<span class="payment-badge ${css}">${escapeHtml(normalized)}</span>`;
}

function getUserName(request) {
    if (request && request.user) {
        return safe(request.user.name || request.user.fullName || request.user.email);
    }
    return "-";
}

function showMessage(text, type) {
    if (!messageBox) return;
    messageBox.textContent = text;
    messageBox.className = "message " + type;
    window.clearTimeout(showMessage.timer);
    showMessage.timer = window.setTimeout(() => {
        messageBox.textContent = "";
        messageBox.className = "message";
    }, 3500);
}

function displayAdmin() {
    if (!currentUser) return;

    const name = currentUser.name || currentUser.fullName || "Admin";
    const firstLetter = name.charAt(0).toUpperCase() || "A";

    userName.textContent = name;
    userAvatar.textContent = firstLetter;
    profileAvatar.textContent = firstLetter;
    profileName.textContent = name;
    profileFullName.textContent = name;
    profileEmail.textContent = safe(currentUser.email);
    profilePhone.textContent = safe(currentUser.phoneNumber);
    profileDesignation.textContent = safe(currentUser.designation, "Administrator");

    const department = currentUser.department;
    if (department && typeof department === "object") {
        profileDepartment.textContent = safe(
            department.departmentName || department.name
        );
    } else {
        profileDepartment.textContent = safe(department);
    }
}

function showSection(sectionName) {
    document.querySelectorAll(".content-section").forEach(section => {
        section.classList.remove("active");
    });

    const selected = document.getElementById(sectionName + "Section");
    if (selected) selected.classList.add("active");

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.toggle("active", item.dataset.section === sectionName);
    });

    pageTitle.textContent = sectionTitles[sectionName] || "Dashboard";

    if (sectionName === "requests" || sectionName === "dashboard" || sectionName === "payments" || sectionName === "report") {
        loadRequests();
    }

    if (sectionName === "products") {
        loadProducts();
    }

    if (sectionName === "ratings") {
        loadRatings();
    }

    if (sectionName === "tracking") {
        loadAdminTracking();
    }

    if (sidebar) sidebar.classList.remove("open");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-section]").forEach(item => {
    item.addEventListener("click", () => {
        const section = item.dataset.section;
        if (section) showSection(section);
    });
});

if (menuButton) {
    menuButton.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });
}

if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        sessionStorage.removeItem("loggedInUser");
        sessionStorage.removeItem("userEmail");
        sessionStorage.removeItem("userRole");
        window.location.href = "login.html";
    });
}

async function fetchJson(url, options = {}) {
    const response = await fetch(API_BASE_URL + url, {
        ...options,
        headers: {
            "Accept": "application/json",
            ...(options.headers || {})
        }
    });

    const text = await response.text();
    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch (error) {
            data = text;
        }
    }

    if (!response.ok) {
        const serverMessage = typeof data === "string"
            ? data
            : "Request failed with status " + response.status;
        throw new Error(serverMessage);
    }

    return data;
}

async function loadRequests() {
    requestsTableBody.innerHTML = `<tr><td colspan="8" class="empty-row">Loading requests...</td></tr>`;

    try {
        const data = await fetchJson("/api/admin/requests");
        allRequests = Array.isArray(data) ? data : [];
        updateStats();
        updateReport();
        renderRequestsTable();
        renderPaymentsTable();
        renderRecentPending();
    } catch (error) {
        console.error("Admin request loading error:", error);
        allRequests = [];
        updateStats();
        requestsTableBody.innerHTML = `<tr><td colspan="8" class="empty-row">Unable to load requests: ${escapeHtml(error.message)}</td></tr>`;
        paymentsTableBody.innerHTML = `<tr><td colspan="6" class="empty-row">Unable to load payments.</td></tr>`;
        recentPendingRequests.innerHTML = `<div class="empty-state">Unable to load requests.</div>`;
    }
}

function updateStats() {
    const pending = allRequests.filter(r => normalizeStatus(r.status) === "PENDING").length;
    const approved = allRequests.filter(r => normalizeStatus(r.status) === "APPROVED").length;
    const paid = allRequests.filter(r => normalizeStatus(r.paymentStatus) === "PAID").length;

    totalRequests.textContent = allRequests.length;
    pendingRequests.textContent = pending;
    approvedRequests.textContent = approved;
    paidOrders.textContent = paid;
}

function renderRecentPending() {
    const pending = allRequests
        .filter(r => normalizeStatus(r.status) === "PENDING")
        .slice(0, 5);

    if (!pending.length) {
        recentPendingRequests.innerHTML = `<div class="empty-state">No pending requests.</div>`;
        return;
    }

    recentPendingRequests.innerHTML = pending.map(request => `
        <div class="mini-item">
            <div>
                <strong>Request #${escapeHtml(request.requestId)}</strong>
                <span>${escapeHtml(request.productName)} • ${escapeHtml(getUserName(request))}</span>
            </div>
            ${statusBadge(request.status)}
        </div>
    `).join("");
}

function renderRequestsTable() {
    if (!allRequests.length) {
        requestsTableBody.innerHTML = `<tr><td colspan="8" class="empty-row">No procurement requests found.</td></tr>`;
        return;
    }

    requestsTableBody.innerHTML = allRequests.map(request => {
        const status = normalizeStatus(request.status);
        const payment = normalizeStatus(request.paymentStatus);
        const requestId = Number(request.requestId);

        const approveDisabled = status !== "PENDING";
        const rejectDisabled = status !== "PENDING";
        const payDisabled = status !== "APPROVED" || payment === "PAID";

        return `
            <tr>
                <td><strong>#${escapeHtml(request.requestId)}</strong></td>
                <td>${escapeHtml(getUserName(request))}</td>
                <td>${escapeHtml(request.productName)}</td>
                <td>${escapeHtml(request.numberOfQuantities)}</td>
                <td>${formatMoney(request.totalPrice)}</td>
                <td>${statusBadge(status)}</td>
                <td>${paymentBadge(payment)}</td>
                <td>
                    <div class="action-group">
                        <button class="action-btn approve-btn" data-action="approve" data-id="${requestId}" ${approveDisabled ? "disabled" : ""}>Approve</button>
                        <button class="action-btn reject-btn" data-action="reject" data-id="${requestId}" ${rejectDisabled ? "disabled" : ""}>Reject</button>
                        <button class="action-btn pay-btn" data-action="pay" data-id="${requestId}" ${payDisabled ? "disabled" : ""}>Pay</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

function renderPaymentsTable() {
    const payable = allRequests.filter(request => {
        const status = normalizeStatus(request.status);
        const payment = normalizeStatus(request.paymentStatus);
        return status === "APPROVED" && payment !== "PAID";
    });

    const paid = allRequests.filter(request => normalizeStatus(request.paymentStatus) === "PAID");
    const rows = payable.concat(paid);

    if (!rows.length) {
        paymentsTableBody.innerHTML = `<tr><td colspan="6" class="empty-row">No payment records found.</td></tr>`;
        return;
    }

    paymentsTableBody.innerHTML = rows.map(request => {
        const payment = normalizeStatus(request.paymentStatus);
        const canPay = normalizeStatus(request.status) === "APPROVED" && payment !== "PAID";
        return `
            <tr>
                <td><strong>#${escapeHtml(request.requestId)}</strong></td>
                <td>${escapeHtml(request.productName)}</td>
                <td>${escapeHtml(getUserName(request))}</td>
                <td>${formatMoney(request.totalPrice)}</td>
                <td>${paymentBadge(payment)}</td>
                <td>
                    <button class="action-btn pay-btn" data-payment-id="${Number(request.requestId)}" ${canPay ? "" : "disabled"}>${canPay ? "Process Payment" : "Paid"}</button>
                </td>
            </tr>
        `;
    }).join("");
}

async function loadProducts() {
    productsTableBody.innerHTML = `<tr><td colspan="7" class="empty-row">Loading products...</td></tr>`;

    try {
        const data = await fetchJson("/api/products");
        const products = Array.isArray(data) ? data : [];

        if (!products.length) {
            productsTableBody.innerHTML = `<tr><td colspan="7" class="empty-row">No products found.</td></tr>`;
            return;
        }

        productsTableBody.innerHTML = products.map(product => `
            <tr>
                <td>${escapeHtml(product.productId)}</td>
                <td><strong>${escapeHtml(product.name)}</strong></td>
                <td>${formatMoney(product.pricePerProduct)}</td>
                <td>${escapeHtml(product.numberOfQuantities)}</td>
                <td>${escapeHtml(getDepartmentName(product))}</td>
                <td>${escapeHtml(getCategoryName(product))}</td>
                <td>${escapeHtml(product.status || "-")}</td>
            </tr>
        `).join("");
    } catch (error) {
        console.error("Admin product loading error:", error);
        productsTableBody.innerHTML = `<tr><td colspan="7" class="empty-row">Unable to load products: ${escapeHtml(error.message)}</td></tr>`;
    }
}

function getDepartmentName(product) {
    if (product && product.department && typeof product.department === "object") {
        return product.department.departmentName || product.department.name || "-";
    }
    return product && product.department ? product.department : "-";
}

function getCategoryName(product) {
    if (product && product.category && typeof product.category === "object") {
        return product.category.categoryName || product.category.name || "-";
    }
    return product && product.category ? product.category : "-";
}

async function updateRequest(requestId, action) {
    const actionName = action === "approve" ? "approve" : "reject";
    const label = action === "approve" ? "approve" : "reject";

    if (!window.confirm(`Are you sure you want to ${label} Request #${requestId}?`)) {
        return;
    }

    try {
        await fetchJson(`/api/admin/requests/${requestId}/${actionName}`, {
            method: "PUT"
        });
        showMessage(`Request #${requestId} ${action === "approve" ? "approved" : "rejected"} successfully.`, "success");
        await loadRequests();
    } catch (error) {
        console.error("Request update error:", error);
        showMessage(error.message, "error");
    }
}

function processPayment(requestId) {
    if (!Number.isInteger(Number(requestId)) || Number(requestId) <= 0) {
        showMessage("Invalid request ID.", "error");
        return;
    }

    // Do not complete the payment here.
    // Open the dedicated dummy payment page first.
    window.location.href =
        `payment.html?requestId=${encodeURIComponent(requestId)}`;
}

requestsTableBody.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button || button.disabled) return;

    const requestId = Number(button.dataset.id);
    const action = button.dataset.action;

    if (!Number.isInteger(requestId) || requestId <= 0) return;

    if (action === "approve" || action === "reject") {
        updateRequest(requestId, action);
    } else if (action === "pay") {
        processPayment(requestId);
    }
});

paymentsTableBody.addEventListener("click", event => {
    const button = event.target.closest("button[data-payment-id]");
    if (!button || button.disabled) return;

    const requestId = Number(button.dataset.paymentId);
    if (!Number.isInteger(requestId) || requestId <= 0) return;

    processPayment(requestId);
});

const refreshRequestsButton = document.getElementById("refreshRequestsButton");
if (refreshRequestsButton) {
    refreshRequestsButton.addEventListener("click", loadRequests);
}

const refreshRatingsButton = document.getElementById("refreshRatingsButton");
if (refreshRatingsButton) {
    refreshRatingsButton.addEventListener("click", loadRatings);
}

const refreshProductsButton = document.getElementById("refreshProductsButton");
if (refreshProductsButton) {
    refreshProductsButton.addEventListener("click", loadProducts);
}
const refreshTrackingButton = document.getElementById("refreshTrackingButton");
if (refreshTrackingButton) {
    refreshTrackingButton.addEventListener("click", loadAdminTracking);
}


// ==========================================
// ADMIN ORDER TRACKING
// ==========================================

function getAdminTrackingStatusClass(status) {
    const normalized = String(status ?? "").toUpperCase();

    if (normalized === "DELIVERED") {
        return "tracking-delivered";
    }

    if (normalized === "OUT_FOR_DELIVERY") {
        return "tracking-out-for-delivery";
    }

    if (normalized === "IN_TRANSIT" ||
        normalized === "ORDER_DISPATCHED") {
        return "tracking-in-progress";
    }

    return "tracking-not-dispatched";
}

function getAdminTrackingStatusText(status) {
    if (!status) {
        return "NOT DISPATCHED";
    }

    return String(status)
        .replaceAll("_", " ")
        .toUpperCase();
}

function formatAdminTrackingDate(value) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

async function loadAdminTracking() {
    const body = document.getElementById("trackingTableBody");

    if (!body) {
        return;
    }

    body.innerHTML =
        '<tr><td colspan="9" class="empty-row">Loading tracking...</td></tr>';

    try {
        const data = await fetchJson("/api/shipping/admin/tracking");
        const rows = Array.isArray(data) ? data : [];

        if (!rows.length) {
            body.innerHTML =
                '<tr><td colspan="9" class="empty-row">No procurement tracking records found.</td></tr>';
            return;
        }

        body.innerHTML = rows.map(row => {
            const status = getAdminTrackingStatusText(row.shippingStatus);
            const statusClass =
                getAdminTrackingStatusClass(row.shippingStatus);

            return `
                <tr>
                    <td><strong>#${escapeHtml(row.requestId)}</strong></td>
                    <td>
                        <strong>${escapeHtml(row.userName)}</strong>
                        <small class="tracking-email">
                            ${escapeHtml(row.userEmail)}
                        </small>
                    </td>
                    <td>${escapeHtml(row.productName)}</td>
                    <td>${escapeHtml(row.quantity)}</td>
                    <td>
                        <span class="tracking-status ${statusClass}">
                            ${escapeHtml(status)}
                        </span>
                    </td>
                    <td>${escapeHtml(row.currentLocation)}</td>
                    <td>${escapeHtml(row.trackingNumber)}</td>
                    <td>
                        <strong>${escapeHtml(row.supplierName)}</strong>
                        <small class="tracking-email">
                            ${escapeHtml(row.supplierEmail)}
                        </small>
                    </td>
                    <td>${escapeHtml(formatAdminTrackingDate(row.lastUpdated))}</td>
                </tr>
            `;
        }).join("");

    } catch (error) {
        console.error("Admin tracking loading error:", error);

        body.innerHTML =
            `<tr><td colspan="9" class="empty-row">Unable to load tracking: ${escapeHtml(error.message)}</td></tr>`;
    }
}

async function loadRatings() {
    const body = document.getElementById("ratingsTableBody");
    if (!body) return;

    body.innerHTML = '<tr><td colspan="5" class="empty-row">Loading ratings...</td></tr>';

    try {
        const ratings = await fetchJson("/api/requests/api-ratings");
        const list = Array.isArray(ratings) ? ratings : [];

        if (!list.length) {
            body.innerHTML = '<tr><td colspan="5" class="empty-row">No ratings have been submitted yet.</td></tr>';
            return;
        }

        body.innerHTML = list.map(rating => {
            const value = Math.max(0, Math.min(5, Number(rating.rating) || 0));
            return `
                <tr>
                    <td><strong>${escapeHtml(rating.productName)}</strong></td>
                    <td>${escapeHtml(rating.userName)}</td>
                    <td><span class="ratings-stars">${"★".repeat(value)}${"☆".repeat(5 - value)}</span></td>
                    <td>${escapeHtml(rating.feedback || "No written review.")}</td>
                    <td>${escapeHtml(rating.createdDate || "-")}</td>
                </tr>
            `;
        }).join("");
    } catch (error) {
        console.error("Admin ratings error:", error);
        body.innerHTML = '<tr><td colspan="5" class="empty-row">Unable to load ratings.</td></tr>';
    }
}

// ==========================================
// REPORT SUMMARY
// ==========================================

function updateReport() {
    const reportTotal = document.getElementById("reportTotal");
    const reportApproved = document.getElementById("reportApproved");
    const reportRejected = document.getElementById("reportRejected");
    const reportPaid = document.getElementById("reportPaid");

    if (!reportTotal || !reportApproved || !reportRejected || !reportPaid) {
        return;
    }

    const approved = allRequests.filter(
        request => normalizeStatus(request.status) === "APPROVED"
    ).length;

    const rejected = allRequests.filter(
        request => normalizeStatus(request.status) === "REJECTED"
    ).length;

    const paid = allRequests.filter(
        request => normalizeStatus(request.paymentStatus) === "PAID"
    ).length;

    reportTotal.textContent = allRequests.length;
    reportApproved.textContent = approved;
    reportRejected.textContent = rejected;
    reportPaid.textContent = paid;
}

// ==========================================
// DOWNLOAD CSV REPORT
// ==========================================

async function downloadReport() {
    // Refresh data before creating the report so the CSV always contains
    // the latest approvals, rejections and payments.
    await loadRequests();

    if (!allRequests.length) {
        showMessage("There are no procurement records to download.", "error");
        return;
    }

    const rows = [
        [
            "Request ID",
            "User",
            "Product",
            "Quantity",
            "Total Amount",
            "Request Status",
            "Payment Status"
        ]
    ];

    allRequests.forEach(request => {
        rows.push([
            request.requestId ?? "",
            getUserName(request),
            request.productName ?? "",
            request.numberOfQuantities ?? "",
            request.totalPrice ?? "",
            normalizeStatus(request.status),
            normalizeStatus(request.paymentStatus)
        ]);
    });

    const csv = rows.map(row =>
        row.map(value => {
            const text = String(value ?? "");
            return `"${text.replaceAll('"', '""')}"`;
        }).join(",")
    ).join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
        "procureflow-admin-report-" +
        new Date().toISOString().slice(0, 10) +
        ".csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showMessage("Admin report downloaded successfully.", "success");
}

if (downloadReportButton) {
    downloadReportButton.addEventListener("click", downloadReport);
}

displayAdmin();
loadRequests();
