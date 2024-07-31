import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const userGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  console.log('userGuard - isAuthenticated:', isAuthenticated, 'isAdmin:', isAdmin);

  if (isAuthenticated && !isAdmin) {
    return true;
  } else if (isAuthenticated && isAdmin) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

export const userChildGuard: CanActivateChildFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  console.log('userChildGuard - isAuthenticated:', isAuthenticated, 'isAdmin:', isAdmin);

  if (isAuthenticated && !isAdmin) {
    router.navigate(['/analysis']);
    return false;
  } else {
    return true;
  }
};
