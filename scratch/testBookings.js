const axios = require('axios');
axios.get('http://localhost:5000/api/bookings', {
  headers: {
    // We don't have token but it might be protected. Let's see if we get 401.
  }
}).then(res => console.log(res.data.items.length)).catch(console.error);
