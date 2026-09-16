// ==========================================
// USER DASHBOARD
// PROCUREMENT MANAGEMENT SYSTEM
// ==========================================


// ==========================================
// BACKEND URL
// ==========================================

const API_BASE_URL = "";


// ==========================================
// GET STORED LOGIN DATA
// ==========================================

const storedUser =
    sessionStorage.getItem("loggedInUser");

const storedRole =
    sessionStorage.getItem("userRole");


// ==========================================
// CHECK LOGIN
// ==========================================

if (!storedUser || !storedRole) {

    window.location.href =
        "login.html";

}


// ==========================================
// GET CURRENT USER
// ==========================================

let currentUser = null;

try {

    currentUser =
        JSON.parse(storedUser);

} catch (error) {

    console.error(
        "Unable to read logged-in user:",
        error
    );

    sessionStorage.clear();

    window.location.href =
        "login.html";

}


// ==========================================
// ROLE SECURITY
// ==========================================

if (
    currentUser &&
    currentUser.role &&
    String(currentUser.role).toUpperCase() !== "USER"
) {

    window.location.href =
        "role-selection.html";

}


// ==========================================
// ELEMENTS
// ==========================================

const userName =
    document.getElementById("userName");

const welcomeName =
    document.getElementById("welcomeName");

const userAvatar =
    document.getElementById("userAvatar");

const pageTitle =
    document.getElementById("pageTitle");

const sidebar =
    document.getElementById("sidebar");

const menuButton =
    document.getElementById("menuButton");

const logoutButton =
    document.getElementById("logoutButton");

const totalRequests =
    document.getElementById("totalRequests");

const pendingRequests =
    document.getElementById("pendingRequests");

const approvedRequests =
    document.getElementById("approvedRequests");

const totalOrders =
    document.getElementById("totalOrders");

const recentRequests =
    document.getElementById("recentRequests");

const productTableBody =
	document.getElementById("productTableBody");

const allRequests =
    document.getElementById("allRequests");


// ==========================================
// DISPLAY USER INFORMATION
// ==========================================

if (currentUser) {

    const name =
        currentUser.name ||
        currentUser.fullName ||
        "User";


    if (userName) {

        userName.textContent =
            name;

    }


    if (welcomeName) {

        welcomeName.textContent =
            name.split(" ")[0];

    }


    if (userAvatar) {

        userAvatar.textContent =
            name
                .charAt(0)
                .toUpperCase();

    }

}


// ==========================================
// NAVIGATION ELEMENTS
// ==========================================

const navItems =
    document.querySelectorAll(
        ".nav-item"
    );

const actionButtons =
    document.querySelectorAll(
        "[data-section]"
    );


// ==========================================
// SECTION TITLES
// ==========================================

const sectionTitles = {

    dashboard:
        "Dashboard",

    "new-request":
        "New Request",

    requests:
        "My Requests",

    products:
        "Products",

    tracking:
        "Tracking",

    downloads:
        "Downloads",

    profile:
        "Profile",

    ratings:
        "Ratings"

};

// ==========================================
// PRODUCT CATALOG STATE
// ==========================================

let productsLoaded = false;

let productsLoading = false;


// ==========================================
// SHOW SECTION
// ==========================================

function showSection(sectionName) {

    const sections =
        document.querySelectorAll(
            ".content-section"
        );


    // --------------------------------------
    // Hide all sections
    // --------------------------------------

    sections.forEach(
        function (section) {

            section.classList.remove(
                "active"
            );

        }
    );


    // --------------------------------------
    // Show selected section
    // --------------------------------------

    const selectedSection =
        document.getElementById(
            sectionName + "Section"
        );


    if (selectedSection) {

        selectedSection.classList.add(
            "active"
        );

    }


    // --------------------------------------
    // Update sidebar active item
    // --------------------------------------

    navItems.forEach(
        function (item) {

            item.classList.remove(
                "active"
            );


            if (
                item.dataset.section ===
                sectionName
            ) {

                item.classList.add(
                    "active"
                );

            }

        }
    );


    // --------------------------------------
    // Update page title
    // --------------------------------------

    if (pageTitle) {

        pageTitle.textContent =
            sectionTitles[sectionName] ||
            "Dashboard";

    }
	// --------------------------------------
	// Load Products when opened
	// --------------------------------------

	if (sectionName === "products") {

	    loadProducts();

	}

	// --------------------------------------
	// Load Tracking when opened
	// --------------------------------------

	if (sectionName === "tracking") {

	    loadTracking();

	}

    // --------------------------------------
    // Load My Requests when opened
    // --------------------------------------

    if (
        sectionName ===
        "requests"
    ) {

        renderAllRequests(
            userRequests
        );

    }


    // --------------------------------------
    // Close mobile sidebar
    // --------------------------------------

    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }


    // --------------------------------------
    // Scroll to top
    // --------------------------------------

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ==========================================
// SIDEBAR NAVIGATION
// ==========================================

navItems.forEach(
    function (item) {

        item.addEventListener(
            "click",
            function () {

                const section =
                    item.dataset.section;


                // New Request has
                // separate HTML page

                if (
                    section ===
                    "new-request"
                ) {

                    window.location.href =
                        "new-request.html";

                    return;

                }


                showSection(
                    section
                );

            }
        );

    }
);


// ==========================================
// QUICK ACTION BUTTONS
// ==========================================

actionButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const section =
                    button.dataset.section;


                if (!section) {

                    return;

                }


                if (
                    section ===
                    "new-request"
                ) {

                    window.location.href =
                        "new-request.html";

                    return;

                }


                showSection(
                    section
                );

            }
        );

    }
);


// ==========================================
// MOBILE MENU
// ==========================================

if (menuButton) {

    menuButton.addEventListener(
        "click",
        function () {

            if (sidebar) {

                sidebar.classList.toggle(
                    "open"
                );

            }

        }
    );

}


// ==========================================
// LOGOUT
// ==========================================

if (logoutButton) {

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

}


// ==========================================
// USER REQUEST STORAGE
// ==========================================

let userRequests = [];


// ==========================================
// SAFE VALUE HELPER
// ==========================================

