import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductFormComponent } from './product-form.component';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { ProductService } from '@features/products/services/product.service';

const generateMockProduct = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextYear = new Date(tomorrow);
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  return {
    id: 'trj-crd',
    name: 'Tarjetas de Crédito',
    description: 'Tarjeta de consumo bajo la modalidad de crédito',
    logo: 'https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg',
    date_release: tomorrow.toISOString().split('T')[0],
    date_revision: nextYear.toISOString().split('T')[0],
  };
};

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;

  const mockProductService = {
    verifyProductId: () => of(false),
    getProductById: () => of({}),
    createProduct: () => of({}),
    updateProduct: () => of({}),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormComponent],
      providers: [provideRouter([]), { provide: ProductService, useValue: mockProductService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /*******************************/

  it('should call createProduct when form is valid and NOT in edit mode', () => {
    const createSpy = vi.spyOn(mockProductService, 'createProduct');
    const validProductData = generateMockProduct();

    component.productForm.get('id')?.clearAsyncValidators();
    component.productForm.patchValue(validProductData);

    expect(component.productForm.valid).toBeTruthy();
    component.onSubmit();

    expect(createSpy).toHaveBeenCalled();
  });

  it('should call updateProduct when form is valid and IS in edit mode', () => {
    const validProductData = generateMockProduct();

    component.isEditMode = true;
    component.currentProductId = validProductData.id;
    const updateSpy = vi.spyOn(mockProductService, 'updateProduct');

    validProductData.description = 'Descripción modificada para forzar el dirty';

    component.productForm.patchValue(validProductData);
    component.productForm.markAsDirty();
    component.onSubmit();

    expect(updateSpy).toHaveBeenCalledWith(
      validProductData.id,
      component.productForm.getRawValue(),
    );
  });
});
