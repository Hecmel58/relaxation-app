import axios from 'axios';

const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export function Api() {
  const client = axios.create({ baseURL: base });

  function setToken(token:string|null) {
    if (token) client.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    else delete client.defaults.headers.common['Authorization'];
  }

  return {
    setToken,
    async health() { const res = await client.get('/api/health'); return res.data; },
    async login(phone:string, pass:string){ const res = await client.post('/api/auth/login', { phone, password: pass }); if (res.data.token) setToken(res.data.token); return res.data; },
    async register(payload:any){ const res = await client.post('/api/auth/register', payload); if (res.data.token) setToken(res.data.token); return res.data; },
    async createPhys(payload:any){ const res = await client.post('/api/physiological-records', payload); return res.data; },
    async getPhys(userId?:string,start?:string,end?:string){ const params:any = {}; if(userId) params.userId=userId; if(start) params.startDate=start; if(end) params.endDate=end; const res = await client.get('/api/physiological-records',{params}); return res.data; },
    async getUsers(){ const res = await client.get('/api/users'); return res.data; },
    async createSupport(payload:any){ const res = await client.post('/api/support-requests', payload); return res.data; }
  };
}
