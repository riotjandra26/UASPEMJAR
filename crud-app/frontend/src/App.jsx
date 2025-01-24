import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './app.css';

const socket = io('http://localhost:5000');  // Koneksi ke server WebSocket

function App() {
  const [data, setData] = useState([]);
  const [namaBarang, setNamaBarang] = useState('');
  const [merkBarang, setMerkBarang] = useState('');
  const [harga, setHarga] = useState('');
  const [editId, setEditId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([]);

  // Fungsi untuk format Rupiah
  const formatRupiah = (angka) => {
    let reverse = angka.toString().replace(/[^,\d]/g, '').toString();
    let ribuan = reverse.split(',')[0];
    let sisa = reverse.split(',')[1];
    let formatRupiah = ribuan.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return sisa ? `${formatRupiah},${sisa}` : formatRupiah;
  };

  useEffect(() => {
    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });
    return () => {
      socket.off('chat message');
    };
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/barang');
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      if (response.status === 200) {
        setIsLoggedIn(true);
        setErrorMessage('');
      }
    } catch (error) {
      setErrorMessage('Username atau password salah');
      console.error('Login error:', error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/register', { username, password });
      if (response.status === 201) {
        setIsRegistering(false);
        setErrorMessage('');
      }
    } catch (error) {
      setErrorMessage('Registrasi gagal: Username sudah terdaftar');
      console.error('Registration error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      try {
        await axios.put(`http://localhost:5000/barang/${editId}`, {
          namaBarang,
          merkBarang,
          harga: harga.replace(/\./g, '').replace(',', '.'), // Menghapus titik dan mengganti koma menjadi titik
        });
        fetchData();
        setEditId(null);
      } catch (error) {
        console.error('Error updating data:', error);
      }
    } else {
      try {
        await axios.post('http://localhost:5000/barang', {
          namaBarang,
          merkBarang,
          harga: harga.replace(/\./g, '').replace(',', '.'), // Menghapus titik dan mengganti koma menjadi titik
        });
        fetchData();
      } catch (error) {
        console.error('Error adding data:', error);
      }
    }
    setNamaBarang('');
    setMerkBarang('');
    setHarga('');
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setNamaBarang(item.namaBarang);
    setMerkBarang(item.merkBarang);
    setHarga(formatRupiah(item.harga)); // Format harga saat mengedit
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/barang/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleHargaChange = (e) => {
    const inputHarga = e.target.value.replace(/\D/g, ''); // Menghapus karakter selain angka
    setHarga(formatRupiah(inputHarga)); // Mengupdate harga dengan format Rupiah
  };

  const handleLelang = (item) => {
    // Menampilkan alert saat tombol Lelang ditekan
    alert(`${item.namaBarang} ${item.merkBarang} sedang dilelang dengan harga: ${formatRupiah(item.harga)}`);
    
    // Logika lain untuk lelang bisa ditambahkan di sini
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (chatMessage) {
      socket.emit('chat message', chatMessage);  // Mengirim pesan ke server
      setChatMessage('');
    }
  };

  const handleLoginSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      if (response.status === 200) setIsLoggedIn(true);
    } catch {
      setErrorMessage('Login gagal');
    }
  };

  return (
    <div>
      {isLoggedIn && (
        <button onClick={handleLogout} style={logoutButtonStyle}>
          Logout
        </button>
      )}

      {!isLoggedIn && !isRegistering ? (
        <div>
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <div>
              <label htmlFor="username">Username: </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password">Password: </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">Login</button>
            <button type="button" onClick={() => setIsRegistering(true)}>Registrasi</button>
            {errorMessage && <p>{errorMessage}</p>}
          </form>
        </div>
      ) : isRegistering ? (
        <div>
          <h1>Registrasi</h1>
          <form onSubmit={handleRegister}>
            <div>
              <label htmlFor="username">Username: </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password">Password: </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">Daftar</button>
            <button type="button" onClick={() => setIsRegistering(false)}>Kembali ke Login</button>
            {errorMessage && <p>{errorMessage}</p>}
          </form>
        </div>
      ) : (
        <div>
          <h1>Manajemen Barang Lelang</h1>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="namaBarang">Nama Barang: </label>
              <input
                type="text"
                id="namaBarang"
                value={namaBarang}
                onChange={(e) => setNamaBarang(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="merkBarang">Merk Barang: </label>
              <input
                type="text"
                id="merkBarang"
                value={merkBarang}
                onChange={(e) => setMerkBarang(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="harga">Harga Lelang: </label>
              <input
                type="text"
                id="harga"
                value={harga}
                onChange={handleHargaChange} // Menambahkan event handler untuk input harga
                required
              />
            </div>
            <button type="submit">{editId ? 'Update' : 'Tambahkan'}</button>
          </form>
          <table>
            <thead>
              <tr>
                <th>Nama Barang</th>
                <th>Merk Barang</th>
                <th>Harga Lelang</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{item.namaBarang}</td>
                  <td>{item.merkBarang}</td>
                  <td>{formatRupiah(item.harga)}</td>
                  <td>
                    <button onClick={() => handleEdit(item)}>Edit</button>
                    <button onClick={() => handleDelete(item.id)}>Hapus</button>
                    <button onClick={() => handleLelang(item)}>Lelang</button> {/* Tombol Lelang */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Chat
          <h2>Chat</h2>
          <form onSubmit={handleChatSubmit}>
            <input value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} />
            <button type="submit">Kirim</button>
          </form>
          <ul>
            {messages.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul> */}
           {/* Chat */}
           <div>
            <h2>Chat</h2>
            <form onSubmit={handleChatSubmit}>
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ketik pesan"
              />
              <button type="submit">Kirim</button>
            </form>
            <div>
              <h3>Pesan:</h3>
              <ul>
                {messages.map((msg, index) => (
                  <li key={index}>{msg}</li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

const logoutButtonStyle = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  padding: '10px 20px',
  backgroundColor: '#f44336',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px',
};

export default App;
