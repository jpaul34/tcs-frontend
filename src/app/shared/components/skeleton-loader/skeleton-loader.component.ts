import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  template: `
    <div class="skeleton-container">
      @for (item of items; track $index) {
        <div class="skeleton-row" [style.height]="height"></div>
      }
    </div>
  `,
  styles: [
    `
      .skeleton-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .skeleton-row {
        width: 100%;
        background: #e2e8f0;
        border-radius: 4px;
        animation: pulse 1.5s infinite ease-in-out;
      }

      @keyframes pulse {
        0% {
          opacity: 1;
        }
        50% {
          opacity: 0.4;
        }
        100% {
          opacity: 1;
        }
      }
    `,
  ],
})
export class SkeletonLoaderComponent {
  @Input() rows: number = 3;
  @Input() height: string = '45px';

  get items() {
    return Array(this.rows).fill(0);
  }
}
