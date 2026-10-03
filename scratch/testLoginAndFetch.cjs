const axios = require('axios');
const fs = require('fs');

async function test() {
  try {
    const api = axios.create({ baseURL: 'http://localhost:5020/api' });
    
    // Login
    const loginRes = await api.post('/auth/login', {
      email: 'admin@aliroyal.com',
      password: 'admin' // Or try typical default password
    });
    
    console.log('Login success!', loginRes.data.accessToken ? 'Got Token' : 'No Token');
    
    const token = loginRes.data.accessToken;
    const authHeaders = { Authorization: `Bearer ${token}` };
    
    // Fetch bookings
    const bookingsRes = await api.get('/bookings', { headers: authHeaders });
    console.log('Bookings length:', bookingsRes.data.items?.length);
    console.log('Sample booking:', bookingsRes.data.items?.[0] || null);

    // Fetch customers
    const customersRes = await api.get('/customers', { headers: authHeaders });
    console.log('Customers length:', customersRes.data.items?.length || customersRes.data?.length);

  } catch (e) {
    if (e.response) {
      console.error('API Error:', e.response.status, e.response.data);
    } else {
      console.error('Error:', e.message);
    }
  }
}
test();
