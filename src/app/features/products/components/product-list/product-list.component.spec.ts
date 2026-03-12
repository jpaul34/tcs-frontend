import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductListComponent } from './product-list.component';
import { firstValueFrom, of, skip, take, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { ProductService } from '@features/products/services/product.service';
import { Product } from '@features/products/models/product.interface';

const mockProduct: Product = {
  id: 'trj-crd',
  name: 'Tarjetas de Crédito',
  description: 'Tarjeta de consumo bajo la modalidad de crédito',
  logo: 'https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg',
  date_release: '2023-02-01',
  date_revision: '2024-02-01',
};

describe('ProductList', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;

  const mockProductService = {
    getProducts: () => of([mockProduct]),
    deleteProduct: (id: string) => of(void 0),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [provideRouter([]), { provide: ProductService, useValue: mockProductService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  /***********/

  it('should load products from the mock service', async () => {
    fixture.detectChanges();

    const products = await firstValueFrom(component.filteredProducts$.pipe(take(1)));

    expect(products.length).toBe(1);
    expect(products[0].id).toBe(mockProduct.id);
  });

  it('should filter products when searching by name or description', async () => {
    component.searchControl.setValue('tarjeta');
    fixture.detectChanges();

    const filtered = await firstValueFrom(component.filteredProducts$);

    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toContain('Tarjetas');
  });

  it('should return empty list if search does not match', async () => {
    fixture.detectChanges();

    const filterPromise = firstValueFrom(component.filteredProducts$.pipe(skip(1)));

    component.searchControl.setValue('producto-inexistente');
    fixture.detectChanges();

    const filtered = await filterPromise;
    expect(filtered.length).toBe(0);
    expect(component.resultsCount).toBe(0);
  });

  it('should update resultsCount to match ONLY the displayed items after pagination', async () => {
    const manyProducts: Product[] = Array(10).fill({ ...mockProduct });
    vi.spyOn(mockProductService, 'getProducts').mockReturnValue(of(manyProducts));

    component.ngOnInit();
    fixture.detectChanges();

    const filterPromise = firstValueFrom(component.filteredProducts$.pipe(skip(1)));
    component.pageSizeControl.setValue(5);
    fixture.detectChanges();

    await filterPromise;

    expect(component.resultsCount).toBe(5);
    expect(component.resultsCount).not.toBe(10);
  });

  it('should toggle and position the action menu', () => {
    const mockEvent = {
      stopPropagation: vi.fn(),
      currentTarget: {
        getBoundingClientRect: () => ({ bottom: 100, right: 200 }),
      },
    } as any;

    component.toggleMenu(mockProduct.id, mockEvent);

    expect(component.showMenuForId).toBe(mockProduct.id);
    expect(component.menuPosition.top).toBe(102);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();

    component.toggleMenu(mockProduct.id, mockEvent);
    expect(component.showMenuForId).toBeNull();
  });

  it('should close menus on resize, scroll or outside click', () => {
    component.showMenuForId = mockProduct.id;

    component.onResize();
    expect(component.showMenuForId).toBeNull();

    component.showMenuForId = mockProduct.id;
    component.onTableScroll();
    expect(component.showMenuForId).toBeNull();

    const mockEvent = { target: document.createElement('div') } as any;
    component.onClickOutside(mockEvent);
    expect(component.showMenuForId).toBeNull();
  });

  it('should prepare the modal with the selected product', () => {
    component.showMenuForId = mockProduct.id;
    component.openDeleteModal(mockProduct);

    expect(component.productToDelete).toEqual(mockProduct);
    expect(component.showMenuForId).toBeNull();
  });

  it('should call delete service and reload on confirmDelete', () => {
    fixture.detectChanges();
    component.productToDelete = mockProduct;
    const deleteSpy = vi.spyOn(mockProductService, 'deleteProduct');
    const loadSpy = vi.spyOn(component, 'loadProducts');

    component.confirmDelete();

    expect(deleteSpy).toHaveBeenCalledWith(mockProduct.id);
    expect(loadSpy).toHaveBeenCalled();
    expect(component.productToDelete).toBeNull();
  });

  it('should handle delete error and set deleteError message', () => {
    fixture.detectChanges();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    component.productToDelete = mockProduct;
    vi.spyOn(mockProductService, 'deleteProduct').mockReturnValue(
      throwError(() => new Error('API Fail')),
    );

    component.confirmDelete();

    expect(component.isDeleting).toBe(false);
    expect(component.deleteError).not.toBeNull();
    consoleSpy.mockRestore();
  });
});
