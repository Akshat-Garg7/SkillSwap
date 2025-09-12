import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Adjust path if needed

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // 1. Inject the AuthService to get the token
  const authService = inject(AuthService);
  const authToken = authService.getAuthToken(); // Assuming you have a getToken() method

  // 2. If no token, pass the original request along
  if (!authToken) {
    return next(req);
  }

  // 3. If a token exists, clone the request and add the authorization header
  const clonedReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${authToken}`),
  });

  // 4. Pass the cloned request to the next handler
  return next(clonedReq);
};