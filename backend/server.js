const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = "supersecretkey123";

// Mock Database arrays for this example
let users = []; 
let products = [{ id: 1, title: 'Smartphone', price: 15000, stock: 10 }];
let orders = [{ id: 101, customer_id: 3, worker_id: null, status: 'pending', total_amount: 15000 }];

// Middleware to check Login and Role
const authorize = (roles = []) => {
    return (req, res, next) => {
        const token = req.headers['authorization'];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;

            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Access Denied: Unauthorized role' });
            }
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    };
};

// --- AUTH ROUTES ---
app.post('/api/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ id: users.length + 1, name, email, password: hashedPassword, role: role || 'customer' });
    res.json({ message: "User registered successfully!" });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    res.json({ token, role: user.role });
});

// --- ROLE-BASED ROUTES ---

// 1. PUBLIC: Anyone can browse products
app.get('/api/products', (req, res) => res.json(products));

// 2. ADMIN ONLY: Can add products
app.post('/api/products', authorize(['admin']), (req, res) => {
    products.push({ id: products.length + 1, ...req.body });
    res.json({ message: "Product added by Admin!" });
});

// 3. WORKER & ADMIN: Workers can view assigned orders and update delivery status
app.get('/api/worker/orders', authorize(['worker', 'admin']), (req, res) => {
    const workerOrders = orders.filter(o => o.worker_id === req.user.id || o.worker_id === null);
    res.json(workerOrders);
});

app.put('/api/orders/:id', authorize(['worker', 'admin']), (req, res) => {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    if (order) {
        order.status = req.body.status;
        return res.json({ message: `Order status updated to ${req.body.status}` });
    }
    res.status(404).json({ message: "Order not found" });
});

app.listen(5000, () => console.log('Backend running on port 5000'));