function getValue(
    object,
    keys,
    defaultValue = ""
) {

    if (!object) {

        return defaultValue;

    }


    for (
        let i = 0;
        i < keys.length;
        i++
    ) {

        const key =
            keys[i];


        if (
            object[key] !== undefined &&
            object[key] !== null
        ) {

            return object[key];

        }

    }


    return defaultValue;

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatRequestDate(value) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ==========================================
// STATUS TEXT
// ==========================================

function getStatusText(status) {

    if (!status) {

        return "PENDING";

    }


    return String(status)
        .replaceAll("_", " ")
        .toUpperCase();

}


// ==========================================
// STATUS CLASS
// ==========================================

function getStatusClass(status) {

    const normalized =
        String(status || "PENDING")
            .toLowerCase();


    if (
        normalized.includes("approved")
    ) {

        return "approved";

    }


    if (
        normalized.includes("pending")
    ) {

        return "pending";

    }


    if (
        normalized.includes("reject")
    ) {

        return "rejected";

    }


    if (
        normalized.includes("deliver")
    ) {

        return "delivered";

    }


    if (
        normalized.includes("ship")
    ) {

        return "shipped";

    }


    return "pending";

}


// ==========================================
// GET PRODUCT NAME
// ==========================================

function getProductName(request) {

    if (!request) {

        return "Unknown Product";

    }


    if (
        request.productName
    ) {

        return request.productName;

    }


    if (
        request.product &&
        typeof request.product === "object" &&
        request.product.name
    ) {

        return request.product.name;

    }


    if (
        request.product &&
        typeof request.product === "string"
    ) {

        return request.product;

    }


    return "Unknown Product";

}


// ==========================================
// NORMALIZE BACKEND RESPONSE
// ==========================================

function normalizeRequests(data) {

    if (Array.isArray(data)) {

        return data;

    }


    if (
        data &&
        Array.isArray(data.content)
    ) {

        return data.content;

    }


    if (
        data &&
        Array.isArray(data.requests)
    ) {

        return data.requests;

    }


    if (
        data &&
        Array.isArray(data.data)
    ) {

        return data.data;

    }


    if (
        data &&
        typeof data === "object"
    ) {

        return [data];

    }


    return [];

}


// ==========================================
// LOAD USER REQUESTS
// ==========================================

async function loadUserRequests() {

    if (
        !currentUser ||
        !currentUser.userId
    ) {

        console.error(
            "User ID is missing."
        );

        showRequestLoadError();

        return;

    }


    try {

        const response =
            await fetch(
                API_BASE_URL +
                "/api/requests/user/" +
                currentUser.userId,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const responseText =
            await response.text();


        if (!response.ok) {

            throw new Error(
                responseText ||
                "Unable to load your requests."
            );

        }


        let data = [];


        if (responseText) {

            try {

                data =
                    JSON.parse(
                        responseText
                    );

            } catch (error) {

                console.error(
                    "Invalid JSON returned by backend:",
                    error
                );

                throw new Error(
                    "The server returned invalid JSON."
                );

            }

        }


        userRequests =
            normalizeRequests(
                data
            );


        // ----------------------------------
        // Update dashboard
        // ----------------------------------

        updateDashboard(
            userRequests
        );


        // ----------------------------------
        // Update My Requests page
        // ----------------------------------

        renderAllRequests(
            userRequests
        );


    } catch (error) {

        console.error(
            "Dashboard request loading error:",
            error
        );


        userRequests = [];


        // Dashboard fallback

        if (totalRequests) {

            totalRequests.textContent =
                "0";

        }


        if (pendingRequests) {

            pendingRequests.textContent =
                "0";

        }


        if (approvedRequests) {

            approvedRequests.textContent =
                "0";

        }


        if (totalOrders) {

            totalOrders.textContent =
                "0";

        }


        showRecentRequestError();

        showRequestLoadError();

    }

}
// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

    if (!productTableBody) {
        return;
    }

    productTableBody.innerHTML = `
        <tr>
            <td colspan="7" class="empty-row">
                Loading products...
            </td>
        </tr>
    `;

    try {

        const response =
            await fetch(
                "/api/products",
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

        const responseText =
            await response.text();

        if (!response.ok) {

            throw new Error(
                responseText ||
                "Unable to load products."
            );

        }

        let data = [];

        if (responseText) {

            try {

                data =
                    JSON.parse(
                        responseText
                    );

            } catch (error) {

                console.error(
                    "Invalid product response:",
                    error
                );

                throw new Error(
                    "The server returned invalid product data."
                );
            }
        }

        const products =
            Array.isArray(data)
                ? data
                : [];

        renderProducts(products);

    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );

        productTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-row">
                    Unable to load products
                </td>
            </tr>
        `;
    }
}


// ==========================================
// GET DEPARTMENT NAME
// ==========================================

function getDepartmentName(product) {

    if (
        product &&
        product.department &&
        typeof product.department === "object"
    ) {

        return (
            product.department.departmentName ||
            "-"
        );
    }

    return "-";
}


// ==========================================
// GET CATEGORY NAME
// ==========================================

function getCategoryName(product) {

    if (
        product &&
        product.category &&
        typeof product.category === "object"
    ) {

        return (
            product.category.categoryName ||
            "-"
        );
    }

    return "-";
}


// ==========================================
// GET PRODUCT STATUS
// ==========================================

function getProductStatus(product) {

    if (!product || !product.status) {

        return "UNKNOWN";
    }

    return String(product.status)
        .replaceAll("_", " ")
        .toUpperCase();
}


// ==========================================
// PRODUCT STATUS CLASS
// ==========================================

function getProductStatusClass(status) {

    const normalized =
        String(status || "")
            .toLowerCase();

    if (
        normalized === "active"
    ) {

        return "approved";
    }

    if (
        normalized.includes("pending")
    ) {

        return "pending";
    }

    if (
        normalized === "closed"
    ) {

        return "rejected";
    }

    return "pending";
}


// ==========================================
// RENDER PRODUCTS
// ==========================================

function renderProducts(products) {

    if (!productTableBody) {
        return;
    }

    if (!products.length) {

        productTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-row">
                    No products available
                </td>
            </tr>
        `;

        return;
    }


    productTableBody.innerHTML =
        products
            .map(function (product) {

                const productId =
                    product.productId ??
                    product.id ??
                    "-";

                const productName =
                    product.name ??
                    "-";

                const price =
                    Number(
                        product.pricePerProduct ?? 0
                    );

                const quantity =
                    product.numberOfQuantities ??
                    0;

                const department =
                    getDepartmentName(
                        product
                    );

                const category =
                    getCategoryName(
                        product
                    );

                const status =
                    getProductStatus(
                        product
                    );

                const statusClass =
                    getProductStatusClass(
                        status
                    );


                return `
                    <tr>

                        <td>
                            ${escapeHtml(productId)}
                        </td>

                        <td>
                            <strong>
                                ${escapeHtml(productName)}
                            </strong>
                        </td>

                        <td>
                            ₹${price.toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }
                            )}
                        </td>

                        <td>
                            ${escapeHtml(quantity)}
                        </td>

                        <td>
                            ${escapeHtml(department)}
                        </td>

                        <td>
                            ${escapeHtml(category)}
                        </td>

                        <td>
                            <span
                                class="status-badge ${statusClass}">
                                ${escapeHtml(status)}
                            </span>
                        </td>

                    </tr>
                `;

            })
            .join("");
}


// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboard(requests) {

    // --------------------------------------
    // TOTAL REQUESTS
    // --------------------------------------

    if (totalRequests) {

        totalRequests.textContent =
            requests.length;

    }


    // --------------------------------------
    // PENDING REQUESTS
    // --------------------------------------

    const pendingCount =
        requests.filter(
            function (request) {

                const status =
                    String(
                        getValue(
                            request,
                            ["status"],
                            "PENDING"
                        )
                    ).toUpperCase();


                return status ===
                    "PENDING";

            }
        ).length;


    if (pendingRequests) {

        pendingRequests.textContent =
            pendingCount;

    }


    // --------------------------------------
    // APPROVED REQUESTS
    // --------------------------------------

    const approvedCount =
        requests.filter(
            function (request) {

                const status =
                    String(
                        getValue(
                            request,
                            ["status"],
                            ""
                        )
                    ).toUpperCase();


                return status ===
                    "APPROVED";

            }
        ).length;


    if (approvedRequests) {

        approvedRequests.textContent =
            approvedCount;

    }


    // --------------------------------------
    // ORDERS
    // --------------------------------------

    const orderCount =
        requests.filter(
            function (request) {

                return Boolean(
                    request.orderId ||
                    request.orderID ||
                    request.order
                );

            }
        ).length;


    if (totalOrders) {

        totalOrders.textContent =
            orderCount;

    }


    // --------------------------------------
    // RECENT REQUESTS
    // --------------------------------------

    renderRecentRequests(
        requests
    );

}


// ==========================================
// RENDER RECENT REQUESTS
// ==========================================

function renderRecentRequests(
    requests
) {

    if (!recentRequests) {

        return;

    }


    if (!requests.length) {

        recentRequests.innerHTML = `
            <tr>
                <td
                    colspan="3"
                    class="empty-row">
                    No requests yet
                </td>
            </tr>
        `;

        return;

    }


    const sortedRequests =
        sortRequests(
            requests
        );


    const recent =
        sortedRequests.slice(
            0,
            5
        );


    recentRequests.innerHTML =
        recent
            .map(
                function (request) {

                    const requestId =
                        getValue(
                            request,
                            [
                                "requestId",
                                "id"
                            ],
                            "-"
                        );


                    const productName =
                        getProductName(
                            request
                        );


                    const date =
                        getValue(
                            request,
                            [
                                "createdDate",
                                "createdAt",
                                "requestDate",
                                "date"
                            ],
                            ""
                        );


                    const status =
                        getStatusText(
                            getValue(
                                request,
                                ["status"],
                                "PENDING"
                            )
                        );


                    const statusClass =
                        getStatusClass(
                            status
                        );


                    return `
                        <tr>

                            <td>
                                <strong>
                                    Request #${escapeHtml(requestId)}
                                </strong>

                                <span class="request-product">
                                    ${escapeHtml(productName)}
                                </span>
                            </td>

                            <td>
                                ${escapeHtml(
                                    formatRequestDate(date)
                                )}
                            </td>

                            <td>
                                <span class="status-badge ${statusClass}">
                                    ${escapeHtml(status)}
                                </span>
                            </td>

                        </tr>
                    `;

                }
            )
            .join("");

}


// ==========================================
// RENDER ALL REQUESTS
// ==========================================

