// ==========================================
// NEW PROCUREMENT REQUEST
// ==========================================


// ==========================================
// BACKEND URL
// ==========================================

const API_BASE_URL = "";


// ==========================================
// GET LOGGED-IN USER
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
// GET USER DATA
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
// USER ROLE SECURITY
// ==========================================

if (
    storedRole &&
    storedRole.toUpperCase() !== "USER"
) {

    window.location.href =
        "role-selection.html";
}


// ==========================================
// ELEMENTS
// ==========================================

const requestForm =
    document.getElementById(
        "requestForm"
    );

const productName =
    document.getElementById(
        "productName"
    );

const pricePerProduct =
    document.getElementById(
        "pricePerProduct"
    );

const numberOfQuantities =
    document.getElementById(
        "numberOfQuantities"
    );

const description =
    document.getElementById(
        "description"
    );

const totalPrice =
    document.getElementById(
        "totalPrice"
    );

const message =
    document.getElementById(
        "message"
    );

const submitButton =
    document.getElementById(
        "submitButton"
    );

const submitText =
    document.getElementById(
        "submitText"
    );

const backButton =
    document.getElementById(
        "backButton"
    );

const cancelButton =
    document.getElementById(
        "cancelButton"
    );


// ==========================================
// PRODUCT STORAGE
// ==========================================

let availableProducts = [];


// ==========================================
// CALCULATE TOTAL
// ==========================================

function calculateTotal() {

    const price =
        parseFloat(
            pricePerProduct.value
        ) || 0;

    const quantity =
        parseInt(
            numberOfQuantities.value
        ) || 0;

    const total =
        price * quantity;

    totalPrice.textContent =
        "₹" +
        total.toFixed(2);
}


// ==========================================
// QUANTITY CHANGE
// ==========================================

numberOfQuantities.addEventListener(
    "input",
    calculateTotal
);


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(
    text,
    type
) {

    message.textContent =
        text;

    message.className =
        "message " + type;
}


// ==========================================
// CLEAR MESSAGE
// ==========================================

function clearMessage() {

    message.textContent =
        "";

    message.className =
        "message";
}


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

    productName.innerHTML = `
        <option value="">
            Loading products...
        </option>
    `;

    productName.disabled = true;

    try {

        const response =
            await fetch(
                API_BASE_URL +
                "/api/products",
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
                    "Invalid product response:",
                    error
                );

                throw new Error(
                    "The server returned invalid product data."
                );
            }
        }


        // --------------------------------------
        // Make sure response is an array
        // --------------------------------------

        if (!Array.isArray(data)) {

            throw new Error(
                "Product data is not in the expected format."
            );
        }


        availableProducts =
            data;


        // --------------------------------------
        // Clear dropdown
        // --------------------------------------

        productName.innerHTML = `
            <option value="">
                Select a product
            </option>
        `;


        // --------------------------------------
        // No products
        // --------------------------------------

        if (availableProducts.length === 0) {

            productName.innerHTML = `
                <option value="">
                    No products available
                </option>
            `;

            productName.disabled = true;

            showMessage(
                "No products are currently available.",
                "error"
            );

            return;
        }


        // --------------------------------------
        // Add products to dropdown
        // --------------------------------------

        availableProducts.forEach(
            function (product) {

                if (!product) {
                    return;
                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    product.name || "";


                const stock = Number(product.numberOfQuantities ?? 0);
                option.textContent =
                    (product.name || "Unnamed Product") +
                    " — " + stock + " available";


                // Store product ID
                option.dataset.productId =
                    product.productId || "";


                // Store actual product price
                option.dataset.price =
                    product.pricePerProduct ?? "";


                productName.appendChild(
                    option
                );
            }
        );


        productName.disabled = false;


    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );


        productName.innerHTML = `
            <option value="">
                Unable to load products
            </option>
        `;


        productName.disabled = true;


        showMessage(
            error.message ||
            "Unable to load products. Please try again.",
            "error"
        );
    }
}


// ==========================================
// PRODUCT SELECTION
// ==========================================

productName.addEventListener(
    "change",
    function () {

        clearMessage();


        const selectedValue =
            productName.value;


        // --------------------------------------
        // Nothing selected
        // --------------------------------------

        if (!selectedValue) {

            pricePerProduct.value =
                "";

            pricePerProduct.placeholder =
                "Select a product";

            totalPrice.textContent =
                "₹0.00";

            return;
        }


        // --------------------------------------
        // Find selected product
        // --------------------------------------

        const selectedProduct =
            availableProducts.find(
                function (product) {

                    return (
                        product &&
                        String(product.name)
                            .toLowerCase() ===
                        String(selectedValue)
                            .toLowerCase()
                    );
                }
            );


        // --------------------------------------
        // Product not found
        // --------------------------------------

        if (!selectedProduct) {

            pricePerProduct.value =
                "";

            totalPrice.textContent =
                "₹0.00";

            showMessage(
                "Unable to find the selected product.",
                "error"
            );

            return;
        }


        const availableStock = Number(
            selectedProduct.numberOfQuantities ?? 0
        );

        const stockMessage =
            document.getElementById("availableStockMessage");

        if (stockMessage) {
            stockMessage.textContent =
                "Available stock: " + availableStock + " pieces";
            stockMessage.style.color =
                availableStock > 0 ? "" : "#c0392b";
        }

        numberOfQuantities.max = String(availableStock);

        // --------------------------------------
        // Get actual product price
        // --------------------------------------

        const actualPrice =
            parseFloat(
                selectedProduct.pricePerProduct
            );


        // --------------------------------------
        // Validate actual price
        // --------------------------------------

        if (
            isNaN(actualPrice) ||
            actualPrice <= 0
        ) {

            pricePerProduct.value =
                "";

            totalPrice.textContent =
                "₹0.00";

            showMessage(
                "The selected product does not have a valid price.",
                "error"
            );

            return;
        }


        // --------------------------------------
        // Automatically fill price
        // --------------------------------------

        pricePerProduct.value =
            actualPrice.toFixed(2);


        pricePerProduct.placeholder =
            "Automatically filled";


        // --------------------------------------
        // Recalculate total
        // --------------------------------------

        calculateTotal();
    }
);


