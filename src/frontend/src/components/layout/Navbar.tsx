import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import { useCart } from '../../cart/CartProvider';
import LoginButton from '../auth/LoginButton';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, ShoppingCart } from 'lucide-react';

export default function Navbar() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = !!identity;

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/cart', label: 'Cart', showAlways: true },
    ...(isAuthenticated ? [{ to: '/orders', label: 'Orders' }] : []),
    ...(isAuthenticated ? [{ to: '/book-chef', label: 'Book Chef' }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <img src="/assets/generated/logo.dim_512x512.png" alt="HomeChef" className="h-10 w-10" />
            <span className="font-bold text-xl hidden sm:inline">HomeChef Kitchen</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium transition-colors hover:text-primary"
                activeProps={{ className: 'text-primary' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate({ to: '/cart' })}
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Button>

          <div className="hidden md:block">
            <LoginButton />
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-lg font-medium transition-colors hover:text-primary"
                    activeProps={{ className: 'text-primary' }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t">
                  <LoginButton />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
