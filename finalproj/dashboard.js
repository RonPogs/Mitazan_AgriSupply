

// Add event listeners to buttons to update the quantity
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.quantity-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(event) {
            const productName = button.closest('.product').getAttribute('data-name');
            const change = button.classList.contains('increase') ? 1 : -1;
            updateQuantity(productName, change);
        });
    });
});

function showSection(section) {
    const sections = document.querySelectorAll('.inner-box');
    sections.forEach((el) => {
        el.style.display = 'none';
    });

    const selectedSection = document.getElementById(section);
    if (selectedSection) {
        selectedSection.style.display = 'block';
    }

    // Add active class to section
    const sectionElements = document.querySelectorAll('.sidebar a');
    sectionElements.forEach(function (s) {
        s.classList.remove('active');
    });
    document.querySelector(`.sidebar a[data-section="${section}"]`).classList.add('active');

    // Populate account info if the 'account' section is displayed
    if (section === 'account') {
        populateAccountInfo();
    } else if (section === 'orders') {
        loadOrders();
    }
}

// Check user login status
window.onload = function () {
    const links = document.querySelectorAll('.sidebar a');
    links.forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            showSection(link.getAttribute('data-section'));
        });
    });

    // Check if user is logged in
    const Username = localStorage.getItem('Username');
    if (!Username) {
        alert('You are not logged in. Please log in to access your account.');
        window.location.href = 'index.html'; // Redirect to login page
    } else {
        resetCart();
        showSection('home'); // Show the 'home' section by default
    }
};

