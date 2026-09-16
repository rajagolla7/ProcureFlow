const API_BASE_URL = "";

const storedUser = sessionStorage.getItem("loggedInUser");
const storedRole = sessionStorage.getItem("userRole");
const storedEmail = sessionStorage.getItem("userEmail");

if (!storedUser || !storedRole || storedRole.toUpperCase() !== "SUPPLIER" || !storedEmail) {
    window.location.href = "login.html";
}

let supplierEmail = storedEmail || "";
let dashboardData = null;
let selectedRequestId = null;

const $ = id => document.getElementById(id);

function escapeHtml(value) {
    return String(value ?? "-")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatMoney(value) {
    const amount = Number(value || 0);
    return "₹" + amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString("en-IN");
}

function setMessage(text, type = "") {
    const box = $("message");
    box.textContent = text || "";
    box.className = "message" + (type ? " " + type : "");
}

function statusLabel(status) {
    if (status === "NEW_ORDER") return "NEW ORDER";
    return String(status || "-").replaceAll("_", " ");
}

function statusClass(status) {
    if (status === "DELIVERED") return "status-delivered";
    if (status === "NEW_ORDER" || status === "ORDER_RECEIVED") return "status-new";
    return "status-shipping";
}

function nextStatusOptions(status) {
    if (!status || status === "NEW_ORDER" || status === "ORDER_RECEIVED") {
        return ["IN_TRANSIT"];
    }
    if (status === "ORDER_DISPATCHED") return ["IN_TRANSIT"];
    if (status === "IN_TRANSIT") return ["OUT_FOR_DELIVERY"];
    if (status === "OUT_FOR_DELIVERY") return ["DELIVERED"];
    return [];
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    const text = await response.text();
    let data = null;
    if (text) {
        try { data = JSON.parse(text); }
        catch { data = text; }
    }
    if (!response.ok) {
        const message = typeof data === "string" ? data : (data?.message || "Request failed.");
        throw new Error(message);
    }
    return data;
}

async function loadDashboard() {
    try {
        dashboardData = await fetchJson(
            API_BASE_URL + "/api/supplier/dashboard?email=" + encodeURIComponent(supplierEmail)
        );

        $("welcomeName").textContent = dashboardData.supplierName || "Supplier";
        $("assignedProduct").textContent = dashboardData.assignedProduct || "No product assigned";
        $("availableStock").textContent = dashboardData.availableStock ?? 0;
        $("inventoryProductName").textContent = dashboardData.assignedProduct || "Assigned Product";
        $("inventoryCurrentStock").textContent = dashboardData.availableStock ?? 0;
        $("inventoryQuantity").value = dashboardData.availableStock ?? 0;
        $("totalOrders").textContent = dashboardData.totalOrders ?? 0;
        $("newOrders").textContent = dashboardData.newOrders ?? 0;
        $("inTransit").textContent = dashboardData.inTransit ?? 0;
        $("dispatched").textContent = dashboardData.dispatched ?? 0;
        $("outForDelivery").textContent = dashboardData.outForDelivery ?? 0;
        $("delivered").textContent = dashboardData.delivered ?? 0;
        $("deliveredProgress").textContent = dashboardData.delivered ?? 0;

        renderRecentOrders(dashboardData.orders || []);
        renderOrdersTable(dashboardData.orders || []);
        renderShippingTable(dashboardData.orders || []);
    } catch (error) {
        console.error("Supplier dashboard error:", error);
        setMessage(error.message || "Unable to load supplier dashboard.", "error");
        ["totalOrders", "newOrders", "inTransit", "dispatched", "outForDelivery", "delivered", "deliveredProgress"].forEach(id => {
            if ($(id)) $(id).textContent = "0";
        });
        $("recentOrders").innerHTML = '<div class="empty-state">Unable to load orders.</div>';
        $("ordersTableBody").innerHTML = '<tr><td colspan="8" class="empty-row">Unable to load orders.</td></tr>';
        $("shippingTableBody").innerHTML = '<tr><td colspan="7" class="empty-row">Unable to load shipments.</td></tr>';
    }
}

function renderRecentOrders(orders) {
    const recent = orders.slice(0, 5);
    if (!recent.length) {
        $("recentOrders").innerHTML = '<div class="empty-state">No paid orders assigned yet.</div>';
        return;
    }

    $("recentOrders").innerHTML = recent.map(order => `
        <div class="order-mini">
            <div><strong>Request #${escapeHtml(order.requestId)}</strong><span>${escapeHtml(order.productName)} · Qty ${escapeHtml(order.quantity)}</span></div>
            <div><strong>${formatMoney(order.totalPrice)}</strong><span class="status-pill ${statusClass(order.shippingStatus)}">${escapeHtml(statusLabel(order.shippingStatus))}</span></div>
        </div>
    `).join("");
}

function renderOrdersTable(orders) {
    const body = $("ordersTableBody");
    if (!orders.length) {
        body.innerHTML = '<tr><td colspan="8" class="empty-row">No paid orders are assigned to this supplier.</td></tr>';
        return;
    }

    body.innerHTML = orders.map(order => {
        const status = order.shippingStatus;
        let action = "";

        if (status === "NEW_ORDER") {
            action = `<button class="action-button" data-action="dispatch" data-id="${escapeHtml(order.requestId)}">Accept &amp; Dispatch</button>`;
        } else if (status === "ORDER_DISPATCHED" || status === "IN_TRANSIT" || status === "OUT_FOR_DELIVERY") {
            action = `<button class="action-button" data-action="update" data-id="${escapeHtml(order.requestId)}">Update Shipping</button>`;
        } else {
            action = `<span class="status-pill status-delivered">Completed</span>`;
        }

        return `
            <tr>
                <td><strong>#${escapeHtml(order.requestId)}</strong></td>
                <td>${escapeHtml(order.userName)}</td>
                <td>${escapeHtml(order.productName)}</td>
                <td>${escapeHtml(order.quantity)}</td>
                <td>${formatMoney(order.totalPrice)}</td>
                <td><span class="status-pill status-delivered">PAID</span></td>
                <td><span class="status-pill ${statusClass(status)}">${escapeHtml(statusLabel(status))}</span></td>
                <td>${action}</td>
            </tr>
        `;
    }).join("");
}

function renderShippingTable(orders) {
    const body = $("shippingTableBody");
    const shippable = orders.filter(order => order.shippingStatus !== "NEW_ORDER");

    if (!shippable.length) {
        body.innerHTML = '<tr><td colspan="7" class="empty-row">No shipments have been dispatched yet.</td></tr>';
        return;
    }

    body.innerHTML = shippable.map(order => {
        const status = order.shippingStatus;
        const action = status === "DELIVERED"
            ? '<span class="status-pill status-delivered">Delivered</span>'
            : `<button class="action-button" data-action="update" data-id="${escapeHtml(order.requestId)}">Update</button>`;

        return `
            <tr>
                <td><strong>#${escapeHtml(order.requestId)}</strong></td>
                <td>${escapeHtml(order.productName)}</td>
                <td><span class="status-pill ${statusClass(status)}">${escapeHtml(statusLabel(status))}</span></td>
                <td>${escapeHtml(order.currentLocation)}</td>
                <td>${escapeHtml(order.trackingNumber)}</td>
                <td>${escapeHtml(formatDate(order.lastUpdated))}</td>
                <td>${action}</td>
            </tr>
        `;
    }).join("");
}

async function dispatchOrder(requestId) {
    try {
        setMessage("Dispatching order #" + requestId + "...", "");
        await fetchJson(
            API_BASE_URL + "/api/supplier/requests/" + encodeURIComponent(requestId) + "/ship?supplierEmail=" + encodeURIComponent(supplierEmail),
            { method: "PUT" }
        );
        setMessage("Order #" + requestId + " accepted and dispatched.", "success");
        await loadDashboard();
    } catch (error) {
        console.error("Dispatch error:", error);
        setMessage(error.message || "Unable to dispatch order.", "error");
    }
}

function openShippingModal(requestId) {
    const order = (dashboardData?.orders || []).find(item => String(item.requestId) === String(requestId));
    if (!order) return;

    const options = nextStatusOptions(order.shippingStatus);
    if (!options.length) {
        setMessage("This shipment is already completed.", "");
        return;
    }

    selectedRequestId = requestId;
    $("modalTitle").textContent = "Update Request #" + requestId;
    $("modalDescription").textContent = "Current status: " + statusLabel(order.shippingStatus);
    $("shippingStatus").innerHTML = options.map(status => `<option value="${status}">${statusLabel(status)}</option>`).join("");
    $("shippingLocation").value = order.currentLocation && order.currentLocation !== "Awaiting supplier processing" ? order.currentLocation : "";
    $("shippingModal").classList.remove("hidden");
}

function closeShippingModal() {
    selectedRequestId = null;
    $("shippingModal").classList.add("hidden");
}

async function saveShippingUpdate() {

    // -----------------------------------------
    // Check selected request
    // -----------------------------------------
    if (!selectedRequestId) {
        return;
    }

    const status = $("shippingStatus").value;
    const location = $("shippingLocation").value.trim();

    // -----------------------------------------
    // Validate location
    // -----------------------------------------
    if (!location) {
        setMessage(
            "Please enter the current shipment location.",
            "error"
        );
        $("shippingLocation").focus();
        return;
    }

    const saveButton = $("saveShippingButton");

    try {

        // -----------------------------------------
        // Show saving state
        // -----------------------------------------
        saveButton.disabled = true;
        saveButton.textContent = "Saving...";

        // -----------------------------------------
        // Call Spring Boot backend
        // -----------------------------------------
        await fetchJson(
            API_BASE_URL +
            "/api/supplier/requests/" +
            encodeURIComponent(selectedRequestId) +
            "/shipping?status=" +
            encodeURIComponent(status) +
            "&location=" +
            encodeURIComponent(location) +
            "&supplierEmail=" +
            encodeURIComponent(supplierEmail),
            {
                method: "PUT"
            }
        );

        // -----------------------------------------
        // Close modal
        // -----------------------------------------
        closeShippingModal();

        // -----------------------------------------
        // Show success message
        // -----------------------------------------
        setMessage(
            "Shipping status updated successfully.",
            "success"
        );

        // -----------------------------------------
        // Reload dashboard data
        // -----------------------------------------
        await loadDashboard();

    } catch (error) {

        console.error(
            "Shipping update error:",
            error
        );

        setMessage(
            error.message ||
            "Unable to update shipping.",
            "error"
        );

    } finally {

        // -----------------------------------------
        // Restore button
        // -----------------------------------------
        saveButton.disabled = false;
        saveButton.textContent = "Save Shipping Update";
    }
}
async function loadProfile() {
    try {
        const profile = await fetchJson(API_BASE_URL + "/api/supplier/profile?email=" + encodeURIComponent(supplierEmail));
        const name = profile.name || "Supplier";
        $("profileName").textContent = name;
        $("profileAvatar").textContent = name.charAt(0).toUpperCase();
        $("profileEmail").textContent = profile.email || "-";
        $("profilePhone").textContent = profile.phone || "-";
        $("profileAddress").textContent = profile.address || "-";
        $("profileGst").textContent = profile.gstNumber || "-";
        $("profileStatus").textContent = profile.status || "-";
        $("profileProduct").textContent = profile.assignedProduct?.name || "No product assigned";
        $("profileStock").textContent = (profile.assignedProduct?.availableStock ?? 0) + " pieces";
        $("userName").textContent = name;
        $("userAvatar").textContent = name.charAt(0).toUpperCase();
    } catch (error) {
        console.error("Profile error:", error);
        setMessage(error.message || "Unable to load supplier profile.", "error");
    }
}

async function loadRatings() {
    const body = $("ratingsTableBody");
    if (!body) return;

    body.innerHTML = '<tr><td colspan="5" class="empty-row">Loading ratings...</td></tr>';

    try {
        const ratings = await fetchJson(API_BASE_URL + "/api/supplier/ratings?email=" + encodeURIComponent(supplierEmail));
        const list = Array.isArray(ratings) ? ratings : [];

        if (!list.length) {
            body.innerHTML = '<tr><td colspan="5" class="empty-row">No ratings have been submitted yet.</td></tr>';
            return;
        }

        body.innerHTML = list.map(rating => `
            <tr>
                <td><strong>${escapeHtml(rating.productName)}</strong></td>
                <td>${escapeHtml(rating.userName)}</td>
                <td><span class="ratings-stars">${"★".repeat(Number(rating.rating) || 0)}${"☆".repeat(5 - (Number(rating.rating) || 0))}</span></td>
                <td>${escapeHtml(rating.feedback || "No written review.")}</td>
                <td>${escapeHtml(formatDate(rating.createdDate))}</td>
            </tr>
        `).join("");
    } catch (error) {
        console.error("Ratings error:", error);
        body.innerHTML = '<tr><td colspan="5" class="empty-row">Unable to load ratings.</td></tr>';
    }
}

async function updateInventory() {
    const input = $("inventoryQuantity");
    const quantity = Number(input.value);

    if (!Number.isInteger(quantity) || quantity < 0) {
        $("inventoryMessage").textContent = "Enter a valid stock quantity.";
        return;
    }

    try {
        $("saveInventoryButton").disabled = true;
        $("inventoryMessage").textContent = "Updating inventory...";

        const result = await fetchJson(
            API_BASE_URL + "/api/supplier/inventory?email=" +
            encodeURIComponent(supplierEmail) +
            "&quantity=" + encodeURIComponent(quantity),
            { method: "PUT" }
        );

        const stock = result.availableStock ?? quantity;
        $("availableStock").textContent = stock;
        $("inventoryCurrentStock").textContent = stock;
        $("inventoryQuantity").value = stock;
        $("inventoryMessage").textContent = "Inventory updated successfully.";
        setMessage("Inventory updated. Users can now see the new stock.", "success");
    } catch (error) {
        console.error("Inventory update error:", error);
        $("inventoryMessage").textContent = error.message || "Unable to update inventory.";
    } finally {
        $("saveInventoryButton").disabled = false;
    }
}

function showSection(section) {
    document.querySelectorAll(".content-section").forEach(item => item.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));

    const target = $(section + "Section");
    if (target) target.classList.add("active");

    const nav = document.querySelector(`.nav-item[data-section="${section}"]`);
    if (nav) nav.classList.add("active");

    const titles = { dashboard: "Dashboard", orders: "Orders", shipping: "Shipping", inventory: "Inventory", ratings: "Ratings", profile: "Profile" };
    $("pageTitle").textContent = titles[section] || "Dashboard";

    if (section === "profile") loadProfile();
    if (section === "inventory") loadDashboard();
    if (section === "ratings") loadRatings();
    if (window.innerWidth <= 760) $("sidebar").classList.remove("open");
}

document.querySelectorAll("[data-section]").forEach(button => {
    button.addEventListener("click", () => showSection(button.dataset.section));
});

document.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const requestId = button.dataset.id;
    if (button.dataset.action === "dispatch") dispatchOrder(requestId);
    if (button.dataset.action === "update") openShippingModal(requestId);
});

$("refreshDashboardButton").addEventListener("click", loadDashboard);
$("refreshOrdersButton").addEventListener("click", loadDashboard);
$("refreshShippingButton").addEventListener("click", loadDashboard);
$("closeModalButton").addEventListener("click", closeShippingModal);
$("saveShippingButton").addEventListener("click", saveShippingUpdate);
$("saveInventoryButton").addEventListener("click", updateInventory);
$("refreshRatingsButton").addEventListener("click", loadRatings);
$("shippingModal").addEventListener("click", event => {
    if (event.target === $("shippingModal")) closeShippingModal();
});
$("menuButton").addEventListener("click", () => $("sidebar").classList.toggle("open"));

$("logoutButton").addEventListener("click", () => {
    sessionStorage.removeItem("loggedInUser");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("userRole");
    window.location.href = "login.html";
});

loadProfile();
loadDashboard();