function renderAllRequests(
    requests
) {

    if (!allRequests) {

        return;

    }


    if (!requests.length) {

        allRequests.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="empty-row">

                    No requests found.

                </td>
            </tr>
        `;

        return;

    }


    const sortedRequests =
        sortRequests(
            requests
        );


    allRequests.innerHTML =
        sortedRequests
            .map(
                function (request) {

                    const requestId =
                        getValue(
                            request,
                            [
                                "requestId",
                                "id"
                            ],
                            "-"
                        );


                    const productName =
                        getProductName(
                            request
                        );


                    const quantity =
                        getValue(
                            request,
                            [
                                "numberOfQuantities",
                                "quantity"
                            ],
                            0
                        );


                    const totalPrice =
                        getValue(
                            request,
                            [
                                "totalPrice"
                            ],
                            null
                        );


                    const price =
                        getValue(
                            request,
                            [
                                "pricePerProduct",
                                "price"
                            ],
                            0
                        );


                    const calculatedTotal =
                        Number(quantity) *
                        Number(price);


                    const finalTotal =
                        totalPrice !== null
                            ? Number(totalPrice)
                            : calculatedTotal;


                    const date =
                        getValue(
                            request,
                            [
                                "createdDate",
                                "createdAt",
                                "requestDate",
                                "date"
                            ],
                            ""
                        );


                    const status =
                        getStatusText(
                            getValue(
                                request,
                                ["status"],
                                "PENDING"
                            )
                        );


                    const statusClass =
                        getStatusClass(
                            status
                        );


                    return `
                        <tr>

                            <td>
                                <strong>
                                    Request #${escapeHtml(requestId)}
                                </strong>
                            </td>

                            <td>
                                ${escapeHtml(productName)}
                            </td>

                            <td>
                                ${escapeHtml(quantity)}
                            </td>

                            <td>
                                ₹${Number(
                                    finalTotal || 0
                                ).toFixed(2)}
                            </td>

                            <td>
                                ${escapeHtml(
                                    formatRequestDate(date)
                                )}
                            </td>

                            <td>
                                <span
                                    class="status-badge ${statusClass}">

                                    ${escapeHtml(status)}

                                </span>
                            </td>

                        </tr>
                    `;

                }
            )
            .join("");

}


// ==========================================
// SORT REQUESTS
// ==========================================

function sortRequests(
    requests
) {

    return [...requests].sort(
        function (a, b) {

            const dateA =
                new Date(
                    getValue(
                        a,
                        [
                            "createdDate",
                            "createdAt",
                            "requestDate",
                            "date"
                        ],
                        0
                    )
                ).getTime();


            const dateB =
                new Date(
                    getValue(
                        b,
                        [
                            "createdDate",
                            "createdAt",
                            "requestDate",
                            "date"
                        ],
                        0
                    )
                ).getTime();


            return dateB - dateA;

        }
    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


// ==========================================
// SHOW RECENT REQUEST ERROR
// ==========================================

function showRecentRequestError() {

    if (!recentRequests) {

        return;

    }


    recentRequests.innerHTML = `
        <tr>
            <td
                colspan="3"
                class="empty-row">

                Unable to load requests.

            </td>
        </tr>
    `;

}


// ==========================================
// SHOW ALL REQUESTS ERROR
// ==========================================

function showRequestLoadError() {

    if (!allRequests) {

        return;

    }


    allRequests.innerHTML = `
        <tr>
            <td
                colspan="6"
                class="empty-row">

                Unable to load requests.

            </td>
        </tr>
    `;

}

// ==========================================
// ORDER TRACKING
// ==========================================

function escapeTrackingHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ==========================================
// FORMAT TRACKING DATE
// ==========================================

function formatTrackingDate(value) {

    if (!value) {

        return "-";

    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {

        return String(value);

    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// ==========================================
// TRACKING STATUS CLASS
// ==========================================

function getTrackingStatusClass(status) {

    const normalized =
        String(status ?? "")
            .toLowerCase();

    if (
        normalized.includes(
            "delivered"
        )
    ) {

        return "active";

    }

    if (
        normalized.includes(
            "out_for_delivery"
        )
    ) {

        return "active";

    }

    if (
        normalized.includes(
            "in_transit"
        )
    ) {

        return "pending";

    }

    if (
        normalized.includes(
            "dispatched"
        )
    ) {

        return "pending";

    }

    return "unknown";

}


// ==========================================
// TRACKING STATUS TEXT
// ==========================================

function getTrackingStatusText(status) {

    if (!status) {

        return "NOT DISPATCHED";

    }

    return String(status)
        .replaceAll(
            "_",
            " "
        )
        .toUpperCase();

}


// ==========================================
// LOAD ORDER TRACKING
// ==========================================

async function loadTracking() {

    const trackingTableBody =
        document.getElementById(
            "trackingTableBody"
        );

    if (!trackingTableBody) {

        return;

    }


    // --------------------------------------
    // Loading message
    // --------------------------------------

    trackingTableBody.innerHTML = `
        <tr>

            <td
                colspan="6"
                class="empty-row">

                Loading order tracking...

            </td>

        </tr>
    `;


    // --------------------------------------
    // Check logged-in user
    // --------------------------------------

    if (
        !currentUser ||
        !currentUser.userId
    ) {

        trackingTableBody.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    class="empty-row">

                    Unable to identify the logged-in user.

                </td>

            </tr>
        `;

        return;

    }


    try {

        // ----------------------------------
        // Use the requests already loaded
        // for the logged-in user
        // ----------------------------------

        const requests =
            Array.isArray(userRequests)
                ? userRequests
                : [];


        // ----------------------------------
        // No requests
        // ----------------------------------

        if (!requests.length) {

            trackingTableBody.innerHTML = `
                <tr>

                    <td
                        colspan="6"
                        class="empty-row">

                        No procurement requests found.

                    </td>

                </tr>
            `;

            return;

        }


        // ----------------------------------
        // Get shipment for every request
        // ----------------------------------

        const trackingRows =
            await Promise.all(

                requests.map(
                    async function (request) {

                        const requestId =
                            request.requestId ??
                            request.id ??
                            null;


                        if (
                            requestId === null
                        ) {

                            return {

                                request: request,

                                shipment: null

                            };

                        }


                        try {

                            const response =
                                await fetch(

                                    API_BASE_URL +
                                    "/api/shipping/request/" +
                                    encodeURIComponent(
                                        requestId
                                    ),

                                    {
                                        method: "GET",

                                        headers: {

                                            "Accept":
                                                "application/json"

                                        }

                                    }

                                );


                            // --------------------------------
                            // No shipment yet
                            // --------------------------------

                            if (
                                response.status ===
                                404
                            ) {

                                return {

                                    request: request,

                                    shipment: null

                                };

                            }


                            const responseText =
                                await response.text();


                            if (!response.ok) {

                                throw new Error(

                                    responseText ||
                                    "Unable to load tracking information."

                                );

                            }


                            if (!responseText) {

                                return {

                                    request: request,

                                    shipment: null

                                };

                            }


                            return {

                                request: request,

                                shipment:
                                    JSON.parse(
                                        responseText
                                    )

                            };

                        } catch (error) {

                            console.error(

                                "Tracking load error for request "
                                + requestId +
                                ":",

                                error

                            );


                            return {

                                request: request,

                                shipment: null,

                                error: true

                            };

                        }

                    }
                )

            );


        // ----------------------------------
        // Display tracking rows
        // ----------------------------------

        trackingTableBody.innerHTML =

            trackingRows
                .map(
                    function (item) {

                        const request =
                            item.request ||
                            {};

                        const shipment =
                            item.shipment;


                        const requestId =
                            request.requestId ??
                            request.id ??
                            "-";


                        const productName =
                            request.productName ??
                            request.name ??
                            "Unknown Product";


                        // --------------------------------
                        // Shipment exists
                        // --------------------------------

                        if (shipment) {

                            const status =
                                getTrackingStatusText(
                                    shipment.status
                                );


                            const statusClass =
                                getTrackingStatusClass(
                                    shipment.status
                                );


                            return `
                                <tr>

                                    <td>

                                        <strong>
                                            Request #${escapeTrackingHtml(
                                                requestId
                                            )}
                                        </strong>

                                    </td>


                                    <td>

                                        ${escapeTrackingHtml(
                                            productName
                                        )}

                                    </td>


                                    <td>

                                        <span
                                            class="product-status ${statusClass}">

                                            ${escapeTrackingHtml(
                                                status
                                            )}

                                        </span>

                                    </td>


                                    <td>

                                        ${escapeTrackingHtml(
                                            shipment.currentLocation ||
                                            "-"
                                        )}

                                    </td>


                                    <td>

                                        ${escapeTrackingHtml(
                                            shipment.trackingNumber ||
                                            "Not assigned"
                                        )}

                                    </td>


                                    <td>

                                        ${escapeTrackingHtml(
                                            formatTrackingDate(
                                                shipment.lastUpdated
                                            )
                                        )}

                                    </td>

                                </tr>
                            `;

                        }


                        // --------------------------------
                        // Shipment does not exist yet
                        // --------------------------------

                        return `
                            <tr>

                                <td>

                                    <strong>
                                        Request #${escapeTrackingHtml(
                                            requestId
                                        )}
                                    </strong>

                                </td>


                                <td>

                                    ${escapeTrackingHtml(
                                        productName
                                    )}

                                </td>


                                <td>

                                    <span
                                        class="product-status unknown">

                                        NOT DISPATCHED

                                    </span>

                                </td>


                                <td>

                                    Waiting for shipment

                                </td>


                                <td>

                                    Not assigned

                                </td>


                                <td>

                                    -

                                </td>

                            </tr>
                        `;

                    }
                )
                .join("");


    } catch (error) {

        console.error(
            "Order tracking error:",
            error
        );


        trackingTableBody.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    class="empty-row">

                    Unable to load order tracking.
                    Please try again.

                </td>

            </tr>
        `;

    }

}


// ==========================================
// INITIALIZE DASHBOARD
// ==========================================

loadUserRequests();
// ==========================================
// PRODUCT CATALOG
// ==========================================


// ==========================================
// LOAD PRODUCTS
// ==========================================

// ======================================================
// PRODUCTS
// ======================================================

async function loadProducts() {

    const productTableBody =
        document.getElementById("productTableBody");

    if (!productTableBody) {
        console.error("productTableBody not found.");
        return;
    }

    // Show loading message
    productTableBody.innerHTML = `
        <tr>
            <td colspan="7" class="empty-row">
                Loading products...
            </td>
        </tr>
    `;

    try {

        const response = await fetch(
            API_BASE_URL + "/api/products",
            {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        const responseText = await response.text();

        if (!response.ok) {

            throw new Error(
                responseText ||
                "Unable to load products."
            );

        }

        let data = [];

        if (responseText) {

            try {

                data = JSON.parse(responseText);

            } catch (error) {

                console.error(
                    "Invalid product JSON:",
                    error
                );

                throw new Error(
                    "Server returned invalid product data."
                );

            }

        }

        const products =
            normalizeProducts(data);

        renderProducts(products);

    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );

        productTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-row">
                    Unable to load products
                </td>
            </tr>
        `;

    }
}


