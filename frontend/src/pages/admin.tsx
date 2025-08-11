import React, { useEffect, useState } from 'react';

export default function Admin({ api }: any){
  const [users,setUsers] = useState<any[]>([]);
  useEffect(()=>{ (async ()=>{ try { const res = await api.getUsers(); setUsers(res.users || []); } catch(e){ console.error(e); } })(); },[]);
  return (
    <div className="card">
      <h2 className="text-3xl font-bold mb-4">Yönetici Paneli</h2>
      <div>
        <h3 className="font-semibold">Kullanıcılar</h3>
        <table className="w-full text-left mt-3">
          <thead><tr><th>Id</th><th>Telefon</th><th>İsim</th><th>Rol</th></tr></thead>
          <tbody>
            {users.map(u=>(
              <tr key={u.id}><td className="pr-4">{u.id.slice(0,6)}</td><td>{u.phone}</td><td>{u.name}</td><td>{u.role}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
