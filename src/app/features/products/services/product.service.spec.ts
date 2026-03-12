import { TestBed } from '@angular/core/testing';

import { ProductService } from './product.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { ApiResponse, Product } from '../models/product.interface';
import { firstValueFrom } from 'rxjs';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/products`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get all products and return the data array (F1)', () => {
    const mockApiResponse: ApiResponse<Product[]> = {
      data: [
        {
          id: 'uno',
          name: 'Nombre producto',
          description: 'Descripción producto',
          logo: 'assets-1.png',
          date_release: '2025-01-01',
          date_revision: '2025-01-01',
        },
      ],
    };

    service.getProducts().subscribe((result: Product[]) => {
      expect(result).toEqual(mockApiResponse.data);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockApiResponse);
  });

  it('should verify if ID exists and return boolean (F4)', () => {
    const testId = 'uno';
    const mockExistStatus = true;

    service.verifyProductId(testId).subscribe((exists: boolean) => {
      expect(exists).toBe(mockExistStatus);
    });

    const req = httpMock.expectOne(`${baseUrl}/verification/${testId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockExistStatus);
  });

  it('should send a POST request with correct body to create a product (F4)', () => {
    const productToCreate: Product = {
      id: 'dos',
      name: 'Nuevo Producto',
      description: 'Descripción del nuevo producto financiero',
      logo: 'assets-2.png',
      date_release: '2025-01-01',
      date_revision: '2026-01-01',
    };

    const mockResponse: ApiResponse<Product> = {
      message: 'Product added successfully',
      data: productToCreate,
    };

    service.createProduct(productToCreate).subscribe((result: Product) => {
      expect(result).toEqual(productToCreate);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');

    expect(req.request.body).toEqual(productToCreate);

    req.flush(mockResponse);
  });

  it('should get a single product by ID (F5)', () => {
    const mockProduct: Product = {
      id: 'uno',
      name: 'Test',
      description: 'Desc',
      logo: 'logo.png',
      date_release: '2025-01-01',
      date_revision: '2025-01-01',
    };

    service.getProductById('uno').subscribe((product: Product) => {
      expect(product.id).toBe('uno');
    });

    const req = httpMock.expectOne(`${baseUrl}/uno`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProduct);
  });

  it('should send a PUT request to update an existing product (F5)', () => {
    const productId = 'uno';
    const updatedProduct: Product = {
      id: productId,
      name: 'Nombre actualizado',
      description: 'Descripción actualizada',
      logo: 'assets-1.png',
      date_release: '2025-01-01',
      date_revision: '2025-01-01',
    };

    const mockResponse: ApiResponse<Product> = {
      message: 'Product updated successfully',
      data: updatedProduct,
    };

    service.updateProduct(productId, updatedProduct).subscribe((result: Product) => {
      expect(result.name).toBe('Nombre actualizado');
      expect(result).toEqual(updatedProduct);
    });

    const req = httpMock.expectOne(`${baseUrl}/${productId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedProduct);

    req.flush(mockResponse);
  });

  it('should delete a product (F6)', () => {
    service.deleteProduct('uno').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/uno`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Product removed successfully' });
  });

  it('should handle API error in verifyProductId and return false (Line 43)', async () => {
    const promise = firstValueFrom(service.verifyProductId('error-id'));

    const req = httpMock.expectOne(`${baseUrl}/verification/error-id`);
    req.flush('Error de servidor', { status: 500, statusText: 'Server Error' });

    const result = await promise;
    expect(result).toBe(false);
  });
});
