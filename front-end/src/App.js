import React, { useState } from 'react';

function App() {
  const [role, setRole] = useState(localStorage.getItem('role') || 'guest');
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const handleLogin = (userRole, userToken) => {
      setRole(userRole);
      setToken(userToken);
      localStorage.setItem('role', userRole);
      localStorage.setItem('token', userToken);
  };

  const handleLogout = () => {
      setRole('guest');
      localStorage.clear();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Flipkart Clone Ecosystem</h1>
      <p>Logged in as: <strong>{role.toUpperCase()}</strong></p>
      
      {role !== 'guest' && <button onClick={handleLogout}>Logout</button>}

      {/* GUEST VIEW */}
      {role === 'guest' && (
        <div>
          <h3>Login to your account</h3>
          <button onClick={() => handleLogin('customer', 'cust_token')}>Login as Customer</button>
          <button style={{ marginLeft: '10px' }} onClick={() => handleLogin('worker', 'work_token')}>Login as Worker</button>
          <button style={{ marginLeft: '10px' }} onClick={() => handleLogin('admin', 'admin_token')}>Login as Admin</button>
        </div>
      )}

      {/* CUSTOMER VIEW */}
      {(role === 'customer' || role === 'guest') && (
        <div style={{ marginTop: '30px', border: '1px solid #ccc', padding: '15px' }}>
          <h2>🛍️ Customer Shopping Area</h2>
          <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ border: '1px solid #ddd', padding: '10px' }}>
                  <h4>Smartphone</h4>
                  <p>Price: ₹15,000</p>
                  <button disabled={role === 'guest'}>Add to Cart</button>
              </div>
          </div>
        </div>
      )}

      {/* WORKER VIEW */}
      {role === 'worker' && (
        <div style={{ marginTop: '30px', border: '1px solid orange', padding: '15px' }}>
          <h2>🚚 Worker / Delivery Dashboard</h2>
          <p>Order #101 - Smartphone (Status: Pending)</p>
          <button onClick={() => alert('Marked as Delivered!')}>Mark as Delivered</button>
        </div>
      )}

      {/* ADMIN VIEW */}
      {role === 'admin' && (
        <div style={{ marginTop: '30px', border: '1px solid red', padding: '15px' }}>
          <h2>⚙️ Admin Control Panel</h2>
          <button onClick={() => alert('Product Added!')}>+ Add New Product</button>
          <button style={{ marginLeft: '10px' }}>View Sales Analytics</button>
          <button style={{ marginLeft: '10px' }}>Manage Workers</button>
        </div>
      )}
    </div>
  );
}

export default App;
