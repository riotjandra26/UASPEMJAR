// Lelang.jsx
import React, { useState } from 'react';

function Lelang() {
  const [hargaTawar, setHargaTawar] = useState('');

  const handleTawar = (e) => {
    e.preventDefault();
    alert(`Harga yang ditawarkan: Rp ${hargaTawar}`);
    // Logika tawar menawar harga bisa ditambahkan di sini
  };

  return (
    <div>
      <h1>Tawar Menawar Harga</h1>
      <form onSubmit={handleTawar}>
        <div>
          <label htmlFor="hargaTawar">Harga Tawar: </label>
          <input
            type="number"
            id="hargaTawar"
            value={hargaTawar}
            onChange={(e) => setHargaTawar(e.target.value)}
            required
          />
        </div>
        <button type="submit">Tawar</button>
      </form>
    </div>
  );
}

export default Lelang;
