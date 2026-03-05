import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WifiMap } from './components/map/map';
import { Filters } from './components/filters/filters';
import { WifiService } from './services/wifi.service'; // Inyección del servicio
import { PointDetails } from './components/point-details/point-details';
import { FavoritesList } from './components/favorites-list/favorites-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WifiMap, Filters, PointDetails, FavoritesList],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'wifi-explorer-cdmx';
  public wifiService = inject(WifiService); // Exponemos el servicio a la vista

  ngOnInit(): void {
    // La orquestación de datos inicia en el nivel superior
    this.wifiService.loadPoints();
  }
}