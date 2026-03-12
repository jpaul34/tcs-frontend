import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownComponent } from './dropdown.component';

describe('DropdownComponent', () => {
  let component: DropdownComponent;
  let fixture: ComponentFixture<DropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownComponent);
    component = fixture.componentInstance;
  });

  /************************/

  it('should not show content when isOpen is false', () => {
    component.isOpen = false;

    fixture.detectChanges();

    const menu = fixture.nativeElement.querySelector('.dropdown-menu');
    expect(menu).toBeNull();
  });

  it('should show content when isOpen is true', () => {
    component.isOpen = true;

    fixture.detectChanges();

    const menu = fixture.nativeElement.querySelector('.dropdown-menu');
    expect(menu).not.toBeNull();
  });

  it('should apply the correct position styles with units', () => {
    const mockPosition = { top: 150, left: 300 };
    component.isOpen = true;
    component.position = mockPosition;

    fixture.detectChanges();

    const menu = fixture.nativeElement.querySelector('.dropdown-menu') as HTMLElement;
    expect(menu).not.toBeNull();
    expect(menu.style.top).toBe(`${mockPosition.top}px`);
    expect(menu.style.left).toBe(`${mockPosition.left}px`);
  });
});
