document.addEventListener("DOMContentLoaded", async () => {
    // Fetch products from the API and load into the catalog
    const response = await fetch('/api/products');
    const products = await response.json();

    const catalogContainer = document.getElementById('catalog-container');
    
    // Create a table to display the products
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Stock</th>
            </tr>
        </thead>
        <tbody>
            ${products.map(product => `
                <tr data-name="${product.name}">
                    <td><input type="text" value="${product.name}" class="product-name" /></td>
                    <td><input type="text" value="${product.description || ''}" class="product-description" /></td>
                    <td><input type="number" value="${product.price}" class="product-price" /></td>
                    <td><input type="number" value="${product.stock}" class="product-stock" /></td>
                    <td><button class="update-button">Update</button></td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    catalogContainer.appendChild(table);

    // Handle Update button click
    table.addEventListener('click', async (e) => {
        if (e.target.classList.contains('update-button')) {
            const row = e.target.closest('tr');
            const productName = row.getAttribute('data-name');
            const name = row.querySelector('.product-name').value;
            const description = row.querySelector('.product-description').value;
            const price = row.querySelector('.product-price').value;
            const stock = row.querySelector('.product-stock').value;

            const updatedProduct = {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock, 10)
            };

            // Send updated product to the backend
            const response = await fetch('/api/products', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: productName, ...updatedProduct }),  // Sending updated data
            });

            if (response.ok) {
                alert('Product updated successfully!');
            } else {
                alert('You cannot change the name of the product');
            }
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const addProductButton = document.getElementById('add-product');  // Updated ID

    if (addProductButton) {
        addProductButton.addEventListener('click', async (e) => {
            e.preventDefault();  // Prevent default button behavior

            console.log("Form Submitted");

            // Grab the input values
            const name = document.getElementById("product-name").value;
            const description = document.getElementById("product-description").value;
            const price = document.getElementById("product-price").value;
            const stock = document.getElementById("product-stock").value;

            // Check if you get the correct values in the console
            console.log(name, description, price, stock);

            if(!name || !description || !price || !stock) {
                alert('Please fill in all fields');
                return;
            }

            // Prepare the new product data
            const newProduct = {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock, 10)
            };

            try {
                const response = await fetch('/api/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newProduct)
                });

                if (response.ok) {
                    alert('Product added successfully!');
                    // Clear the form after adding the product
                    document.getElementById('new-product-form').reset();
                } else {
                    alert('Failed to add product');
                }
            } catch (err) {
                console.error('Error adding product:', err);
                alert('An error occurred while adding the product.');
            }
        });
    } else {
        console.error('Add product button not found');
    }
});


document.addEventListener("DOMContentLoaded", () => {
    // Get the delete button and input field
    const deleteButton = document.getElementById("delete-product");
    const deleteProductName = document.getElementById("delete-product-name");

    if (deleteButton){
        deleteButton.addEventListener("click", async (e) => {
            e.preventDefault(); // Prevent the default form submission behavior

            const productName = deleteProductName.value;

            if (!productName) {
                alert("Please enter a product name to delete.");
                return;
            }

            try {
                // Send a DELETE request to the backend to remove the product
                const response = await fetch(`/api/products/${productName}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    alert("Product deleted successfully!");
                    deleteProductName.value = ""; // Clear the input field
                } else {
                    alert("Failed to delete product. Make sure the product name is correct.");
                }
            } catch (err) {
                console.error("Error deleting product:", err);
                alert("An error occurred while deleting the product.");
            }
        });
    }
});
// Define the showSection function
function showSection(sectionId) {
    const sections = document.querySelectorAll('.inner-box.section');
    const links = document.querySelectorAll('.sidebar a, .navigation a');

    sections.forEach(section => section.classList.remove('active'));
    links.forEach(link => link.classList.remove('active-link'));

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active-link');
    }
}

// window.onload block
window.onload = function () {
    const links = document.querySelectorAll('.sidebar a');
    links.forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            showSection(link.getAttribute('data-section'));
        });
    });
};

