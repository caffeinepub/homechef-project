import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import BookChefPage from './pages/BookChefPage';
import BookingsPage from './pages/BookingsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import MenuAdminPage from './pages/admin/MenuAdminPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import RequireAuth from './components/auth/RequireAuth';
import RequireAdmin from './components/admin/RequireAdmin';
import { CartProvider } from './cart/CartProvider';
import ProfileSetupDialog from './components/auth/ProfileSetupDialog';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ProfileSetupDialog />
      <Toaster />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const menuRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/menu',
  component: MenuPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CartPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  component: () => (
    <RequireAuth>
      <OrdersPage />
    </RequireAuth>
  ),
});

const bookChefRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/book-chef',
  component: () => (
    <RequireAuth>
      <BookChefPage />
    </RequireAuth>
  ),
});

const bookingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bookings',
  component: () => (
    <RequireAuth>
      <BookingsPage />
    </RequireAuth>
  ),
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <RequireAdmin>
      <AdminDashboardPage />
    </RequireAdmin>
  ),
});

const adminMenuRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/menu',
  component: () => (
    <RequireAdmin>
      <MenuAdminPage />
    </RequireAdmin>
  ),
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccessPage,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailurePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  menuRoute,
  cartRoute,
  ordersRoute,
  bookChefRoute,
  bookingsRoute,
  adminDashboardRoute,
  adminMenuRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </ThemeProvider>
  );
}
