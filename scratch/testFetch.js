import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('http://localhost:5173/api/auth/login', {
      email: 'admin@admin.com',
      password: 'password'
    });
    
    const token = res.data.token;
    
    console.log('Fetching customers...');
    const customersRes = await axios.get('http://localhost:5173/api/customers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`Success! Fetched ${customersRes.data.length} customers.`);
  } catch (err) {
    console.error('Fetch failed:', err.response?.status, err.response?.data || err.message);
  }
}

test();
