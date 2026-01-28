import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ROUTE_STORAGE_KEY = "zenfi_last_route";
const ALLOWED_ROUTES = ["/dashboard", "/history", "/support", "/settings", "/admin", "/referral", "/community", "/buy-zfc"];

export const useRouteHistory = () => {
  const location = useLocation();

  useEffect(() => {
    // Only persist allowed routes
    if (ALLOWED_ROUTES.includes(location.pathname)) {
      localStorage.setItem(ROUTE_STORAGE_KEY, location.pathname);
    }
  }, [location.pathname]);
};

export const getLastRoute = (): string | null => {
  return localStorage.getItem(ROUTE_STORAGE_KEY);
};

export const useRestoreRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect from root or login if user was previously on a different page
    if (location.pathname === "/" || location.pathname === "/login") {
      const lastRoute = getLastRoute();
      if (lastRoute && ALLOWED_ROUTES.includes(lastRoute)) {
        navigate(lastRoute, { replace: true });
      }
    }
  }, []);
};
