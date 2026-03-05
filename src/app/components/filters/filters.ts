import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { WifiService } from '../../services/wifi.service';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="filter-container">
      <div class="controls-row">
        <div class="control-group">
          <label for="alcaldia-select">Filtrar por Alcaldía:</label>
          <select id="alcaldia-select" (change)="onFilterChange($event)">
            @for (alcaldia of wifiService.alcaldiasDisponibles(); track alcaldia) {
              <option [value]="alcaldia">{{ alcaldia }}</option>
            }
          </select>
        </div>
        
        <button class="geo-btn" (click)="findNearest()">
          📍 Encontrar más cercanos a mí
        </button>
      </div>

      @if (wifiService.userLocation()) {
        <div class="results-panel">
          <h4>Top 3 Recomendaciones por Proximidad:</h4>
          <div class="cards-grid">
            @for (punto of wifiService.filteredPoints().slice(0, 3); track punto.id) {
              <div class="result-card" (click)="selectPoint(punto)">
                <strong>{{ punto.programa }}</strong>
                <span>{{ punto.alcaldia }}</span>
                <span>Distancia: {{ punto.distancia | number:'1.1-2' }} km</span>
                <span class="score">⭐ Score IA: {{ punto.score }}/100</span>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .filter-container { margin-bottom: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 1px solid #ddd; }
    .controls-row { display: flex; justify-content: space-between; align-items: center; }
    select { margin-left: 10px; padding: 6px; border-radius: 4px; border: 1px solid #ccc; }
    .geo-btn { padding: 8px 16px; background: #0056b3; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; transition: background 0.2s; }
    .geo-btn:hover { background: #004494; }
    .results-panel { margin-top: 15px; padding-top: 15px; border-top: 1px solid #ccc; }
    .cards-grid { display: flex; gap: 10px; margin-top: 10px; }
    .result-card { background: white; padding: 12px; border-radius: 6px; border: 1px solid #eee; box-shadow: 0 2px 5px rgba(0,0,0,0.05); display: flex; flex-direction: column; font-size: 0.9em; flex: 1; }
    .score { color: #28a745; font-weight: bold; margin-top: 5px; }
  `]
})
export class Filters {
  public wifiService = inject(WifiService);

  onFilterChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.wifiService.filterAlcaldia.set(selectElement.value);
  }

  findNearest(): void {
    this.wifiService.requestUserLocation();
  }

  selectPoint(punto: any): void { // Usa la interfaz WifiPoint si la tienes importada
  this.wifiService.selectedPoint.set(punto);
  }
}