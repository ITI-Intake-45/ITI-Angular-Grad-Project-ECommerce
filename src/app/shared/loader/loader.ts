import { Component } from '@angular/core';

@Component({
  standalone:false,
  selector: 'app-loading',
  template: `
    <div class="loading">
      <div class="spinner"></div>
    </div>
  `,
  styles: [
    `
      .loading {
        display: flex;
        justify-content: center;
        padding: 20px;
      }
      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #ddd;
        border-top: 4px solid #28a745;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `
  ]
})
export class Loader {}