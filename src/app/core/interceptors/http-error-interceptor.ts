import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error desconocido';

      if (req.url.includes('/verification')) {
        return throwError(() => error);
      }

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error de cliente: ${error.error.message}`;
      } else {
        if (error.status === 400) {
          errorMessage = error.error.message || 'Datos inválidos enviados al servidor.';
        } else if (error.status === 404) {
          errorMessage = error.error.message || 'Recurso no encontrado.';
        } else {
          errorMessage = `Código de error ${error.status}: ${error.message}`;
        }
      }

      console.error('El interceptor capturó el error:', errorMessage);

      return throwError(() => new Error(errorMessage));
    }),
  );
};
