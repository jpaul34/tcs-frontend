import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '@features/products/services/product.service';
import { finalize } from 'rxjs';
import {
  dateMinTodayValidator,
  idExistsAsyncValidator,
} from '@features/products/validators/product.validators';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private changeDetectorRef = inject(ChangeDetectorRef);

  productForm!: FormGroup;
  minDate: string = '';

  isEditMode = false;
  isLoading = false;
  currentProductId: string | null = null;
  submitError: string | null = null;

  ngOnInit(): void {
    this.setMinDate();
    this.initForm();
    this.setupDateRevisionLogic();
    this.checkEditMode();
  }

  private setMinDate(): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    this.minDate = `${year}-${month}-${day}`;
  }

  private initForm(): void {
    this.productForm = this.formBuilder.group({
      id: [
        '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(10)],
        [idExistsAsyncValidator(this.productService)],
      ],
      name: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      logo: ['', Validators.required],
      date_release: ['', [Validators.required, dateMinTodayValidator]],
      date_revision: [{ value: '', disabled: true }, Validators.required],
    });
  }

  private checkEditMode(): void {
    this.currentProductId = this.route.snapshot.paramMap.get('id');

    if (this.currentProductId) {
      this.isEditMode = true;
      this.productForm.get('id')?.disable();
      this.loadProductData(this.currentProductId);
    }
  }

  private loadProductData(id: string): void {
    this.isLoading = true;

    this.productService
      .getProductById(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
        }),
      )
      .subscribe({
        next: (product) => {
          if (product) {
            const formattedProduct = {
              ...product,
              date_release: new Date(product.date_release).toISOString().split('T')[0],
              date_revision: new Date(product.date_revision).toISOString().split('T')[0],
            };

            this.productForm.patchValue(formattedProduct);
          } else {
            this.router.navigate(['/products']);
          }
        },
        error: (err) => {
          console.error('Error al obtener el producto:', err);
          this.router.navigate(['/products']);
        },
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
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode && this.productForm.pristine) {
      this.router.navigate(['/products']);
      return;
    }

    this.isLoading = true;
    this.submitError = null;
    this.changeDetectorRef.detectChanges();

    const productData = this.productForm.getRawValue();

    if (this.isEditMode && this.currentProductId) {
      this.productService
        .updateProduct(this.currentProductId, productData)
        .pipe(
          finalize(() => {
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
          }),
        )
        .subscribe({
          next: () => this.router.navigate(['/products']),
          error: (err) => {
            console.error('Error al actualizar:', err);
            this.submitError = 'No se pudo actualizar el producto.';
            this.changeDetectorRef.detectChanges();
          },
        });
    } else {
      this.productService
        .createProduct(productData)
        .pipe(
          finalize(() => {
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
          }),
        )
        .subscribe({
          next: () => this.router.navigate(['/products']),
          error: (err) => {
            console.error('Error al crear:', err);
            this.submitError = 'No se pudo crear el producto. Por favor, intente más tarde.';
            this.changeDetectorRef.detectChanges();
          },
        });
    }
  }

  onReset(): void {
    this.isEditMode && this.currentProductId
      ? this.loadProductData(this.currentProductId)
      : this.productForm.reset();
  }
}