// Function to retrieve user information from the database
function getUserInfo() {
    return new Promise((resolve, reject) => {
        const Username = localStorage.getItem('Username');
        console.log('Username from localStorage:', Username);

        if (!Username) {
            reject('User not logged in.');
            return;
        }

        fetch(`/datas/${Username}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(user => {
                resolve(user); // Return the user data
            })
            .catch(error => {
                reject(error);
            });
    });
}

// Function to populate user account info in the account section
function populateAccountInfo() {
    getUserInfo()
        .then(user => {
            // Populate user info
            document.getElementById('Username').innerText = user.Username;
            document.getElementById('FirstName').innerText = user.FirstName;
            document.getElementById('LastName').innerText = user.LastName;
            document.getElementById('ContactInfo').innerText = user.ContactInfo;
            document.getElementById('Address').innerText = user.Address;
        })
        .catch(error => {
            console.error('Error retrieving user info:', error);
            alert('An error occurred while retrieving user information. Please try again.');
        });
}


// Function to update the quantity of the product in the cart
function updateQuantity(name, change) {
    // Fetch product details from localStorage
    const storedProductDetails = JSON.parse(localStorage.getItem('productDetails'));

    if (!storedProductDetails) {
        console.error('No product details found in localStorage.');
        return;
    }

    // Find the product from localStorage using the product name
    const product = storedProductDetails.find(p => p.name === name);
    if (!product) {
        console.error(`Product with name ${name} not found in localStorage.`);
        return;
    }

    // Find the product element in the DOM by its name
    const productElement = document.querySelector(`.product[data-name="${name}"]`);
    if (!productElement) {
        console.error(`Product element with name ${name} not found in the DOM.`);
        return;
    }

    const quantityElement = productElement.querySelector('.quantity-counter');
    if (!quantityElement) {
        console.error(`Quantity element for product ${name} not found.`);
        return;
    }

    let currentQuantity = parseInt(quantityElement.innerText);

    // Only update if the new quantity is valid (not negative)
    if (currentQuantity + change >= 0) {
        currentQuantity += change;
        quantityElement.innerText = currentQuantity;

        // Calculate the total price for this product (quantity * price)
        const productPrice = product.price;
        const totalPrice = productPrice * currentQuantity;

        // Retrieve existing cart data from localStorage
        let cart = JSON.parse(localStorage.getItem('cart'));

        // If cart is null or not an array, initialize it as an empty array
        if (!Array.isArray(cart)) {
            cart = [];
        }

        // Check if the product already exists in the cart
        const existingProductIndex = cart.findIndex(item => item.name === name);
        if (existingProductIndex >= 0) {
            if (currentQuantity === 0) {
                // If quantity is 0, remove the product from the cart
                cart.splice(existingProductIndex, 1);
            } else {
                // Update the quantity and total price for the existing product in the cart
                cart[existingProductIndex].quantity = currentQuantity;
                cart[existingProductIndex].totalPrice = totalPrice;
            }
        } else if (currentQuantity > 0) {
            // Add the new product to the cart
            cart.push({
                name: name,
                price: productPrice,
                quantity: currentQuantity,
                totalPrice: totalPrice
            });
        }

        // Save the updated cart data back to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    updateCartUI(); // Refresh the cart UI after updating the quantity
}

function resetCart() {
    // Clear cart data from localStorage
    localStorage.setItem('cart', JSON.stringify([]));

    // Optionally update the cart UI to reflect the reset state
    updateCartUI();
}




// Function to load products and display them in the 'home' section
function loadProducts() {
    fetch('http://localhost:3019/api/products')  // Fetch from the backend API
        .then(response => response.json())
        .then(products => {
            const productsContainer = document.getElementById('products-container');
            if (products.length === 0) {
                productsContainer.innerHTML = '<p>No products available.</p>';
            } else {
                // Store product names and prices in localStorage
                const productDetails = products.map(product => ({
                    name: product.name,
                    price: product.price
                }));
                localStorage.setItem('productDetails', JSON.stringify(productDetails));

                // Display products in the container
                productsContainer.innerHTML = products.map(product => `
                    <article class="product" data-name="${product.name}" id="${product._id}-product">
                        <img src="/images/${product.name.toLowerCase().replace(/\s+/g, '')}.jpg" alt="${product.name}">
                        <h4>${product.name}</h4>
                        <p>${product.description}</p>
                        <p><strong>Price:</strong> Php ${product.price.toLocaleString()}</p>
                        <p><strong>Stock:</strong> ${product.stock}</p>
                        <div class="quantity-control">
                            <button class="quantity-btn" onclick="updateQuantity('${product.name}', -1)">-</button>
                            <span class="quantity-counter">0</span>
                            <button class="quantity-btn" onclick="updateQuantity('${product.name}', 1)">+</button>
                        </div>
                    </article>
                `).join('');
            }
        })
        .catch(err => {
            console.error('Error fetching products:', err);
            const productsContainer = document.getElementById('products-container');
            productsContainer.innerHTML = '<p>Failed to load products.</p>';
        });
}

// Add event listener to call loadProducts when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
});

function loadOrders() {
    const username = localStorage.getItem('Username');
    
    if (!username) {
        alert('User not logged in');
        return;
    }

    fetch(`http://localhost:3019/api/orders/${username}`)
        .then(response => response.json())
        .then(orders => {
            const ordersContainer = document.getElementById('orders-list');
            if (orders.length === 0) {
                ordersContainer.innerHTML = `<p>You have no orders.</p>`;
            } else {
                ordersContainer.innerHTML = orders.map(order => `
                    <li>
                        <strong>Order ID:</strong> ${order._id} <br>
                        <strong>Items:</strong> <br>
                        <ul>
                            ${order.cartData.map(item => `
                                <li>${item.name} (x${item.quantity})</li>
                            `).join('')}
                        </ul>
                        <strong>Total Price:</strong> Php ${order.totalPrice.toLocaleString()} <br>
                        <strong>Date:</strong> ${new Date(order.orderDate).toLocaleDateString()} <br>
                        <strong>Payment:</strong> ${order.payment || 'Not available'} <br>
                        <strong>Location:</strong> ${order.location || 'Not available'} <br>
                        <strong>Status:</strong> ${order.status || 'Not available'} <br>
                        <br>
                        <br>
                    </li>
                `).join('');
            }
        })
        .catch(err => {
            console.error('Error fetching orders:', err);
            document.getElementById('orders-list').innerHTML = '<p>You have no orders.</p>';
        });
}




