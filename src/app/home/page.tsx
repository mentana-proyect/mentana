'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        router.push('/auth');
      } else {
        setUser(data.session.user);
      }
    };

    checkSession();
  }, [router]);

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome, {user.email}</h1>
    </div>
  );
}
