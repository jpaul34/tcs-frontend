import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { catchError, map, Observable, of, switchMap, timer } from 'rxjs';

export function dateMinTodayValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const selectedDate = new Date(control.value + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return selectedDate >= today ? null : { minDateInvalid: true };
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private router = inject(Router);

  productForm!: FormGroup;
  minDate: string = '';

  ngOnInit(): void {
    this.setMinDate();
    this.initForm();
    this.setupDateRevisionLogic();
  }

  private setMinDate(): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    this.minDate = `${year}-${month}-${day}`;
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      id: [
        '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(10)],
        [this.idAsyncValidator()],
      ],
      name: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      logo: ['', Validators.required],
      date_release: ['', [Validators.required, dateMinTodayValidator]],
      date_revision: [{ value: '', disabled: true }, Validators.required],
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.productForm.get(controlName);
    if (!control || !control.errors) return '';

    const messages: Record<string, string> = {
      required: 'Este campo es requerido!',
      minlength: `Mínimo ${control.errors['minlength']?.requiredLength} caracteres`,
      maxlength: `Máximo ${control.errors['maxlength']?.requiredLength} caracteres`,
      minDateInvalid: 'La fecha debe ser igual o mayor a la actual',
      idExists: 'El ID ya está en uso',
    };

    const firstErrorKey = Object.keys(control.errors)[0];
    return messages[firstErrorKey] || 'Campo inválido';
  }

  private idAsyncValidator() {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) return of(null);

      return timer(500).pipe(
        switchMap((value) => this.productService.verifyProductId(control.value)),
        map((exists) => (exists ? { idExists: true } : null)),
        catchError(() => of(null)),
      );
    };
  }

  private setupDateRevisionLogic(): void {
    this.productForm.get('date_release')?.valueChanges.subscribe((releaseDate) => {
      const releaseControl = this.productForm.get('date_release');

      if (releaseDate && releaseControl?.valid) {
        const dateObj = new Date(releaseDate + 'T00:00:00');
        dateObj.setFullYear(dateObj.getFullYear() + 1);

        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');

        this.productForm.get('date_revision')?.setValue(`${year}-${month}-${day}`);
      } else {
        this.productForm.get('date_revision')?.setValue('');
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const productData = this.productForm.getRawValue();

      this.productService.createProduct(productData).subscribe({
        next: () => this.router.navigate(['/products']),
        error: (err) => console.error('Error al guardar:', err),
      });
    } else {
      this.productForm.markAllAsTouched();
    }
  }

  onReset(): void {
    this.productForm.reset();
  }
}
