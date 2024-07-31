
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  console.log('authGuard - isAuthenticated:', isAuthenticated, 'isAdmin:', isAdmin);


  console.log(isAuthenticated);
  
  if (!isAuthenticated) {
    router.navigate(['/login']);
    return false;
  }

  const requiresAdmin = route.data && route.data['role'] === 'admin';
  
  if (requiresAdmin && !isAdmin) {
    router.navigate(['/analysis']);
    return false;
  }

  if (!requiresAdmin && !isAdmin) {
    // User is normal user, allow access to analysis and search only
    if (route.routeConfig?.path !== 'analysis' && route.routeConfig?.path !== 'search') {
      router.navigate(['/analysis']);
      return false;
    }
    return true;
  }

  return true;
};
