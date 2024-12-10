const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3019;

const app = express();
app.use(express.static(path.join(__dirname)));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/mitazanagrisupply');
const db = mongoose.connection;
db.once('open', () => {
    console.log("Connected to MongoDB");
});

const userSchema = new mongoose.Schema({
    FirstName: String,
    LastName: String,
    ContactInfo: String,
    Address: String,
    Username: String,
    Password: String,
    Role: String,
    EmployeeID: String
});

const Users = mongoose.model("datas", userSchema);

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    stock: Number
});

const Product = mongoose.model("products", productSchema);

const orderSchema = new mongoose.Schema({
    Username: { type: String, required: true },
    cartData: { type: Array, required: true }, 
    totalPrice: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    payment: { type: String, default: 'Not available' },  
    location: { type: String, default: 'Not available' }, 
    status: { type: String, default: 'Not available' },  
});

const Order = mongoose.model('Order', orderSchema);

app.post('/signup', async (req, res) => {
    const { FirstName, LastName, ContactInfo, Address, Username, Password, Role, EmployeeID } = req.body;
    try {
        const existingUser = await Users.findOne({ Username });
        if (existingUser) {
            return res.status(400).send('Username is already taken');
        }
        const user = new Users({
            FirstName,
            LastName,
            ContactInfo,
            Address,
            Username,
            Password,
            Role,
            EmployeeID
        });

        await user.save();
        res.redirect('/index.html');

    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving data');
    }
});

app.post('/login', async (req, res) => {
    const { Username, Password } = req.body;
    try {
        const user = await Users.findOne({ Username: Username });
        if (!user) {
            return res.status(401).send('Invalid username or password');
        }

        if (user.Password !== Password) {
            return res.status(401).send('Invalid username or password');
        }

        res.json({
            Username: user.Username,
            FirstName: user.FirstName,
            LastName: user.LastName,
            ContactInfo: user.ContactInfo,
            Address: user.Address,
            EmployeeID: user.EmployeeID
        });

    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('An error occurred on the server');
    }
});

app.get('/datas/:Username', async (req, res) => {
    const username = req.params.Username;
    try {
        const user = await Users.findOne({ Username: username });
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.json(user);
    } catch (err) {
        console.error('Error retrieving user:', err);
        res.status(500).send('Server error');
    }
});

app.post('/recover', async (req, res) => {
    const { Username, FirstName, LastName, NewPassword } = req.body;
    try {
        const user = await Users.findOne({ Username: Username });
        if (!user) {
            return res.status(404).send('User not found');
        }
        if (user.FirstName !== FirstName || user.LastName !== LastName) {
            return res.status(400).send('Incorrect details provided');
        }
        user.Password = NewPassword;
        await user.save();
        res.redirect('/index.html');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving data');
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find(); 
        res.json(products); 
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).send('Error fetching products');
    }
});

app.post('/api/orders', async (req, res) => {
    const { Username, cartData, totalPrice } = req.body;

    try {
        for (const item of cartData) {
            const product = await Product.findOne({ name: item.name });
            if (!product) {
                return res.status(404).send(`Product not found: ${item.name}`);
            }

            if (product.stock < item.quantity) {
                return res.status(400).send(`Insufficient stock for product: ${item.name}`);
            }

            product.stock -= item.quantity;
            await product.save(); 
        }

        const newOrder = new Order({
            Username,
            cartData,
            totalPrice,
            orderDate: new Date(),
            payment: 'Pending',
            location: 'Not specified',
            status: 'Pending',
        });

        const savedOrder = await newOrder.save(); 
        res.json(savedOrder); 
    } catch (error) {
        console.error('Error processing order:', error);
        res.status(500).send('Failed to process order: ' + error.message);
    }
});

app.get('/api/orders/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const orders = await Order.find({ Username: username });
        res.json(orders);  
    } catch (error) {
        res.status(500).send('Error fetching orders: ' + error);
    }
});

app.put('/api/products', async (req, res) => {
    const { name, description, price, stock } = req.body;

    try {
        const updatedProduct = await Product.findOneAndUpdate(
            { name },  
            { $set: { description, price, stock } },  
            { new: true }  
        );

        if (!updatedProduct) {
            return res.status(404).send('Product not found');
        }

        res.json(updatedProduct);  
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).send('Error updating product');
    }
});

app.post('/api/products', async (req, res) => {
    const { name, description, price, stock } = req.body;

    try {
        const newProduct = new Product({
            name,
            description,
            price,
            stock
        });

        await newProduct.save();

        res.status(201).json(newProduct);  
    } catch (err) {
        console.error('Error adding product:', err);
        res.status(500).send('Error adding product');
    }
});

app.delete('/api/products/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const result = await Product.findOneAndDelete({ name });

        if (result) {
            res.status(200).json({ message: 'Product deleted successfully' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ message: 'Error deleting product' });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find({});
        res.json(orders);
    } catch (error) {
        res.status(500).send('Error retrieving orders');
    }
});

app.put('/api/orders/:id', async (req, res) => {
    const { id } = req.params;
    const { payment, location, status } = req.body;

    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { $set: { payment, location, status } },
            { new: true }  
        );

        if (!updatedOrder) {
            return res.status(404).send('Order not found');
        }

        res.json(updatedOrder);  
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).send('Error updating order');
    }
});

app.listen(port, () => {
    console.log('Server running on http://localhost:3019');
});
