'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export const dynamic = "force-dynamic"; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push('/home'); // redirige a dashboard tras login
    }
  };

  return (
    <div style={{ display:'flex', justifyContent:'center', marginTop: '100px', flexDirection:'column', alignItems:'center' }}>
      <h1>Login</h1>
      <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', width: '300px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ marginBottom: '10px', padding: '8px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ marginBottom: '10px', padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px' }}>Login</button>
      </form>
      {errorMsg && <p style={{ color:'red' }}>{errorMsg}</p>}
    </div>
  );
}
