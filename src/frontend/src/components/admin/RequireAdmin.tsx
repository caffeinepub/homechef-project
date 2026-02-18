import React, { ReactNode } from 'react';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();

  if (isLoading) {
    return (
      <div className="container py-16">
        <p className="text-center text-muted-foreground">Checking permissions...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container max-w-md mx-auto py-16">
        <Card className="border-destructive">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have permission to access this page</CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            This area is restricted to administrators only.
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
