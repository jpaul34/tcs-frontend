import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  /**********************/

  it('should display the dynamic message from @Input', () => {
    const testMsg = '¿Seguro que quieres borrar este crédito?';
    component.message = testMsg;
    fixture.detectChanges();

    const h3 = fixture.nativeElement.querySelector('h3');
    expect(h3?.textContent).toContain(testMsg);
  });

  it('should emit confirmAction when onConfirm is called', () => {
    fixture.detectChanges();
    const spy = vi.spyOn(component.confirmAction, 'emit');
    component.onConfirm();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit cancelAction when onCancel is called', () => {
    fixture.detectChanges();
    const spy = vi.spyOn(component.cancelAction, 'emit');
    component.onCancel();
    expect(spy).toHaveBeenCalled();
  });
});
