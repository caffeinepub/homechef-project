import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

const INTENDED_ROUTE_KEY = 'intendedRoute';

export function useAuthRedirect() {
  const navigate = useNavigate();

  const storeIntendedRoute = (route: string) => {
    sessionStorage.setItem(INTENDED_ROUTE_KEY, route);
  };

  const getIntendedRoute = (): string | null => {
    return sessionStorage.getItem(INTENDED_ROUTE_KEY);
  };

  const clearIntendedRoute = () => {
    sessionStorage.removeItem(INTENDED_ROUTE_KEY);
  };

  const redirectToIntended = () => {
    const intended = getIntendedRoute();
    clearIntendedRoute();
    if (intended && intended !== '/') {
      navigate({ to: intended as any });
    } else {
      navigate({ to: '/' });
    }
  };

  return {
    storeIntendedRoute,
    getIntendedRoute,
    clearIntendedRoute,
    redirectToIntended,
  };
}
