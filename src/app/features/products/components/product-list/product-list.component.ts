import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.interface';
import { combineLatest, map, Observable, startWith } from 'rxjs';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, SkeletonLoaderComponent, ReactiveFormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);

  filteredProducts$!: Observable<Product[]>;

  searchControl = new FormControl('');
  pageSizeControl = new FormControl(5);

  resultsCount = 0;

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    // const productsData = this.productService.getProducts();
    const productsData = new Observable<Product[]>((subscriber) => {
      setTimeout(() => {
        subscriber.next([
          {
            id: '1',
            name: 'Product 1',
            description: 'Description 1',
            date_release: '2022-01-01',
            date_revision: '2022-01-01',
            logo: 'https://resources.ripplematch.com/hubfs/Tata%20Consultancy%20Services-1.png',
          },
          {
            id: '2',
            name: 'Product 2',
            description: 'Description 2',
            date_release: '2022-01-01',
            date_revision: '2022-01-01',
            logo: 'https://resources.ripplematch.com/hubfs/Tata%20Consultancy%20Services-1.png',
          },
          {
            id: '3',
            name: 'Product 3',
            description: 'Description 3',
            date_release: '2022-01-01',
            date_revision: '2022-01-01',
            logo: 'https://resources.ripplematch.com/hubfs/Tata%20Consultancy%20Services-1.png',
          },
          {
            id: '4',
            name: 'Product 4',
            description: 'Description 4',
            date_release: '2022-01-01',
            date_revision: '2022-01-01',
            logo: 'https://resources.ripplematch.com/hubfs/Tata%20Consultancy%20Services-1.png',
          },
          {
            id: '5',
            name: 'Product 5',
            description: 'Description 5',
            date_release: '2022-01-01',
            date_revision: '2022-01-01',
            logo: 'https://resources.ripplematch.com/hubfs/Tata%20Consultancy%20Services-1.png',
          },
          {
            id: '6',
            name: 'Product 6',
            description: 'Description 6',
            date_release: '2022-01-01',
            date_revision: '2022-01-01',
            logo: 'https://resources.ripplematch.com/hubfs/Tata%20Consultancy%20Services-1.png',
          },
          {
            id: '7',
            name: 'Product 7',
            description: 'Description 7',
            date_release: '2022-01-01',
            date_revision: '2022-01-01',
            logo: 'https://resources.ripplematch.com/hubfs/Tata%20Consultancy%20Services-1.png',
          },
          {
            id: '8',
            name: 'Product 8',
            description: 'Description 8',
            date_release: '2022-01-01',
            date_revision: '2022-01-01',
            logo: 'https://resources.ripplematch.com/hubfs/Tata%20Consultancy%20Services-1.png',
          },
          {
            id: '9',
            name: 'Product 9',
            description: 'Description 9',
            date_release: '2022-01-01',
            date_revision: '2022-01-01',
            logo: 'https://resources.ripplematch.com/hubfs/Tata%20Consultancy%20Services-1.png',
          },
          {
            id: '10',
            name: 'Product 10',
            description: 'Description 10',
            date_release: '2022-01-01',
            date_revision: '2022-01-01',
            logo: 'https://resources.ripplematch.com/hubfs/Tata%20Consultancy%20Services-1.png',
          },
        ]);
        subscriber.complete();
      }, 1000);
    });

    const search$ = this.searchControl.valueChanges.pipe(startWith(this.searchControl.value || ''));
    const pageSize$ = this.pageSizeControl.valueChanges.pipe(
      startWith(this.pageSizeControl.value || 5),
    );

    this.filteredProducts$ = combineLatest([productsData, search$, pageSize$]).pipe(
      map(([products, searchTerm, pageSize]) => {
        let filtered = products;

        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered = products.filter(
            (p) =>
              p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term),
          );
        }

        this.resultsCount = filtered.length;
        return filtered.slice(0, Number(pageSize));
      }),
    );
  }
}
