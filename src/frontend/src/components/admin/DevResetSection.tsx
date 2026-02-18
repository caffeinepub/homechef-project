import React, { useState } from 'react';
import { useDevReset } from '../../hooks/mutations/useDevResetMutation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

export default function DevResetSection() {
  const [confirmText, setConfirmText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const devReset = useDevReset();

  const handleReset = async () => {
    if (confirmText === 'RESET') {
      await devReset.mutateAsync();
      setIsOpen(false);
      setConfirmText('');
    }
  };

  const isConfirmValid = confirmText === 'RESET';

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Development Reset
        </CardTitle>
        <CardDescription>
          Reset all application data including orders, bookings, menu items, and admin assignments. This action cannot
          be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={devReset.isPending}>
              Reset Application Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p>
                  This will permanently delete all data including orders, bookings, menu items, and reset admin
                  assignments. You will be logged out and the next user to log in will become the admin.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Type "RESET" to confirm:</Label>
                  <Input
                    id="confirm"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="RESET"
                    className="font-mono"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmText('')}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReset}
                disabled={!isConfirmValid || devReset.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {devReset.isPending ? 'Resetting...' : 'Reset Application'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
