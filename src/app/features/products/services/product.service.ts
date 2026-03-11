import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { Product, ApiResponse } from '@features/products/models/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apiUrl = '/bp/products';
  private readonly http = inject(HttpClient);

  getProducts(): Observable<Product[]> {
    return this.http
      .get<ApiResponse<Product[]>>(this.apiUrl)
      .pipe(map((response) => response.data));
  }

  createProduct(product: Product): Observable<Product> {
    return this.http
      .post<ApiResponse<Product>>(this.apiUrl, product)
      .pipe(map((response) => response.data));
  }

  updateProduct(id: string, product: Product): Observable<Product> {
    return this.http
      .put<ApiResponse<Product>>(`${this.apiUrl}/${id}`, product)
      .pipe(map((response) => response.data));
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(map(() => void 0));
  }

  verifyProductId(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/verification/${id}`).pipe(
      map((res) => !!res),
      catchError(() => of(false)),
    );
  }
}
