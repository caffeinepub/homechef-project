import React, { ReactNode, useEffect } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useAuthRedirect } from '../../hooks/useAuthRedirect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { storeIntendedRoute } = useAuthRedirect();

  useEffect(() => {
    if (!identity && loginStatus !== 'logging-in') {
      storeIntendedRoute(window.location.pathname);
    }
  }, [identity, loginStatus, storeIntendedRoute]);

  if (!identity) {
    return (
      <div className="container max-w-md mx-auto py-16">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access this page</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={login} disabled={loginStatus === 'logging-in'} size="lg">
              <LogIn className="mr-2 h-5 w-5" />
              {loginStatus === 'logging-in' ? 'Logging in...' : 'Sign In'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
