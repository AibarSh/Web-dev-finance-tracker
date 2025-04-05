import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { AuthService } from "./auth.service";
import { inject } from "@angular/core";
import { catchError, Observable, switchMap, throwError } from "rxjs";

let isRefreshing = false;

export const authTokenInterceptorFn : HttpInterceptorFn = (
    req : HttpRequest<any>, 
    next : HttpHandlerFn
) => {
  const authService : AuthService = inject(AuthService);
  const accessToken = authService.accessToken;

  if (!accessToken) {
    console.log('nema');
  }

  if (isRefreshing) {
    return refreshTokenInterceptor(authService, req, next);
  }

  return next(addTokenToHeaders(req, accessToken)).pipe(
    catchError(err => {
      if (err.status === 403) {
        return refreshTokenInterceptor(authService, req, next);
      }

      return throwError(() => err);
    })
  );
}

const refreshTokenInterceptor = (
  authService : AuthService, 
  req : HttpRequest<any>,   
  next : HttpHandlerFn
) => {

  if (!isRefreshing) {
    isRefreshing = true;
    return authService.refreshAuthToken()
    .pipe(
      switchMap((res) => {
        isRefreshing = false;
        return next(addTokenToHeaders(req, res.access));
      })
    );
  }

  return next(addTokenToHeaders(req, authService.accessToken));
}

const addTokenToHeaders = (req : HttpRequest<any>, token : string | null) => {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}