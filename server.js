require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Koneksi ke Neon Database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Bikin tabel otomatis kalau belum ada
const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                date VARCHAR(50),
                merchant VARCHAR(100),
                order_id VARCHAR(100) UNIQUE,
                idr BIGINT,
                usdt DECIMAL(18,6)
            )
        `);
        console.log("Database tersambung & tabel siap.");
    } catch (err) {
        console.error("Gagal konek database:", err);
    }
};
initDB();

// API: Ambil semua data
app.get('/api/transactions', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM transactions ORDER BY date DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Tambah data baru
app.post('/api/transactions', async (req, res) => {
    const { date, merchant, orderId, idr, usdt } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO transactions (date, merchant, order_id, idr, usdt) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [date, merchant, orderId, idr, usdt]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            res.status(400).json({ error: 'Transaksi duplikat!' });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

// API: Hapus satu data
app.delete('/api/transactions/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM transactions WHERE id = $1', [req.params.id]);
        res.json({ message: 'Dihapus' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Hapus semua data
app.delete('/api/transactions', async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE transactions RESTART IDENTITY');
        res.json({ message: 'Semua data dihapus' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Jalanin server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));