// ======================================================
// NORMALIZE PRODUCTS RESPONSE
// ======================================================

function normalizeProducts(data) {

    if (Array.isArray(data)) {

        return data;

    }

    if (
        data &&
        Array.isArray(data.content)
    ) {

        return data.content;

    }

    if (
        data &&
        Array.isArray(data.products)
    ) {

        return data.products;

    }

    if (
        data &&
        Array.isArray(data.data)
    ) {

        return data.data;

    }

    if (
        data &&
        typeof data === "object"
    ) {

        return [data];

    }

    return [];

}


// ======================================================
// GET DEPARTMENT NAME
// ======================================================

function getDepartmentName(product) {

    if (!product) {
        return "-";
    }

    // Department is an object
    if (
        product.department &&
        typeof product.department === "object"
    ) {

        return (
            product.department.departmentName ||
            product.department.name ||
            product.department.deptName ||
            "-"
        );

    }

    // Department is directly a string
    if (
        typeof product.department === "string"
    ) {

        return product.department;

    }

    return "-";

}


// ======================================================
// GET CATEGORY NAME
// ======================================================

function getCategoryName(product) {

    if (!product) {
        return "-";
    }

    // Category is an object
    if (
        product.category &&
        typeof product.category === "object"
    ) {

        return (
            product.category.categoryName ||
            product.category.name ||
            "-"
        );

    }

    // Category is directly a string
    if (
        typeof product.category === "string"
    ) {

        return product.category;

    }

    return "-";

}


// ======================================================
// GET PRODUCT STATUS
// ======================================================

function getProductStatus(product) {

    if (!product) {
        return "UNKNOWN";
    }

    let status =
        product.status;

    if (
        status &&
        typeof status === "object"
    ) {

        status =
            status.status ||
            status.name ||
            status.value;

    }

    if (
        status === undefined ||
        status === null ||
        String(status).trim() === ""
    ) {

        return "UNKNOWN";

    }

    return String(status)
        .replaceAll("_", " ")
        .toUpperCase();

}


// ======================================================
// PRODUCT STATUS CLASS
// ======================================================

function getProductStatusClass(status) {

    const normalized =
        String(status || "")
            .toLowerCase();

    if (
        normalized.includes("active")
    ) {

        return "approved";

    }

    if (
        normalized.includes("pending")
    ) {

        return "pending";

    }

    if (
        normalized.includes("closed")
    ) {

        return "rejected";

    }

    return "pending";

}


// ======================================================
// FORMAT PRODUCT PRICE
// ======================================================

function formatProductPrice(price) {

    if (
        price === undefined ||
        price === null ||
        price === ""
    ) {

        return "₹0.00";

    }

    const number =
        Number(price);

    if (Number.isNaN(number)) {

        return "₹" + escapeHtml(price);

    }

    return number.toLocaleString(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2
        }
    );

}


// ======================================================
// RENDER PRODUCTS
// ======================================================

function renderProducts(products) {

    const productTableBody =
        document.getElementById(
            "productTableBody"
        );

    if (!productTableBody) {

        console.error(
            "productTableBody not found."
        );

        return;

    }


    // ------------------------------------------
    // NO PRODUCTS
    // ------------------------------------------

    if (!products.length) {

        productTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-row">
                    No products available
                </td>
            </tr>
        `;

        return;

    }


    // ------------------------------------------
    // PRODUCTS
    // ------------------------------------------

    productTableBody.innerHTML =
        products
            .map(
                function (product) {

                    const productId =
                        product.productId ??
                        product.id ??
                        "-";


                    const productName =
                        product.name ??
                        product.productName ??
                        "Unknown Product";


                    const price =
                        product.pricePerProduct ??
                        product.price ??
                        0;


                    const quantity =
                        product.numberOfQuantities ??
                        product.quantity ??
                        product.stock ??
                        0;


                    const department =
                        getDepartmentName(
                            product
                        );


                    const category =
                        getCategoryName(
                            product
                        );


                    const status =
                        getProductStatus(
                            product
                        );


                    const statusClass =
                        getProductStatusClass(
                            status
                        );


                    return `
                        <tr>

                            <td>
                                ${escapeHtml(productId)}
                            </td>

                            <td>
                                <strong>
                                    ${escapeHtml(productName)}
                                </strong>
                            </td>

                            <td>
                                <strong>
                                    ${formatProductPrice(price)}
                                </strong>
                            </td>

                            <td>
                                ${escapeHtml(quantity)}
                            </td>

                            <td>
                                ${escapeHtml(department)}
                            </td>

                            <td>
                                ${escapeHtml(category)}
                            </td>

                            <td>
                                <span class="status-badge ${statusClass}">
                                    ${escapeHtml(status)}
                                </span>
                            </td>

                        </tr>
                    `;

                }
            )
            .join("");

}


// ======================================================
// LOAD PRODUCTS WHEN PRODUCTS SECTION IS OPENED
// ======================================================

function openProductsSection() {

    showSection("products");

    loadProducts();

}

// ==========================================
// PRODUCT STATUS CLASS
// ==========================================

function getProductStatusClass(status) {

    const normalized =
        String(
            status || ""
        ).toLowerCase();


    if (
        normalized.includes(
            "active"
        )
    ) {

        return "active";

    }


    if (
        normalized.includes(
            "pending"
        )
    ) {

        return "pending";

    }


    if (
        normalized.includes(
            "closed"
        )
    ) {

        return "closed";

    }


    return "unknown";

}


// ==========================================
// ESCAPE PRODUCT HTML
// ==========================================

function escapeProductHtml(value) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}
// ==========================================
// PRODUCTS
// ==========================================

const productsTableBody =
    document.getElementById("productsTableBody");


// ==========================================
// GET PRODUCT VALUE SAFELY
// ==========================================

function getProductValue(object, keys, defaultValue = "-") {

    if (!object) {
        return defaultValue;
    }

    for (let i = 0; i < keys.length; i++) {

        const key = keys[i];

        if (
            object[key] !== undefined &&
            object[key] !== null &&
            object[key] !== ""
        ) {

            return object[key];
        }
    }

    return defaultValue;
}


// ==========================================
// NORMALIZE PRODUCTS RESPONSE
// ==========================================

function normalizeProducts(data) {

    if (Array.isArray(data)) {
        return data;
    }

    if (
        data &&
        Array.isArray(data.content)
    ) {
        return data.content;
    }

    if (
        data &&
        Array.isArray(data.products)
    ) {
        return data.products;
    }

    if (
        data &&
        Array.isArray(data.data)
    ) {
        return data.data;
    }

    if (
        data &&
        typeof data === "object"
    ) {
        return [data];
    }

    return [];
}


// ==========================================
// GET DEPARTMENT NAME
// ==========================================

function getProductDepartment(product) {

    if (!product) {
        return "-";
    }

    if (
        product.department &&
        typeof product.department === "object"
    ) {

        return getProductValue(
            product.department,
            [
                "departmentName",
                "name"
            ],
            "-"
        );
    }

    if (
        typeof product.department === "string"
    ) {

        return product.department;
    }

    return "-";
}


// ==========================================
// GET CATEGORY NAME
// ==========================================

function getProductCategory(product) {

    if (!product) {
        return "-";
    }

    if (
        product.category &&
        typeof product.category === "object"
    ) {

        return getProductValue(
            product.category,
            [
                "categoryName",
                "name"
            ],
            "-"
        );
    }

    if (
        typeof product.category === "string"
    ) {

        return product.category;
    }

    return "-";
}


// ==========================================
// GET PRODUCT STATUS
// ==========================================

function getProductStatus(product) {

    const status =
        getProductValue(
            product,
            ["status"],
            "UNKNOWN"
        );

    return String(status)
        .replaceAll("_", " ")
        .toUpperCase();
}


// ==========================================
// GET PRODUCT STATUS CLASS
// ==========================================

function getProductStatusClass(product) {

    const status =
        String(
            getProductValue(
                product,
                ["status"],
                "UNKNOWN"
            )
        )
        .toLowerCase();

    if (status.includes("active")) {
        return "approved";
    }

    if (status.includes("pending")) {
        return "pending";
    }

    if (status.includes("closed")) {
        return "rejected";
    }

    return "pending";
}


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

    if (!productsTableBody) {
        return;
    }

    try {

        const response =
            await fetch(
                API_BASE_URL + "/api/products",
                {
                    method: "GET",
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const responseText =
            await response.text();


        if (!response.ok) {

            throw new Error(
                responseText ||
                "Unable to load products."
            );
        }


        let data = [];


        if (responseText) {

            try {

                data =
                    JSON.parse(
                        responseText
                    );

            } catch (error) {

                console.error(
                    "Invalid product JSON:",
                    error
                );

                throw new Error(
                    "The server returned invalid product data."
                );
            }
        }


        const products =
            normalizeProducts(data);


        renderProducts(
            products
        );


    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );


        productsTableBody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="empty-row">
                    Unable to load products
                </td>
            </tr>
        `;
    }
}


