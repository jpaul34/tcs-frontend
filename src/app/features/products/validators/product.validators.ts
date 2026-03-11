import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs';
import { ProductService } from '@features/products/services/product.service';

export function dateMinTodayValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const selectedDate = new Date(control.value + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return selectedDate >= today ? null : { minDateInvalid: true };
}

export function idExistsAsyncValidator(productService: ProductService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);

    return timer(500).pipe(
      switchMap(() => productService.verifyProductId(control.value)),
      map((exists) => (exists ? { idExists: true } : null)),
      catchError(() => of(null)),
    );
  };
}
