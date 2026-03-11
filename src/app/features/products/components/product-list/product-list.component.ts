import { Component, inject, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, finalize, map, Observable, startWith } from 'rxjs';

import { ProductService } from '@features/products/services/product.service';
import { Product } from '@features/products/models/product.interface';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SkeletonLoaderComponent,
    ReactiveFormsModule,
    ModalComponent,
    DropdownComponent,
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);

  filteredProducts$!: Observable<Product[]>;

  searchControl = new FormControl('');
  pageSizeControl = new FormControl(5);
  resultsCount = 0;

  showMenuForId: string | null = null;
  productToDelete: Product | null = null;
  menuPosition = { top: 0, left: 0 };
  isDeleting: boolean = false;
  deleteError: string | null = null;

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    const productsData$ = this.productService.getProducts();
    const search$ = this.searchControl.valueChanges.pipe(startWith(this.searchControl.value || ''));
    const pageSize$ = this.pageSizeControl.valueChanges.pipe(
      startWith(this.pageSizeControl.value || 5),
    );

    this.filteredProducts$ = combineLatest([productsData$, search$, pageSize$]).pipe(
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

  toggleMenu(id: string, event: Event): void {
    event.stopPropagation();

    if (this.showMenuForId === id) {
      this.showMenuForId = null;
      return;
    }

    this.showMenuForId = id;

    const btn = event.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();

    this.menuPosition = {
      top: rect.bottom + 2,
      left: rect.right - 130,
    };
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.action-menu-container')) {
      this.showMenuForId = null;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.showMenuForId = null;
  }

  onTableScroll(): void {
    this.showMenuForId = null;
  }

  openDeleteModal(product: Product): void {
    this.productToDelete = product;
    this.showMenuForId = null;
    this.deleteError = null;
  }

  closeModal(): void {
    this.productToDelete = null;
  }

  confirmDelete(): void {
    if (!this.productToDelete) return;

    this.isDeleting = true;
    this.cdr.detectChanges();

    this.productService
      .deleteProduct(this.productToDelete.id)
      .pipe(
        finalize(() => {
          this.isDeleting = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.closeModal();
          this.loadProducts();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          this.deleteError = 'El producto no pudo ser eliminado. Por favor, inténte más tarde.';
          this.cdr.detectChanges();
        },
      });
  }
}
