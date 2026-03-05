import { Component, inject } from '@angular/core';
import { FavoritesService } from '../../services/favorites';
import { WifiService } from '../../services/wifi.service';
import { WifiPoint } from '../../interfaces/wifi.interface';

@Component({
  selector: 'app-favorites-list',
  standalone: true,
  imports: [],
  templateUrl: './favorites-list.html',
  styleUrl: './favorites-list.scss'
})
export class FavoritesList {
  public favoritesService = inject(FavoritesService);
  public wifiService = inject(WifiService);

  /**
   * Obtiene el objeto completo del punto a partir de su ID
   * buscando en el signal de puntos originales.
   */
  getFullPoint(id: string): WifiPoint | undefined {
    return this.wifiService.points().find(p => String(p.id) === id);
  }

  /**
   * Centra el mapa en el favorito seleccionado
   */
  selectFavorite(punto: WifiPoint): void {
    this.wifiService.selectedPoint.set(punto);
  }
}