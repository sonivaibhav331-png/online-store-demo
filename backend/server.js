const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { Pool } = require('pg'); // Import pg library

const app = express();
app.use(express.json());
app.use(cors());

// 1. DATABASE CONFIGURATION
// This explicitly uses the separated environment variables to avoid credential parsing errors.
// const pool = new Pool({
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     port: process.env.DB_PORT || 5432,
    
//     // Forces SSL requirement since we are using the External hostname over public internet
//     ssl: { rejectUnauthorized: false }, 
    
//     // Prevent ECONNRESET by killing stale idle connections quickly
//     idleTimeoutMillis: 1000, 
//     connectionTimeoutMillis: 5000,
// });

// const pool = new Pool({
//     user: 'YOUR_RENDER_DB_USER',       // e.g., 'flipkart_user_xxxx'
//     password: 'YOUR_RENDER_DB_PASSWORD', // e.g., 'AbCdEfGhIjKlMnOpQrSt'
//     host: 'YOUR_RENDER_DB_HOST',         // e.g., '://render.com'
//     database: 'YOUR_RENDER_DB_NAME',     // e.g., 'flipkart_db_xxxx'
//     port: 5432,
//     ssl: { rejectUnauthorized: false }, 
//     idleTimeoutMillis: 1000, 
//     connectionTimeoutMillis: 5000,
// });
const pool = new Pool({
    user: 'vicky',       // e.g., 'flipkart_user_xxxx'
    password: 'lNl1Xoa67OmutjOG0N46XJtksunWQGb5', // e.g., 'AbCdEfGhIjKlMnOpQrSt'
    host: 'dpg-d77aa0h5pdvs73bl3rp0-a',         // e.g., '://render.com'
    database: 'postgresql://vicky:lNl1Xoa67OmutjOG0N46XJtksunWQGb5@dpg-d77aa0h5pdvs73bl3rp0-a/flipkart_5g9z',     // e.g., 'flipkart_db_xxxx'
    port: 5432,
    ssl: { rejectUnauthorized: false }, 
    idleTimeoutMillis: 1000, 
    connectionTimeoutMillis: 5000,
});

// Catch errors on the client pool so it doesn't crash your server
pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
});

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// 2. AUTH MIDDLEWARE
const authorize = (roles = []) => {
    return (req, res, next) => {
        const token = req.headers['authorization'];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Unauthorized role' });
            }
            next();
        } catch (err) {
            res.status(401).json({ message: 'Invalid token' });
        }
    };
};

// 3. API ROUTES

// Public: Browse Products
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Auth: Register (Saves to DB)
app.post('/api/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashedPassword, role || 'customer']
        );
        res.json({ message: "User registered successfully!", user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Auth: Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
        res.json({ token, role: user.role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Only: Add Product
app.post('/api/products', authorize(['admin']), async (req, res) => {
    const { title, price, description } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO products (title, price, description) VALUES ($1, $2, $3) RETURNING *',
            [title, price, description]
        );
        res.json({ message: "Product added!", product: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Worker/Admin Only: View Delivery Assignments
app.get('/api/worker/orders', authorize(['worker', 'admin']), async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM orders WHERE worker_id = $1 OR worker_id IS NULL', [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. SERVER START & DB CONNECTION TEST
const PORT = process.env.PORT || 10000;
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    
    // Immediate verification query to confirm DB link
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('✅ DATABASE CONNECTED SUCCESSFULLY AT:', res.rows[0].now);
    } catch (err) {
        console.error('❌ DATABASE CONNECTION ERROR:', err.message);
    }
});
