import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  console.log('adminGuard - isAuthenticated:', isAuthenticated, 'isAdmin:', isAdmin);

  if (isAuthenticated && isAdmin) {
    return true;}
   else if (isAuthenticated && !isAdmin) {
    router.navigate(['/analysis']);
    return false;
  } 
  else {
    router.navigate(['/login']);
    return false;
  }
};
