import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.interface';
import { Observable } from 'rxjs';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, SkeletonLoaderComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);

  products$!: Observable<Product[]>;

  resultsCount = 0;
  pageSize = 5;

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    // this.products$ = this.productService.getProducts();
    this.products$ = new Observable<Product[]>((subscriber) => {
      setTimeout(() => {
        subscriber.next([
          {
            id: '1',
            name: 'Product 1',
            description: 'Description 1',
            date_release: '2022-01-01',
            date_revision: '2022-01-01',
            logo: 'https://via.placeholder.com/40',
          },
          {
            id: '2',
            name: 'Product 2',
            description: 'Description 2',
            date_release: '2022-01-01',
            date_revision: '2022-01-01',
            logo: 'https://via.placeholder.com/40',
          },
          {
            id: '3',
            name: 'Product 3',
            description: 'Description 3',
            date_release: '2022-01-01',
            date_revision: '2022-01-01',
            logo: 'https://via.placeholder.com/40',
          },
        ]);
        subscriber.complete();
      }, 1000);
    });
  }
}
