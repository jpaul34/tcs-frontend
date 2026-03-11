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
    const productsData = this.productService.getProducts();
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