// ==========================================
// RENDER PRODUCTS
// ==========================================

function renderProducts(products) {

    if (!productsTableBody) {
        return;
    }


    if (!products.length) {

        productsTableBody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="empty-row">
                    No products available
                </td>
            </tr>
        `;

        return;
    }


    productsTableBody.innerHTML =
        products
            .map(
                function (product) {

                    const productId =
                        getProductValue(
                            product,
                            [
                                "productId",
                                "id"
                            ],
                            "-"
                        );


                    const productName =
                        getProductValue(
                            product,
                            [
                                "name",
                                "productName"
                            ],
                            "Unknown Product"
                        );


                    const price =
                        getProductValue(
                            product,
                            [
                                "pricePerProduct",
                                "price"
                            ],
                            0
                        );


                    const quantity =
                        getProductValue(
                            product,
                            [
                                "numberOfQuantities",
                                "quantity"
                            ],
                            0
                        );


                    const department =
                        getProductDepartment(
                            product
                        );


                    const category =
                        getProductCategory(
                            product
                        );


                    const status =
                        getProductStatus(
                            product
                        );


                    const statusClass =
                        getProductStatusClass(
                            product
                        );


                    return `
                        <tr>

                            <td>
                                ${escapeHtml(productId)}
                            </td>

                            <td>
                                <strong>
                                    ${escapeHtml(productName)}
                                </strong>
                            </td>

                            <td>
                                <strong>
                                    ₹${Number(price).toLocaleString(
                                        "en-IN",
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${escapeHtml(quantity)}
                            </td>

                            <td>
                                ${escapeHtml(department)}
                            </td>

                            <td>
                                ${escapeHtml(category)}
                            </td>

                            <td>
                                <span
                                    class="status-badge ${statusClass}">
                                    ${escapeHtml(status)}
                                </span>
                            </td>

                        </tr>
                    `;
                }
            )
            .join("");
}
// ==========================================
// DOWNLOADS
// ==========================================

function setupDownloadButtons() {

    const downloadJsonButton =
        document.getElementById(
            "downloadJsonButton"
        );

    const downloadCsvButton =
        document.getElementById(
            "downloadCsvButton"
        );

    const downloadXmlButton =
        document.getElementById(
            "downloadXmlButton"
        );


    // --------------------------------------
    // Check logged-in user
    // --------------------------------------

    if (
        !currentUser ||
        !currentUser.userId
    ) {

        console.error(
            "User ID is missing. Downloads cannot be configured."
        );

        return;

    }


    const userId =
        currentUser.userId;


    // --------------------------------------
    // JSON DOWNLOAD
    // --------------------------------------

    if (downloadJsonButton) {

        downloadJsonButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    API_BASE_URL +
                    "/api/download/user/" +
                    userId +
                    "/json";

            }
        );

    }


    // --------------------------------------
    // CSV DOWNLOAD
    // --------------------------------------

    if (downloadCsvButton) {

        downloadCsvButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    API_BASE_URL +
                    "/api/download/user/" +
                    userId +
                    "/csv";

            }
        );

    }


    // --------------------------------------
    // XML DOWNLOAD
    // --------------------------------------

    if (downloadXmlButton) {

        downloadXmlButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    API_BASE_URL +
                    "/api/download/user/" +
                    userId +
                    "/xml";

            }
        );

    }

}


// ==========================================
// INITIALIZE DOWNLOAD BUTTONS
// ==========================================

setupDownloadButtons();
// ==========================================
// PROFILE
// ==========================================

async function loadUserProfile() {

    if (
        !currentUser ||
        !currentUser.userId
    ) {

        console.error(
            "User ID is missing. Profile cannot be loaded."
        );

        return;

    }


    try {

        const response =
            await fetch(
                API_BASE_URL +
                "/api/profile/user/" +
                currentUser.userId
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load profile. HTTP status: " +
                response.status
            );

        }


        const user =
            await response.json();


        // ----------------------------------
        // Name
        // ----------------------------------

        const profileName =
            document.getElementById(
                "profileName"
            );

        const profileFullName =
            document.getElementById(
                "profileFullName"
            );


        const name =
            user.name ||
            "User";


        if (profileName) {

            profileName.textContent =
                name;

        }


        if (profileFullName) {

            profileFullName.textContent =
                name;

        }


        // ----------------------------------
        // Avatar
        // ----------------------------------

        const profileAvatar =
            document.getElementById(
                "profileAvatar"
            );


        if (profileAvatar) {

            profileAvatar.textContent =
                name
                    .charAt(0)
                    .toUpperCase();

        }


        // ----------------------------------
        // Email
        // ----------------------------------

        const profileEmail =
            document.getElementById(
                "profileEmail"
            );


        if (profileEmail) {

            profileEmail.textContent =
                user.email ||
                "-";

        }


        // ----------------------------------
        // Phone
        // ----------------------------------

        const profilePhone =
            document.getElementById(
                "profilePhone"
            );


        if (profilePhone) {

            profilePhone.textContent =
                user.phoneNumber ||
                "-";

        }


        // ----------------------------------
        // Designation
        // ----------------------------------

        const profileDesignation =
            document.getElementById(
                "profileDesignation"
            );

        const profileDesignationValue =
            document.getElementById(
                "profileDesignationValue"
            );


        const designation =
            user.designation ||
            "-";


        if (profileDesignation) {

            profileDesignation.textContent =
                designation;

        }


        if (profileDesignationValue) {

            profileDesignationValue.textContent =
                designation;

        }


        // ----------------------------------
        // Role
        // ----------------------------------

        const profileRole =
            document.getElementById(
                "profileRole"
            );


        if (profileRole) {

            profileRole.textContent =
                user.role ||
                "-";

        }


        // ----------------------------------
        // Department
        // ----------------------------------

        const profileDepartment =
            document.getElementById(
                "profileDepartment"
            );


        if (profileDepartment) {

            if (
                user.department &&
                user.department.departmentName
            ) {

                profileDepartment.textContent =
                    user.department.departmentName;

            } else {

                profileDepartment.textContent =
                    "-";

            }

        }


    } catch (error) {

        console.error(
            "Error loading profile:",
            error
        );

    }

}
// ==========================================
// INITIALIZE DASHBOARD
// ==========================================

loadUserRequests();
loadProducts();
loadUserProfile();
// ==========================================
// PROFILE EDIT
// ==========================================

function setupProfileEdit() {

    const editButton =
        document.getElementById(
            "editProfileButton"
        );

    const editForm =
        document.getElementById(
            "profileEditForm"
        );

    const cancelButton =
        document.getElementById(
            "cancelProfileEditButton"
        );

    const saveButton =
        document.getElementById(
            "saveProfileButton"
        );

    const message =
        document.getElementById(
            "profileEditMessage"
        );

    const nameInput =
        document.getElementById(
            "editProfileName"
        );

    const emailInput =
        document.getElementById(
            "editProfileEmail"
        );

    const phoneInput =
        document.getElementById(
            "editProfilePhone"
        );

    const designationInput =
        document.getElementById(
            "editProfileDesignation"
        );


    // ==========================================
    // CHECK ELEMENTS
    // ==========================================

    if (!editButton ||
        !editForm ||
        !cancelButton ||
        !saveButton ||
        !nameInput ||
        !emailInput ||
        !phoneInput ||
        !designationInput) {

        console.error(
            "Profile edit elements are missing."
        );

        return;
    }


    // ==========================================
    // OPEN EDIT FORM
    // ==========================================

    editButton.addEventListener(
        "click",
        function () {

            const currentName =
                document.getElementById(
                    "profileFullName"
                );

            const currentEmail =
                document.getElementById(
                    "profileEmail"
                );

            const currentPhone =
                document.getElementById(
                    "profilePhone"
                );

            const currentDesignation =
                document.getElementById(
                    "profileDesignationValue"
                );


            nameInput.value =
                currentName
                    ? currentName.textContent.trim()
                    : "";

            emailInput.value =
                currentEmail
                    ? currentEmail.textContent.trim()
                    : "";

            phoneInput.value =
                currentPhone
                    ? currentPhone.textContent.trim()
                    : "";

            designationInput.value =
                currentDesignation
                    ? currentDesignation.textContent.trim()
                    : "";


            message.textContent = "";
            message.className =
                "profile-edit-message";


            editForm.style.display =
                "block";

            editButton.style.display =
                "none";


            editForm.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });

        }
    );


    // ==========================================
    // CANCEL
    // ==========================================

    cancelButton.addEventListener(
        "click",
        function () {

            editForm.style.display =
                "none";

            editButton.style.display =
                "inline-block";

            message.textContent = "";
            message.className =
                "profile-edit-message";
        }
    );


    // ==========================================
    // SAVE
    // ==========================================

    saveButton.addEventListener(
        "click",
        async function () {

            const name =
                nameInput.value.trim();

            const email =
                emailInput.value.trim();

            const phone =
                phoneInput.value.trim();

            const designation =
                designationInput.value.trim();


            // ==========================================
            // VALIDATION
            // ==========================================

            if (!name) {

                showProfileEditMessage(
                    "Please enter your full name.",
                    "error"
                );

                nameInput.focus();

                return;
            }


            if (!email) {

                showProfileEditMessage(
                    "Please enter your email.",
                    "error"
                );

                emailInput.focus();

                return;
            }


            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {

                showProfileEditMessage(
                    "Please enter a valid email address.",
                    "error"
                );

                emailInput.focus();

                return;
            }


            if (!phone) {

                showProfileEditMessage(
                    "Please enter your phone number.",
                    "error"
                );

                phoneInput.focus();

                return;
            }


            // ==========================================
            // USER ID CHECK
            // ==========================================

            if (!currentUser ||
                !currentUser.userId) {

                showProfileEditMessage(
                    "User information is missing. Please login again.",
                    "error"
                );

                return;
            }


            // ==========================================
            // DISABLE BUTTON
            // ==========================================

            saveButton.disabled = true;

            saveButton.textContent =
                "Saving...";


            try {

                const response =
                    await fetch(
                        API_BASE_URL +
                        "/api/profile/user/" +
                        currentUser.userId,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                name: name,
                                email: email,
                                phoneNumber: phone,
                                designation: designation
                            })
                        }
                    );


                const responseText =
                    await response.text();


                // ==========================================
                // ERROR RESPONSE
                // ==========================================

                if (!response.ok) {

                    throw new Error(
                        responseText ||
                        "Unable to update profile."
                    );
                }


                // ==========================================
                // SUCCESS
                // ==========================================

                showProfileEditMessage(
                    "Profile updated successfully.",
                    "success"
                );


                // Reload profile from backend
                await loadUserProfile();


                // Update current user data
                try {

                    const updatedUser =
                        responseText
                            ? JSON.parse(
                                responseText
                            )
                            : null;

                    if (updatedUser) {

                        currentUser =
                            {
                                ...currentUser,
                                ...updatedUser
                            };

                        // Keep user information
                        // in localStorage if used
                        localStorage.setItem(
                            "currentUser",
                            JSON.stringify(
                                currentUser
                            )
                        );
                    }

                } catch (error) {

                    console.warn(
                        "Profile updated, but local user data could not be refreshed.",
                        error
                    );
                }


                // Update header user name
                const userName =
                    document.getElementById(
                        "userName"
                    );

                const welcomeName =
                    document.getElementById(
                        "welcomeName"
                    );


                if (userName) {

                    userName.textContent =
                        name;
                }


                if (welcomeName) {

                    welcomeName.textContent =
                        name;
                }


                // Update avatar
                const userAvatar =
                    document.getElementById(
                        "userAvatar"
                    );

                const profileAvatar =
                    document.getElementById(
                        "profileAvatar"
                    );


                const firstLetter =
                    name
                        .charAt(0)
                        .toUpperCase();


                if (userAvatar) {

                    userAvatar.textContent =
                        firstLetter;
                }


                if (profileAvatar) {

                    profileAvatar.textContent =
                        firstLetter;
                }


                // Close form after short delay
                setTimeout(
                    function () {

                        editForm.style.display =
                            "none";

                        editButton.style.display =
                            "inline-block";

                    },
                    800
                );

            } catch (error) {

                console.error(
                    "Profile update error:",
                    error
                );

                showProfileEditMessage(
                    error.message ||
                    "Unable to update profile.",
                    "error"
                );

            } finally {

                saveButton.disabled =
                    false;

                saveButton.textContent =
                    "Save Changes";
            }

        }
    );
}


// ==========================================
// PROFILE EDIT MESSAGE
// ==========================================

function showProfileEditMessage(
    text,
    type
) {

    const message =
        document.getElementById(
            "profileEditMessage"
        );

    if (!message) {
        return;
    }

    message.textContent =
        text;

    message.className =
        "profile-edit-message " +
        type;
}


// ==========================================
// INITIALIZE PROFILE EDIT
// ==========================================

setupProfileEdit();

// ==========================================
// PRODUCT RATINGS
// ==========================================

(function initializeProductRatings() {

    const deliveredProductsContainer =
        document.getElementById(
            "deliveredProductsContainer"
        );

    const productRatingForm =
        document.getElementById(
            "productRatingForm"
        );

    const ratingProductName =
        document.getElementById(
            "ratingProductName"
        );

    const ratingRequestNumber =
        document.getElementById(
            "ratingRequestNumber"
        );

    const productRatingStars =
        document.querySelectorAll(
            ".product-rating-star"
        );

    const productRatingText =
        document.getElementById(
            "productRatingText"
        );

    const productReviewText =
        document.getElementById(
            "productReviewText"
        );

    const reviewCharacterCount =
        document.getElementById(
            "reviewCharacterCount"
        );

    const submitProductRatingButton =
        document.getElementById(
            "submitProductRatingButton"
        );

    const cancelProductRatingButton =
        document.getElementById(
            "cancelProductRatingButton"
        );

    const closeRatingFormButton =
        document.getElementById(
            "closeRatingFormButton"
        );

    const productRatingMessage =
        document.getElementById(
            "productRatingMessage"
        );

    const productRatingHistory =
        document.getElementById(
            "productRatingHistory"
        );


    // ------------------------------------------
    // SAFETY CHECK
    // ------------------------------------------

    if (
        !deliveredProductsContainer ||
        !productRatingForm
    ) {
        return;
    }


    // ------------------------------------------
    // STORAGE KEY
    // ------------------------------------------

    const RATING_STORAGE_KEY =
        "procureflow_product_ratings";


    // ------------------------------------------
    // CURRENT SELECTED PRODUCT
    // ------------------------------------------

    let selectedProduct = null;

    let selectedRating = 0;


    // ------------------------------------------
    // READ RATINGS
    // ------------------------------------------

    function getSavedRatings() {

        try {

            const saved =
                localStorage.getItem(
                    RATING_STORAGE_KEY
                );

            if (!saved) {
                return [];
            }

            const data =
                JSON.parse(saved);

            return Array.isArray(data)
                ? data
                : [];

        } catch (error) {

            console.error(
                "Unable to read product ratings:",
                error
            );

            return [];
        }
    }


    // ------------------------------------------
    // SAVE RATINGS
    // ------------------------------------------

    function saveRatings(ratings) {

        try {

            localStorage.setItem(
                RATING_STORAGE_KEY,
                JSON.stringify(ratings)
            );

            return true;

        } catch (error) {

            console.error(
                "Unable to save product ratings:",
                error
            );

            return false;
        }
    }


    // ------------------------------------------
    // ESCAPE HTML
    // ------------------------------------------

    function escapeRatingHtml(value) {

        return String(
            value === undefined ||
            value === null
                ? ""
                : value
        )
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );
    }


    // ------------------------------------------
    // GET REQUEST ID
    // ------------------------------------------

    function getRequestId(request) {

        if (!request) {
            return null;
        }

        return (
            request.requestId ??
            request.id ??
            request.requestID ??
            null
        );
    }


    // ------------------------------------------
    // GET PRODUCT NAME
    // ------------------------------------------

    function getRequestProductName(request) {

        if (!request) {
            return "Unknown Product";
        }

        return (
            request.productName ??
            request.name ??
            request.product ??
            request.product_name ??
            "Unknown Product"
        );
    }


    // ------------------------------------------
    // GET REQUEST ARRAY FROM RESPONSE
    // ------------------------------------------

    function getRequestArray(data) {

        if (Array.isArray(data)) {
            return data;
        }

        if (
            data &&
            Array.isArray(data.content)
        ) {
            return data.content;
        }

        if (
            data &&
            Array.isArray(data.requests)
        ) {
            return data.requests;
        }

        if (
            data &&
            Array.isArray(data.data)
        ) {
            return data.data;
        }

        return [];
    }


    // ------------------------------------------
    // IS DELIVERED
    // ------------------------------------------

    function isDelivered(status) {

        const normalized =
            String(
                status || ""
            )
                .toLowerCase()
                .replaceAll(
                    "-",
                    "_"
                )
                .replaceAll(
                    " ",
                    "_"
                );


        return (
            normalized.includes(
                "delivered"
            )
        );
    }


    // ------------------------------------------
    // GET RATINGS FOR REQUEST
    // ------------------------------------------

	function getRatingForRequest(requestId) {

	    const ratings = Array.isArray(publicRatings)
	        ? publicRatings
	        : [];

	    return ratings.find(function(rating) {

	        return String(rating.requestId) === String(requestId);

	    }) || null;
	}


    // ------------------------------------------
    // SHOW STARS
    // ------------------------------------------

    function createStars(value) {

        const number =
            Number(value) || 0;

        let result = "";

        for (
            let i = 1;
            i <= 5;
            i++
        ) {

            result +=
                i <= number
                    ? "★"
                    : "☆";
        }

        return result;
    }


    // ------------------------------------------
    // FORMAT DATE
    // ------------------------------------------

    function formatRatingDate(value) {

        if (!value) {
            return "-";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return String(value);
        }

        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }


    // ------------------------------------------
    // UPDATE FORM STARS
    // ------------------------------------------

    function updateProductStars() {

        productRatingStars.forEach(
            function(button) {

                const value =
                    Number(
                        button.dataset.rating
                    );

                if (
                    value <=
                    selectedRating
                ) {

                    button.textContent =
                        "★";

                    button.classList.add(
                        "selected"
                    );

                } else {

                    button.textContent =
                        "☆";

                    button.classList.remove(
                        "selected"
                    );
                }
            }
        );


        const ratingLabels = {

            1: "1 out of 5 — Very Poor",

            2: "2 out of 5 — Poor",

            3: "3 out of 5 — Average",

            4: "4 out of 5 — Good",

            5: "5 out of 5 — Excellent"

        };


        if (
            selectedRating > 0
        ) {

            productRatingText.textContent =
                ratingLabels[
                    selectedRating
                ];

        } else {

            productRatingText.textContent =
                "Select a rating";
        }
    }


    // ------------------------------------------
    // STAR CLICK
    // ------------------------------------------

    productRatingStars.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    selectedRating =
                        Number(
                            button.dataset.rating
                        );

                    updateProductStars();

                }
            );

        }
    );


    // ------------------------------------------
    // REVIEW CHARACTER COUNT
    // ------------------------------------------

    if (productReviewText) {

        productReviewText.addEventListener(
            "input",
            function() {

                reviewCharacterCount.textContent =
                    productReviewText.value.length;

            }
        );
    }


    // ------------------------------------------
    // CLOSE FORM
    // ------------------------------------------

    function closeRatingForm() {

        selectedProduct = null;

        selectedRating = 0;

        updateProductStars();


        if (productReviewText) {

            productReviewText.value = "";

        }


        if (reviewCharacterCount) {

            reviewCharacterCount.textContent =
                "0";

        }


        if (productRatingMessage) {

            productRatingMessage.textContent =
                "";

            productRatingMessage.className =
                "product-rating-message";
        }


        productRatingForm.style.display =
            "none";


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });
    }


    if (
        cancelProductRatingButton
    ) {

        cancelProductRatingButton.addEventListener(
            "click",
            closeRatingForm
        );

    }


    if (
        closeRatingFormButton
    ) {

        closeRatingFormButton.addEventListener(
            "click",
            closeRatingForm
        );

    }


    // ------------------------------------------
    // OPEN RATING FORM
    // ------------------------------------------

    function openRatingForm(product) {

        selectedProduct =
            product;

        selectedRating = 0;

        updateProductStars();


        if (ratingProductName) {

            ratingProductName.textContent =
                product.productName;

        }


        if (ratingRequestNumber) {

            ratingRequestNumber.textContent =
                "Request #" +
                product.requestId;

        }


        if (productReviewText) {

            productReviewText.value = "";

        }


        if (reviewCharacterCount) {

            reviewCharacterCount.textContent =
                "0";

        }


        if (productRatingMessage) {

            productRatingMessage.textContent =
                "";

            productRatingMessage.className =
                "product-rating-message";
        }


        productRatingForm.style.display =
            "block";


        productRatingForm.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }


    // ------------------------------------------
    // RENDER DELIVERED PRODUCTS
    // ------------------------------------------

    function renderDeliveredProducts(
        deliveredProducts
    ) {

        if (
            !deliveredProducts.length
        ) {

            deliveredProductsContainer.innerHTML = `

                <div class="rating-empty-delivered">

                    <div class="rating-empty-delivered-icon">
                        ★
                    </div>

                    <h3>
                        No delivered products yet
                    </h3>

                    <p>
                        You can rate a product after it has been delivered.
                    </p>

                </div>

            `;

            return;
        }


        deliveredProductsContainer.innerHTML =
            deliveredProducts
                .map(
                    function(product) {

                        const existingRating =
                            getRatingForRequest(
                                product.requestId
                            );


                        const buttonText =
                            existingRating
                                ? "✓ Rated"
                                : "Rate Product";


                        const buttonClass =
                            existingRating
                                ? "rate-product-button rated"
                                : "rate-product-button";


                        return `

                            <div
                                class="delivered-product-item">

                                <div
                                    class="delivered-product-info">

                                    <h3
                                        class="delivered-product-name">

                                        ${escapeRatingHtml(
                                            product.productName
                                        )}

                                    </h3>

                                    <p
                                        class="delivered-product-request">

                                        Request #${escapeRatingHtml(
                                            product.requestId
                                        )}

                                    </p>

                                    <span
                                        class="delivered-product-status">

                                        ✓ DELIVERED

                                    </span>

                                </div>


                                <button
                                    type="button"
                                    class="${buttonClass}"
                                    data-request-id="${escapeRatingHtml(
                                        product.requestId
                                    )}">

                                    ${buttonText}

                                </button>

                            </div>

                        `;
                    }
                )
                .join("");


        const rateButtons =
            deliveredProductsContainer.querySelectorAll(
                ".rate-product-button"
            );


        rateButtons.forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        const requestId =
                            button.dataset.requestId;


                        const product =
                            deliveredProducts.find(
                                function(item) {

                                    return String(
                                        item.requestId
                                    ) === String(
                                        requestId
                                    );

                                }
                            );


                        if (!product) {
                            return;
                        }


                        if (
                            getRatingForRequest(
                                requestId
                            )
                        ) {

                            return;
                        }


                        openRatingForm(
                            product
                        );

                    }
                );

            }
        );
    }


	async function loadDeliveredProducts() {

	    // ------------------------------------------
	    // SHOW LOADING
	    // ------------------------------------------

	    deliveredProductsContainer.innerHTML = `
	        <div class="rating-loading">
	            Loading your delivered products...
	        </div>
	    `;


	    // ------------------------------------------
	    // CHECK USER
	    // ------------------------------------------

	    if (!currentUser || !currentUser.userId) {

	        deliveredProductsContainer.innerHTML = `
	            <div class="rating-empty-delivered">

	                <h3>
	                    Unable to identify the logged-in user
	                </h3>

	                <p>
	                    Please log in again.
	                </p>

	            </div>
	        `;

	        return;
	    }


	    try {

	        // ------------------------------------------
	        // GET DELIVERED PRODUCTS DIRECTLY
	        // ------------------------------------------

	        const response = await fetch(
	            API_BASE_URL +
	            "/api/requests/user/" +
	            encodeURIComponent(
	                currentUser.userId
	            ) +
	            "/delivered",
	            {
	                method: "GET",

	                headers: {
	                    "Accept": "application/json"
	                }
	            }
	        );


	        // ------------------------------------------
	        // READ RESPONSE
	        // ------------------------------------------

	        const responseText =
	            await response.text();


	        if (!response.ok) {

	            throw new Error(
	                responseText ||
	                "Unable to load delivered products."
	            );
	        }


	        // ------------------------------------------
	        // PARSE JSON
	        // ------------------------------------------

	        let deliveredProducts = [];


	        if (responseText) {

	            deliveredProducts =
	                JSON.parse(
	                    responseText
	                );
	        }


	        // ------------------------------------------
	        // SAFETY CHECK
	        // ------------------------------------------

	        if (!Array.isArray(
	            deliveredProducts
	        )) {

	            deliveredProducts = [];
	        }


	        // ------------------------------------------
	        // DISPLAY PRODUCTS
	        // ------------------------------------------

	        renderDeliveredProducts(
	            deliveredProducts
	        );


	    } catch (error) {

	        console.error(
	            "Product ratings load error:",
	            error
	        );


	        deliveredProductsContainer.innerHTML = `
	            <div class="rating-empty-delivered">

	                <h3>
	                    Unable to load delivered products
	                </h3>

	                <p>
	                    ${escapeRatingHtml(
	                        error.message ||
	                        "Please try again."
	                    )}
	                </p>

	                <button
	                    type="button"
	                    class="rate-product-button"
	                    onclick="location.reload()">

	                    Retry

	                </button>

	            </div>
	        `;
	    }
	}

    // ------------------------------------------
    // SUBMIT RATING
    // ------------------------------------------

    if (
        submitProductRatingButton
    ) {

        submitProductRatingButton.addEventListener(
            "click",
            async function() {

                if (!selectedProduct) {
                    return;
                }

                if (selectedRating < 1) {
                    productRatingMessage.textContent =
                        "Please select a star rating.";
                    productRatingMessage.className =
                        "product-rating-message error";
                    return;
                }

                const review =
                    productReviewText
                        ? productReviewText.value.trim()
                        : "";

                const userEmail =
                    currentUser?.email ||
                    sessionStorage.getItem("userEmail");

                if (!userEmail) {
                    productRatingMessage.textContent =
                        "Unable to identify your account.";
                    productRatingMessage.className =
                        "product-rating-message error";
                    return;
                }

                try {
                    submitProductRatingButton.disabled = true;
                    productRatingMessage.textContent = "Submitting rating...";
                    productRatingMessage.className =
                        "product-rating-message";

                    const response = await fetch(
                        API_BASE_URL +
                        "/api/requests/" +
                        encodeURIComponent(selectedProduct.requestId) +
                        "/rating?userEmail=" +
                        encodeURIComponent(userEmail),
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Accept": "application/json"
                            },
                            body: JSON.stringify({
                                rating: selectedRating,
                                feedback: review
                            })
                        }
                    );

                    const responseText = await response.text();
                    let data = null;

                    if (responseText) {
                        try {
                            data = JSON.parse(responseText);
                        } catch {
                            data = responseText;
                        }
                    }

                    if (!response.ok) {
                        throw new Error(
                            typeof data === "string"
                                ? data
                                : "Unable to submit rating."
                        );
                    }

                    productRatingMessage.textContent =
                        "Thank you! Your product rating has been submitted.";
                    productRatingMessage.className =
                        "product-rating-message success";

                    await loadPublicRatings();

                    setTimeout(function() {
                        closeRatingForm();
                        loadDeliveredProducts();
                    }, 800);

                } catch (error) {
                    console.error("Rating submission error:", error);
                    productRatingMessage.textContent =
                        error.message || "Unable to submit rating.";
                    productRatingMessage.className =
                        "product-rating-message error";
                } finally {
                    submitProductRatingButton.disabled = false;
                }
            }
        );

    }


    let publicRatings = [];

    async function loadPublicRatings() {
        try {
            const response = await fetch(
                API_BASE_URL + "/api/requests/api-ratings",
                {
                    method: "GET",
                    headers: { "Accept": "application/json" }
                }
            );

            const text = await response.text();
            let data = [];

            if (text) {
                try {
                    data = JSON.parse(text);
                } catch {
                    data = [];
                }
            }

            if (!response.ok) {
                throw new Error(
                    typeof data === "string"
                        ? data
                        : "Unable to load ratings."
                );
            }

            publicRatings = Array.isArray(data) ? data : [];
            renderRatingHistory();
        } catch (error) {
            console.error("Public ratings load error:", error);
            publicRatings = [];
            renderRatingHistory();
        }
    }

    // ------------------------------------------
    // RENDER RATING HISTORY
    // ------------------------------------------

    function renderRatingHistory() {

		const ratings =
		        Array.isArray(publicRatings)
		            ? publicRatings
		            : [];


        if (
            !ratings.length
        ) {

            productRatingHistory.innerHTML = `

                <div class="rating-no-history">

                    <div class="rating-no-history-icon">
                        ★
                    </div>

                    <h3>
                        No product ratings yet
                    </h3>

                    <p>
                        Your submitted product ratings will appear here.
                    </p>

                </div>

            `;

            return;
        }


        productRatingHistory.innerHTML =
            ratings
                .map(
                    function(rating) {

                        const safeProductName =
                            escapeRatingHtml(
                                rating.productName
                            );


                        const safeReview =
                            (rating.feedback || rating.review)
                                ? escapeRatingHtml(
                                    rating.feedback || rating.review
                                )
                                : "No written review.";


                        return `

                            <div
                                class="product-rating-history-item">

                                <div
                                    class="product-rating-history-top">

                                    <div>

                                        <div
                                            class="product-rating-history-product">

                                            ${safeProductName}

                                        </div>

                                        <div
                                            class="product-rating-history-request">

                                            Request #${escapeRatingHtml(
                                                rating.requestId
                                            )}

                                        </div>

                                    </div>


                                    <div
                                        class="product-rating-history-date">

										${formatRatingDate(
										    rating.createdDate
										)}

                                    </div>

                                </div>


                                <div
                                    class="product-rating-history-stars">

                                    ${createStars(
                                        rating.rating
                                    )}

                                </div>


                                <p
                                    class="product-rating-history-comment">

                                    ${safeReview}

                                </p>

                            </div>

                        `;
                    }
                )
                .join("");
    }


    // ------------------------------------------
    // LOAD WHEN RATINGS PAGE IS OPENED
    // ------------------------------------------

	async function loadRatingsPage() {

	    await loadPublicRatings();

	    await loadDeliveredProducts();

	}


    // ------------------------------------------
    // RATINGS SIDEBAR BUTTON
    // ------------------------------------------

    const ratingsNavButton =
        document.querySelector(
            '.nav-item[data-section="ratings"]'
        );


    if (ratingsNavButton) {

        ratingsNavButton.addEventListener(
            "click",
            function() {

                loadRatingsPage();

            }
        );

    }


    // ------------------------------------------
    // INITIAL LOAD
    // ------------------------------------------

    renderRatingHistory();
    loadPublicRatings();

})();