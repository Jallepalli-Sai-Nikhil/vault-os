import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setSession } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Auto-provisioning logic for the requested admin
        if (email === 'sainikhil.jallepalli@gmail.com' && password === 'nikhilAdmin' && error.message.includes('Invalid login credentials')) {
          const { supabaseAdmin } = await import('../lib/supabase');
          if (supabaseAdmin) {
            console.log('Auto-provisioning Master Admin...');
            const { data: newUser } = await supabaseAdmin.auth.admin.createUser({
              email,
              password,
              email_confirm: true
            });
            if (newUser?.user) {
              await supabaseAdmin.from('profiles').insert({
                id: newUser.user.id,
                email,
                role: 'god_admin'
              });
              // Try login again
              const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({ email, password });
              if (retryError) throw retryError;
              setSession(retryData.session);
              navigate('/app');
              return;
            }
          } else {
            throw new Error('SERVICE_ROLE_KEY required to auto-provision the admin.');
          }
        }
        throw error;
      }
      
      setSession(data.session);
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white font-mono">
      <div className="w-full max-w-md p-8 border border-[#333] bg-[#111]">
        <h1 className="text-2xl mb-8 tracking-widest uppercase text-center border-b border-[#333] pb-4">
          Vault Access
        </h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
              Identity (Email)
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white focus:outline-none focus:border-[#66fcf1]"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
              Passphrase
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white focus:outline-none focus:border-[#66fcf1]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 uppercase tracking-widest text-xs font-bold bg-[#66fcf1] text-black hover:bg-white transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enter Vault'}
          </button>
        </form>
      </div>
    </div>
  );
}
