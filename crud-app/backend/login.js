const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // Mencegah refresh halaman

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (response.ok) {
      alert('Login berhasil!');
      window.location.href = 'input-data.html'; // Ganti dengan nama halaman input data Anda
    } else {
      alert(`Login gagal: ${result.message}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Terjadi kesalahan, coba lagi nanti.');
  }
});
