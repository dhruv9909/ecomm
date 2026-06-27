import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true, // critical for cookies to be sent and received
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
