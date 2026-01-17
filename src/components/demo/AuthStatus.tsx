'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export function AuthStatus() {
  const [status, setStatus] = useState<{ authenticated: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to check auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setStatus({ authenticated: false });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Checking auth...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {status?.authenticated ? (
        <>
          <Badge
            variant="outline"
            className="border-green-500/30 bg-green-500/10 text-green-500"
          >
            Google Connected
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Disconnect
          </Button>
        </>
      ) : (
        <>
          <Badge
            variant="outline"
            className="border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
          >
            Not Connected
          </Badge>
          <Button variant="outline" size="sm" onClick={handleLogin}>
            Connect Google
          </Button>
        </>
      )}
    </div>
  );
}
