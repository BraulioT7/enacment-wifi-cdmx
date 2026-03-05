import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { WifiService } from '../../services/wifi.service';
import { FavoritesService } from '../../services/favorites';
import { WifiPoint } from '../../interfaces/wifi.interface';

@Component({
  selector: 'app-point-details',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './point-details.html', // Ruta al nuevo archivo
  styleUrl: './point-details.scss'    // Ruta al nuevo archivo
})
export class PointDetails {
  public wifiService = inject(WifiService);
  public favoritesService = inject(FavoritesService);

  public isSaving = signal<boolean>(false);
  public saveSuccess = signal<boolean>(false);

  closePanel(): void {
    // Liberar la memoria y ocultar el panel
    this.wifiService.selectedPoint.set(null);
    this.resetState();
  }

async toggleFavorite(punto: WifiPoint): Promise<void> {
    this.isSaving.set(true);
    const targetId = String(punto.id);
    const isAlreadyFav = this.favoritesService.favoriteIds().has(targetId);

    try {
      if (isAlreadyFav) {
        await this.favoritesService.removeFavorite(targetId);
      } else {
        await this.favoritesService.saveFavorite(punto);
      }
    } catch (error) {
      // Atrapa cualquier excepción síncrona o asíncrona que escape del servicio
      console.error('[PointDetails] Falla crítica al alterar favorito:', error);
      
      // Aseguramos que el usuario vea un mensaje incluso si el servicio falló en emitirlo
      this.favoritesService.error.set('Ocurrió un error inesperado al procesar la solicitud.');
    } finally {
      // Garantiza la liberación de la UI sin importar el resultado
      this.isSaving.set(false);
    }
  }

  private resetState(): void {
    this.isSaving.set(false);
    this.saveSuccess.set(false);
  }
}