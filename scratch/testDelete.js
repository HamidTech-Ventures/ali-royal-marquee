import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('http://localhost:5173/api/auth/login', {
      email: 'admin@admin.com',
      password: 'password'
    });
    
    const token = res.data.token;
    
    const customersRes = await axios.get('http://localhost:5173/api/customers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const customer = customersRes.data[0];
    if (!customer) {
      console.log('No customers found');
      return;
    }
    
    console.log(`Trying to delete customer: ${customer.name} (${customer.id})`);
    
    try {
      const delRes = await axios.delete(`http://localhost:5173/api/customers/${customer.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Delete succeeded!', delRes.status);
    } catch (err) {
      console.error('Delete failed:', err.response?.status, err.response?.data);
    }
    
  } catch (err) {
    console.error('Auth failed:', err.message);
  }
}

test();
