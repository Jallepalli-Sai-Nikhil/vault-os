import { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { Profile, Role } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export function Admin() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<Role>('viewer');
  const [msg, setMsg] = useState('');
  
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*').order('email');
    if (data) setProfiles(data);
    setLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseAdmin) {
      setMsg('Error: SERVICE_ROLE_KEY is required to create users arbitrarily.');
      return;
    }
    
    setMsg('Creating user...');
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: newEmail,
      password: newPassword,
      email_confirm: true
    });

    if (error) {
      setMsg(`Error: ${error.message}`);
      return;
    }

    if (data?.user) {
      // Create profile entry
      await supabaseAdmin.from('profiles').insert({
        id: data.user.id,
        email: newEmail,
        role: newRole
      });
      setMsg('User created successfully.');
      setNewEmail('');
      setNewPassword('');
      fetchProfiles();
    }
  };

  const handleChangePassword = async (uid: string) => {
    if (!supabaseAdmin) {
      alert('Error: SERVICE_ROLE_KEY is missing.');
      return;
    }
    const pwd = prompt('Enter new password for user:');
    if (!pwd) return;
    
    const { error } = await supabaseAdmin.auth.admin.updateUserById(uid, { password: pwd });
    if (error) alert(`Error: ${error.message}`);
    else alert('Password updated successfully.');
  };

  const handleChangeRole = async (uid: string, newRole: string) => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', uid);
    if (error) alert(`Error: ${error.message}`);
    else fetchProfiles();
  };

  if (loading) return <div className="p-10 text-white font-mono">Loading Admin...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-mono p-10">
      <div className="flex justify-between items-center mb-10 border-b border-[#333] pb-4">
        <h1 className="text-2xl tracking-widest uppercase">Admin Control Panel</h1>
        <button onClick={() => navigate('/app')} className="px-4 py-2 border border-[#333] hover:bg-[#1a1a1a]">Back to App</button>
      </div>

      {msg && <div className="mb-6 p-4 border border-[#66fcf1] text-[#66fcf1]">{msg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="col-span-1 border border-[#333] p-6 bg-[#111]">
          <h2 className="text-xl mb-6 tracking-widest uppercase">Provision User</h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs uppercase text-gray-500 mb-1">Email</label>
              <input type="email" value={newEmail} onChange={e=>setNewEmail(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#333] p-2 text-white outline-none" required />
            </div>
            <div>
              <label className="block text-xs uppercase text-gray-500 mb-1">Initial Password</label>
              <input type="text" value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#333] p-2 text-white outline-none" required minLength={6} />
            </div>
            <div>
              <label className="block text-xs uppercase text-gray-500 mb-1">Role</label>
              <select value={newRole} onChange={e=>setNewRole(e.target.value as Role)} className="w-full bg-[#1a1a1a] border border-[#333] p-2 text-white outline-none">
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
                <option value="god_admin">God Admin</option>
              </select>
            </div>
            <button type="submit" className="w-full mt-4 py-3 bg-[#66fcf1] text-black uppercase text-xs font-bold hover:bg-white transition-colors">
              Create User
            </button>
          </form>
        </div>

        <div className="col-span-2 border border-[#333] p-6 bg-[#111]">
          <h2 className="text-xl mb-6 tracking-widest uppercase">Access Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-500 border-b border-[#333]">
                <tr>
                  <th className="pb-3 px-4">Email</th>
                  <th className="pb-3 px-4">Role</th>
                  <th className="pb-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map(p => (
                  <tr key={p.id} className="border-b border-[#222]">
                    <td className="py-4 px-4">{p.email}</td>
                    <td className="py-4 px-4">
                      <select 
                        value={p.role} 
                        onChange={(e) => handleChangeRole(p.id, e.target.value)}
                        disabled={profile?.role !== 'god_admin' && p.role === 'god_admin'}
                        className="bg-[#1a1a1a] border border-[#333] p-1 text-white outline-none"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                        <option value="god_admin">God Admin</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 space-x-2">
                      <button onClick={() => handleChangePassword(p.id)} className="text-xs border border-[#333] px-3 py-1 hover:bg-[#1a1a1a]">Set Password</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
