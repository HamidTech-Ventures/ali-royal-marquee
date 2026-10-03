const axios = require('axios');
async function test() {
  try {
    const api = axios.create({ baseURL: 'http://localhost:5020/api' });
    const loginRes = await api.post('/auth/login', {
      email: 'admin@codepispor.com',
      password: 'admin'
    }).catch(() => api.post('/auth/login', {
      email: 'admin@codepispor.com',
      password: 'password'
    }));
    
    console.log('Login success!');
    const token = loginRes.data.accessToken;
    const authHeaders = { Authorization: `Bearer ${token}` };
    
    const customersRes = await api.get('/customers', { headers: authHeaders });
    console.log('Customers typeof data:', typeof customersRes.data);
    console.log('Is Array?', Array.isArray(customersRes.data));
    console.log('Keys if object:', Object.keys(customersRes.data));
    
  } catch (e) {
    console.error('Error:', e.response ? e.response.status + ' ' + JSON.stringify(e.response.data) : e.message);
  }
}
test();
