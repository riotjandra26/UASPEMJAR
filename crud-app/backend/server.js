const express = require('express');
const http = require('http');
const mysql = require('mysql');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Sesuaikan dengan URL frontend Anda
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

const port = 5000;

app.use(cors());
app.use(express.json());

// Konfigurasi koneksi database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'lelang_db',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});

// Middleware untuk validasi input kosong
const validateInput = (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send('Username dan password wajib diisi');
  }
  next();
};

// Endpoint untuk login
app.post('/login', validateInput, (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Error checking login credentials:', err);
      return res.status(500).send('Terjadi kesalahan pada server');
    }

    if (results.length === 0) {
      return res.status(401).send('Username atau password salah');
    }

    res.send('Login berhasil');
  });
});

// Endpoint untuk mengambil semua data barang
app.get('/barang', (req, res) => {
  const query = 'SELECT * FROM barang';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).send('Terjadi kesalahan pada server');
    }

    res.json({
      message: 'Berhasil mendapatkan data',
      data: results,
    });
  });
});

// Endpoint untuk menambah data barang baru
app.post('/barang', (req, res) => {
  const { namaBarang, merkBarang, harga } = req.body;

  if (!namaBarang || !merkBarang || !harga) {
    return res.status(400).send('Semua field wajib diisi');
  }

  const query = 'INSERT INTO barang (namaBarang, merkBarang, harga) VALUES (?, ?, ?)';
  db.query(query, [namaBarang, merkBarang, harga], (err) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).send('Terjadi kesalahan pada server');
    }

    res.status(201).send('Data berhasil ditambahkan');
  });
});

// Endpoint untuk memperbarui data barang berdasarkan ID
app.put('/barang/:id', (req, res) => {
  const { id } = req.params;
  const { namaBarang, merkBarang, harga } = req.body;

  if (!namaBarang || !merkBarang || !harga) {
    return res.status(400).send('Semua field wajib diisi');
  }

  const query = 'UPDATE barang SET namaBarang = ?, merkBarang = ?, harga = ? WHERE id = ?';
  db.query(query, [namaBarang, merkBarang, harga, id], (err, results) => {
    if (err) {
      console.error('Error updating data:', err);
      return res.status(500).send('Terjadi kesalahan pada server');
    }

    if (results.affectedRows === 0) {
      return res.status(404).send('Data tidak ditemukan');
    }

    res.send('Data berhasil diperbarui');
  });
});

// Endpoint untuk menghapus data barang berdasarkan ID
app.delete('/barang/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM barang WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error deleting data:', err);
      return res.status(500).send('Terjadi kesalahan pada server');
    }

    if (results.affectedRows === 0) {
      return res.status(404).send('Data tidak ditemukan');
    }

    res.send('Data berhasil dihapus');
  });
});

// Endpoint untuk registrasi user
app.post('/register', validateInput, (req, res) => {
  const { username, password } = req.body;

  const checkQuery = 'SELECT * FROM users WHERE username = ?';
  db.query(checkQuery, [username], (err, results) => {
    if (err) {
      console.error('Error checking username:', err);
      return res.status(500).send('Terjadi kesalahan pada server');
    }

    if (results.length > 0) {
      return res.status(400).send('Username sudah terdaftar');
    }

    const insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(insertQuery, [username, password], (err) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).send('Terjadi kesalahan pada server');
      }

      res.status(201).send('User berhasil didaftarkan');
    });
  });
});

// WebSocket Chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('chat message', (msg) => {
    console.log('Message received:', msg);
    io.emit('chat message', msg); // Broadcast pesan ke semua client
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
