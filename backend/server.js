const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { Pool } = require('pg'); // Import the pg library

const app = express();
app.use(express.json());
app.use(cors());

// 1. CONNECTION POOL: Connects to your live database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Render's free tier
    }
});

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// --- AUTH MIDDLEWARE ---
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

// --- ROUTES ---

// 1. Register (Now saves to DB)
app.post('/api/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, hashedPassword, role || 'customer']
        );
        res.json({ message: "User registered!", user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Login (Checks DB)
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

// 3. Get Products (Live Data)
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Add Product (Admin Only)
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
