// Function to update the cart UI
function updateCartUI() {
    // Retrieve the cart data from localStorage
    const cart = JSON.parse(localStorage.getItem('cart'));

    // Check if cart is null or empty
    if (!cart || cart.length === 0) {
        // If the cart is empty, display a message
        document.getElementById('cart-container').innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    // Get the cart container element
    const cartContainer = document.getElementById('cart-container');

    // Create the cart items list
    const cartItemsHtml = cart.map(item => {
        return `
            <div class="cart-item">
                <h4>Product: ${item.name}</h4>
                <p><strong>Quantity:</strong> ${item.quantity}</p>
                <p><strong>Price:</strong> Php ${item.price.toLocaleString()}</p>
                <p><strong>Total:</strong> Php ${item.totalPrice.toLocaleString()}</p>
            </div>
        `;
    }).join('');

    // Set the cart items in the cart container
    cartContainer.innerHTML = `
        <h2>Shopping Cart</h2>
        ${cartItemsHtml}
        <div class="cart-total">
            <strong>Total Price:</strong> Php ${cart.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()}
            <br>
        </div>
        <button type="submit" id="checkout" class="checkout-btn">Checkout</button>
    `;

    


// Checkout button handler
document.getElementById('checkout').addEventListener('click', () => {
    if (Object.keys(cart).length === 0) {
        alert('Your cart is empty.');
    } else {
        alert('Proceeding to checkout...');

        window.location.href = 'checkout.html';
    }
});
}