// ==========================================
// NAVIGATION - BACK
// ==========================================

backButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "user-dashboard.html";
    }
);


// ==========================================
// NAVIGATION - CANCEL
// ==========================================

cancelButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "user-dashboard.html";
    }
);


// ==========================================
// SUBMIT REQUEST
// ==========================================

requestForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        clearMessage();


        // --------------------------------------
        // Validate user
        // --------------------------------------

        if (
            !currentUser ||
            !currentUser.userId
        ) {

            showMessage(
                "User information is missing. Please log in again.",
                "error"
            );

            return;
        }


        // --------------------------------------
        // Get selected product
        // --------------------------------------

        const product =
            productName.value.trim();


        // --------------------------------------
        // Validate product
        // --------------------------------------

        if (!product) {

            showMessage(
                "Please select a product.",
                "error"
            );

            productName.focus();

            return;
        }


        // --------------------------------------
        // Find selected product in catalog
        // --------------------------------------

        const selectedProduct =
            availableProducts.find(
                function (item) {

                    return (
                        item &&
                        String(item.name)
                            .toLowerCase() ===
                        product.toLowerCase()
                    );
                }
            );


        if (!selectedProduct) {

            showMessage(
                "The selected product is not available.",
                "error"
            );

            productName.focus();

            return;
        }


        // --------------------------------------
        // Get ACTUAL catalog price
        // --------------------------------------

        const actualPrice =
            parseFloat(
                selectedProduct.pricePerProduct
            );


        if (
            isNaN(actualPrice) ||
            actualPrice <= 0
        ) {

            showMessage(
                "The selected product does not have a valid price.",
                "error"
            );

            return;
        }


        // --------------------------------------
        // Get quantity
        // --------------------------------------

        const quantity =
            parseInt(
                numberOfQuantities.value
            );


        if (
            isNaN(quantity) ||
            quantity <= 0
        ) {

            showMessage(
                "Please enter a valid quantity.",
                "error"
            );

            numberOfQuantities.focus();

            return;
        }


        const availableStock = Number(
            selectedProduct.numberOfQuantities ?? 0
        );

        if (quantity > availableStock) {
            showMessage(
                "Only " + availableStock + " pieces are currently available.",
                "error"
            );
            numberOfQuantities.focus();
            return;
        }

        if (availableStock <= 0) {
            showMessage(
                "This product is currently out of stock.",
                "error"
            );
            return;
        }

        // --------------------------------------
        // Get description
        // --------------------------------------

        const requestDescription =
            description.value.trim();


        if (!requestDescription) {

            showMessage(
                "Please enter a description for your request.",
                "error"
            );

            description.focus();

            return;
        }


        // ======================================
        // IMPORTANT
        // ======================================
        // We use the actual catalog price here.
        // We do NOT trust a manually entered price.
        // ======================================

        const requestData = {

            productName:
                selectedProduct.name,

            pricePerProduct:
                actualPrice,

            numberOfQuantities:
                quantity,

            description:
                requestDescription
        };


        // --------------------------------------
        // Disable submit button
        // --------------------------------------

        submitButton.disabled =
            true;

        submitText.textContent =
            "Submitting...";


        try {

            // ----------------------------------
            // Submit to backend
            // ----------------------------------

            const response =
                await fetch(
                    API_BASE_URL +
                    "/api/requests/user/" +
                    currentUser.userId,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                requestData
                            )
                    }
                );


            // ----------------------------------
            // Read response
            // ----------------------------------

            const responseText =
                await response.text();


            // ----------------------------------
            // Backend error
            // ----------------------------------

            if (!response.ok) {

                throw new Error(
                    responseText ||
                    "Unable to create request."
                );
            }


            // ----------------------------------
            // Parse saved request
            // ----------------------------------

            let savedRequest =
                null;


            if (responseText) {

                try {

                    savedRequest =
                        JSON.parse(
                            responseText
                        );

                } catch (error) {

                    console.warn(
                        "Response was not JSON:",
                        error
                    );
                }
            }


            const requestId =
                savedRequest &&
                savedRequest.requestId
                    ? savedRequest.requestId
                    : "";


            // ----------------------------------
            // Success
            // ----------------------------------

            showMessage(
                requestId
                    ? "Request #" +
                      requestId +
                      " submitted successfully."
                    : "Your procurement request was submitted successfully.",
                "success"
            );


            // ----------------------------------
            // Reset form
            // ----------------------------------

            requestForm.reset();


            pricePerProduct.value =
                "";

            pricePerProduct.placeholder =
                "Select a product";


            totalPrice.textContent =
                "₹0.00";


            // ----------------------------------
            // Redirect
            // ----------------------------------

            setTimeout(
                function () {

                    window.location.href =
                        "user-dashboard.html";

                },
                1800
            );


        } catch (error) {

            console.error(
                "Request submission error:",
                error
            );


            showMessage(
                error.message ||
                "Something went wrong while submitting your request.",
                "error"
            );


        } finally {

            submitButton.disabled =
                false;

            submitText.textContent =
                "Submit Request";
        }

    }
);


// ==========================================
// INITIAL LOAD
// ==========================================

loadProducts();

calculateTotal();