// DOMContentLoaded block
document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".navigation a");
    const sections = document.querySelectorAll(".inner-box.section");

    links.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();

            const sectionId = link.getAttribute("data-section");

            // Remove active class from all sections and links
            sections.forEach(section => section.classList.remove("active"));
            links.forEach(link => link.classList.remove("active-link"));

            // Add active class to the clicked link and corresponding section
            document.getElementById(sectionId).classList.add("active");
            link.classList.add("active-link");

            // Check if the "account" section is activated
            if (sectionId === "account") {
                populateAccountInfo(); // Fetch and populate account info
            }
        });
    });
});






function getUserInfo() {
    return new Promise((resolve, reject) => {
        const Username = localStorage.getItem('Username');
        console.log('Username from localStorage:', Username);

        if (!Username) {
            reject('User not logged in.');
            return;
        }

        // Fetch user data from the API
        fetch(`/datas/${Username}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // Parse JSON from the response
            })
            .then(user => {
                resolve(user); // Resolve the Promise with the user data
            })
            .catch(error => {
                reject(error); // Reject the Promise with the error
            });
    });
}



function populateAccountInfo() {
    getUserInfo()
        .then(user => {
            const usernameElem = document.getElementById('Username');
            const firstNameElem = document.getElementById('FirstName');
            const lastNameElem = document.getElementById('LastName');
            const contactInfoElem = document.getElementById('ContactInfo');
            const addressElem = document.getElementById('Address');
            const employeeIdElem = document.getElementById('EmployeeID');

            if (usernameElem) usernameElem.innerText = user.Username || 'N/A';
            if (firstNameElem) firstNameElem.innerText = user.FirstName || 'N/A';
            if (lastNameElem) lastNameElem.innerText = user.LastName || 'N/A';
            if (contactInfoElem) contactInfoElem.innerText = user.ContactInfo || 'N/A';
            if (addressElem) addressElem.innerText = user.Address || 'N/A';
            if (employeeIdElem) employeeIdElem.innerText = user.EmployeeID || 'N/A';
        })
        .catch(error => {
            console.error('Error retrieving user info:', error);
            alert('An error occurred while retrieving user information. Please try again.');
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const ordersList = document.getElementById('all-orders');

    // Fetch all orders
    fetch('http://localhost:3019/api/orders')
        .then(response => response.json())  // Convert response to JSON
        .then(orders => {
            // Clear any existing content in the orders list
            ordersList.innerHTML = '';

            // Loop through the orders and append them to the list
            orders.forEach(order => {
                const li = document.createElement('li');
                
                // Display order details including cartData and totalPrice
                li.innerHTML = `
                <article>
                    <p><strong>Order ID:</strong> ${order._id}</p>
                    <p><strong>Customer Name:</strong> ${order.Username}</p>
                    <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p> 
                    
                    <h4>Cart Data:</h4>
                        ${order.cartData.map(item => `
                            <li>${item.name} (x${item.quantity}) - PHP ${item.price}</li>
                        `).join('')}

                    <p><strong>Total Price:</strong> ${order.totalPrice}</p>
                    <p><strong>Payment:</strong> <input type="text" value="${order.payment}" data-id="${order._id}" data-field="payment" class="editable" /></p>
                    <p><strong>Location:</strong> <input type="text" value="${order.location}" data-id="${order._id}" data-field="location" class="editable" /></p>
                    <p><strong>Status:</strong> <input type="text" value="${order.status}" data-id="${order._id}" data-field="status" class="editable" /></p>
                    
                    
                    <button class="update-button" data-id="${order._id}">Update Order</button>
                </article>
                `;
                ordersList.appendChild(li);
            });

            // Add event listener to update buttons
            const updateButtons = document.querySelectorAll('.update-button');
            updateButtons.forEach(button => {
                button.addEventListener('click', updateOrderDetails);
            });
        })
        .catch(error => console.error('Error fetching orders:', error));
});

function updateOrderDetails(event) {
    const orderId = event.target.dataset.id;

    const payment = document.querySelector(`input[data-id="${orderId}"][data-field="payment"]`).value;
    const location = document.querySelector(`input[data-id="${orderId}"][data-field="location"]`).value;
    const status = document.querySelector(`input[data-id="${orderId}"][data-field="status"]`).value;

    fetch(`http://localhost:3019/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payment, location, status }),
    })
    .then(response => response.json())
    .then(updatedOrder => {
        console.log('Order updated:', updatedOrder);
        alert('Order updated successfully!');
        
    })
    .catch(error => {
        console.error('Error updating order:', error);
    });
}






