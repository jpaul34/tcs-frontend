import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  @Input() title: string = 'Confirmar acción';
  @Input() message: string = '¿Estás seguro de realizar esta acción?';
  @Input() cancelText: string = 'Cancelar';
  @Input() confirmText: string = 'Confirmar';
  @Input() isProcessing: boolean = false;
  @Input() errorMessage: string | null = null;

  @Output() confirmAction = new EventEmitter<void>();
  @Output() cancelAction = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmAction.emit();
  }

  onCancel(): void {
    this.cancelAction.emit();
  }
}
