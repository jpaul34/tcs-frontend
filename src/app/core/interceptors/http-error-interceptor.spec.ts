import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpErrorResponse,
  HttpInterceptorFn,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';

import { httpErrorInterceptor } from './http-error-interceptor';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('httpErrorInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => httpErrorInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  /***************************/

  it('should pass the request through when no error occurs', () => {
    httpClient.get('/test').subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne('/test');
    req.flush({ data: 'ok' });
  });

  it('should handle HttpErrorResponse and propagate the error', () => {
    const status = 404;
    const statusText = 'Not Found';

    httpClient.get('/error').subscribe({
      next: () => expect.fail('La petición debería haber fallado y no emitir un valor'),
      error: (error: any) => {
        expect(error).toBeTruthy();

        if (error.status) {
          expect(error.status).toBe(status);
        }
      },
    });

    const req = httpMock.expectOne('/error');
    req.flush('Error', { status, statusText });
  });
});
