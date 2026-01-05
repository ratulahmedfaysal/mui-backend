const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb', strict: false }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
            return mongoose;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

// Connect immediately
connectDB().then(() => console.log('Connected to MongoDB'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/pairs', require('./routes/pairs'));
app.use('/api/database', require('./routes/database'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/spinner', require('./routes/spinner'));
app.use('/api/users', require('./routes/users'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/referrals', require('./routes/referrals'));
app.use('/api/payment-methods', require('./routes/payment_methods'));
app.use('/api/dev', require('./routes/dev'));
app.use('/api/investments', require('./routes/investments'));
app.use('/api/investment-plans', require('./routes/investment_plans'));
app.use('/api/admin', require('./routes/admin_stats')); // New route
app.use('/api/transactions', require('./routes/user_transactions'));
app.use('/api/upload', require('./routes/upload'));
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Backend is running',
        env: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Route
app.get('/', (req, res) => {
    res.send('AuraBit API is running');
});

// Start Server
// Connect to DB and Start Server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log('Database routes registered.');
    });
});

module.exports = app;
